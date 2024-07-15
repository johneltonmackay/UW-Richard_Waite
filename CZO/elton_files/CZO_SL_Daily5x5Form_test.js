/**
 * Module Description
 * UI for Daily 5x5 Report
 *
 * Version    Date            Author           Remarks
 * 1.00       30 Jun 2023     CZO-MRC          Daily 5x5 Report
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
    '../common/CZO_Email',
    '../common/CZO_Render',
    '../common/CZO_Entity',
    '../common/CZO_Project',
    '../common/CZO_Contact',
    '../common/CZO_Daily5x5Assessment',
    '../lib/handlebars'
], (czo_constants, czo_format, czo_runtime, czo_script, czo_serverWidget, czo_file, czo_folder, czo_redirect, czo_https, czo_url, czo_email, czo_render, czo_entity, czo_project, czo_contact, czo_assessment, hb) => {
    const {FileName, ScriptParameter, Field, CustomRecordTypeId, SUITEAPP_ID} = czo_constants;

    const render = (context, fileName, includeFiles) => {
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
        let data = {
            libPath,
            projects: czo_project.searchSelectOptions({
                contractor: czo_entity.isTypeEmployee(recordType) ? user.id : '',
                userid: user.id
            }),
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
        if (includeFiles) {
            form.addFileField({id: Field.UI_FILE, label: 'Hidden File'}).hide();
        }
        context.response.writePage(form.nsForm);
    };

    const sendEmail = (options) => {
        let {id, recordType, customRecord, entityId, recipients, author, templateId} = options;
        if (author && templateId && recipients.length > 0) {
            let mergedEmail = czo_render.mergeEmail({templateId, customRecord});
            let {subject, body} = mergedEmail;
            czo_email.send({author, recipients, subject, body, relatedRecords: {entityId, customRecord: {id, recordType}}});
        }
    };

    return {
        onRequest(context) {
            const {Method} = czo_https;
            const {request, response} = context;
            let fileName = czo_script.getParameter(ScriptParameter.SL_MAIN_HTML_FILE_NAME);
            let submittedFileName = czo_script.getParameter(ScriptParameter.SL_SUBMITTED_HTML_FILE_NAME);
            let errorFileName = czo_script.getParameter(ScriptParameter.SL_ERROR_HTML_FILE_NAME);
            let mainFolderId = czo_script.getParameter(ScriptParameter.DAILY_5x5_FOLDER_ID);
            let includeFiles = false;
            try {
                let startTime = new Date();
                if (request.method == Method.POST) {
                    let {parameters, files} = request;
                    let values = JSON.parse(parameters[Field.UI_INPUT_DATA] || '{}');
                    let fileFieldIds = Object.keys(files);
                    if (fileFieldIds.length > 0) {
                        let name = [new Date().toISOString(), 'USER', czo_runtime.getUser()].join('-');
                        let folderId = czo_folder.creatFromData({values: {name, parent: mainFolderId}});
                        fileFieldIds.forEach((fieldId) => {
                            let file = files[fieldId];
                            if (file) {
                                file.isOnline = true;
                                file.folder = folderId;
                                values[fieldId] = file.save();
                            }
                        });
                    }
                    let assessmentId = czo_assessment.createFromData({values});
                    log.debug({title: 'assessmentId', details: assessmentId});
                    let assessment = czo_assessment.load({id: assessmentId});
                    let {project, projectManager, salesman} = assessment;
                    let recipients = czo_contact.searchIdsByProject({project});
                    if (projectManager) {
                        recipients.push(projectManager);
                    }
                    if (salesman) {
                        recipients.push(salesman);
                    }
                    recipients = [...new Set(recipients)];
                    if (project && recipients.length > 0) {
                        sendEmail({
                            author: czo_script.getParameter(ScriptParameter.DEFAULT_EMAIL_AUTHOR),
                            recipients,
                            templateId: czo_script.getParameter(ScriptParameter.SL_EMAIL_TEMPLATE),
                            entityId: project,
                            recordType: CustomRecordTypeId.DAILY_5x5_ASSESSMENT,
                            id: assessmentId,
                            customRecord: assessment.record
                        });
                    }
                    fileName = submittedFileName || fileName;
                } else {
                    includeFiles = true;
                }
                render(context, fileName, includeFiles);
                log.debug({title: 'elapsedTime', details: [(new Date() - startTime) / 1000, 'seconds'].join(' ')});
            } catch (e) {
                log.error({title: 'CZO SL Daily 5x5 Form', details: czo_format.exceptionToString(e)});
                try {
                    render(context, errorFileName, false);
                } catch (e) {
                    response.write({output: 'Unexpected Error!'});
                }
            }
        }
    };
});