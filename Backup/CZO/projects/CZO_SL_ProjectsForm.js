/**
 * Module Description
 * UI for Projects
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jul 2023     CZO-MRC          Timesheet
 *
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */
define([
    '../common/CZO_Constants',
    '../common/CZO_Format',
    '../common/CZO_Runtime',
    '../common/CZO_Script',
    '../common/CZO_ServerWidget',
    '../common/CZO_File',
    '../common/CZO_Folder',
    '../common/CZO_Redirect',
    '../common/CZO_Https',
    '../common/CZO_Url',
    '../common/CZO_Entity',
    '../common/CZO_Project',
    '../common/CZO_Contact',
    '../common/CZO_Specification',
    '../common/CZO_CostCentre',
    '../lib/handlebars'
], (czo_constants, czo_format, czo_runtime, czo_script, czo_serverWidget, czo_file, czo_folder, czo_redirect, czo_https, czo_url, czo_entity, czo_project, czo_contact, czo_specification, czo_costCentre, hb) => {
    const {FileName, ScriptParameter, Field, ProjectStatus, SUITEAPP_ID} = czo_constants;

    const render = (context, fileName, id) => {
        let user = czo_runtime.getCurrentUser();
        let script = czo_runtime.getCurrentScript();
        let profileImage = czo_entity.lookupImage({id: user.id});
        let form = czo_serverWidget.castForm(czo_serverWidget.createForm({title: ' ', hideNavBar: true}));
        let suiteAppFolderId = czo_folder.getFolderId({name: SUITEAPP_ID});
        let domainUrl = context.request.url.substring(0, context.request.url.indexOf('/app'))
        let libPath = czo_runtime.getLibPath(domainUrl);
        let includeFilesUrlMap = {};
        includeFilesUrlMap['name'] = user.name;
        includeFilesUrlMap['profile_image'] = profileImage || [libPath, 'images', FileName.GENERIC_AVATAR_IMG].join('/');
        let htmlFileId = czo_folder.getFileId({folderId: suiteAppFolderId, fileName});
        let htmlFile = czo_file.load({id: htmlFileId});
        let contents = htmlFile.getContents();
        (Object.keys(includeFilesUrlMap)).forEach((fileName) => {
            let url = includeFilesUrlMap[fileName];
            if (url) {
                contents = contents.replace(['{', fileName, '}'].join(''), url);
            }
        });
        let recordType = czo_entity.lookupRecordType({id: user.id});
        let projects = czo_project.searchDetailedList({contractor: czo_entity.isTypeEmployee(recordType) ? '' : user.id, status: ProjectStatus.IN_PROGRESS});
        let projectIds = projects.map(project => project.id);
        if (!id || projectIds.indexOf(id) > -1) {
            let data = {
                libPath,
                projects: id ? [] : projects,
                projectDetails: id ? czo_project.searchDetails({id}) : {},
                contacts: id ? czo_contact.searchDetailedList({project: id}) : [],
            /**   subProjects: id ? czo_project.searchSubProjectList({parentId: czo_project.lookupEntityId({id})}) : [],**/
                costCentres: id ? czo_costCentre.searchList({projectId: id}) : [],
                specifications: id ? czo_specification.searchList({projectId: id}) : [],
                scriptUrl: czo_url.resolveScript({scriptId: script.id, deploymentId: script.deploymentId})
            };
            log.debug({title: 'data', details: data});
            contents = contents.replace("'{data}'", JSON.stringify(data));
            let compiledHTML = hb.compile(contents);
            let defaultValue = compiledHTML({
                libPath
            });
            form.addInlineHtmlField({id: Field.UI_HTML, label: 'HTML', defaultValue});
            form.addLongTextField({id: Field.UI_INPUT_DATA, label: 'Input Data', defaultValue: '{}'}).hide();
        } else {
            throw {name: 'NO_ACCESS_TO_PROJECT', message: 'You are not authorized to access this Project.'}
        }

        context.response.writePage(form.nsForm);
    };

    return {
        onRequest(context) {
            const {request, response} = context;
            let fileName = czo_script.getParameter(ScriptParameter.SL_PF_MAIN_HTML_FILE_NAME);
            let detailFileName = czo_script.getParameter(ScriptParameter.SL_PF_DETAIL_HTML_FILE_NAME);
            let errorFileName = czo_script.getParameter(ScriptParameter.SL_PF_ERROR_HTML_FILE_NAME);
            try {
                let startTime = new Date();
                let {parameters} = request;
                let {projectId} = parameters;
                log.debug({title: 'projectId', details: projectId});
                render(context, projectId ? detailFileName : fileName, projectId);
                log.debug({title: 'elapsedTime', details: [(new Date() - startTime) / 1000, 'seconds'].join(' ')});
            } catch (e) {
                log.error({title: 'CZO SL Projects Form', details: czo_format.exceptionToString(e)});
                try {
                    render(context, errorFileName, false);
                } catch (e) {
                    response.write({output: 'Unexpected Error!'});
                }
            }
        }
    };
});