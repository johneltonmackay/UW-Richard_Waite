/**
 * Module Description
 * UI for Clock In & Out
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
    '../common/CZO_TimesheetLog',
    '../common/CZO_Config',
    '../lib/handlebars'
], (czo_constants, czo_format, czo_runtime, czo_script, czo_serverWidget, czo_file, czo_folder, czo_redirect, czo_https, czo_url, czo_entity, czo_project, czo_log, czo_config, hb) => {
    const {FileName, ScriptParameter, Field, CustomRecordTypeId, SUITEAPP_ID} = czo_constants;

    const render = (context, fileName) => {
        log.debug({title: 'render', details: {fileName}});
        let user = czo_runtime.getCurrentUser();
        let strFirstName = user.name.split(' ').slice(0, -1).join(' '); // remove last index
        log.debug({title: 'user', details: {user}});
        let script = czo_runtime.getCurrentScript();
        let profileImage = czo_entity.lookupImage({id: user.id});
        let form = czo_serverWidget.castForm(czo_serverWidget.createForm({title: ' ', hideNavBar: true}));
        let suiteAppFolderId = czo_folder.getFolderId({name: SUITEAPP_ID});
        let domainUrl = context.request.url.substring(0, context.request.url.indexOf('/app'))
        let libPath = czo_runtime.getLibPath(domainUrl);
        let includeFilesUrlMap = {};
        includeFilesUrlMap['name'] = strFirstName;
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
        let {id, projectText, projectId} = czo_log.searchCheckedInTodayDetails({submittedBy: user.id});
        let recordType = czo_entity.lookupRecordType({id: user.id});
        let data = {
            libPath,
            id,
            projectId,
            projectText,
            projects: czo_project.searchTimeSheetSelectOptions({
                contractor: czo_entity.isTypeEmployee(recordType) ? user.id : '',
                userid: user.id
            }),
            scriptUrl: czo_url.resolveScript({scriptId: script.id, deploymentId: script.deploymentId}),
        };
        let logTest = czo_entity.isTypeEmployee(recordType)
        log.debug({title: 'logTest', details: {logTest}});
        log.debug({title: 'data Timesheet', details: data});
        contents = contents.replace("'{data}'", JSON.stringify(data));
        let compiledHTML = hb.compile(contents);
        let defaultValue = compiledHTML({
            libPath
        });
        form.addInlineHtmlField({id: Field.UI_HTML, label: 'HTML', defaultValue});
        form.addLongTextField({id: Field.UI_INPUT_DATA, label: 'Input Data', defaultValue: '{}'}).hide();
        context.response.writePage(form.nsForm);
    };

    return {
        onRequest(context) {
            const {Method} = czo_https;
            const {request, response} = context;
            let fileName = czo_script.getParameter(ScriptParameter.SL_TF_MAIN_HTML_FILE_NAME);
            let submittedFileName = czo_script.getParameter(ScriptParameter.SL_TF_SUBMITTED_HTML_FILE_NAME);
            let errorFileName = czo_script.getParameter(ScriptParameter.SL_TF_ERROR_HTML_FILE_NAME);
            try {
                let {timeZone} = czo_config.loadUserPreferences();
                let startTime = new Date();
                if (request.method == Method.POST) {
                    let script = czo_runtime.getCurrentScript();
                    let {parameters} = request;
                    let {id, values} = JSON.parse(parameters[Field.UI_INPUT_DATA] || '{}');
                    log.debug({title: 'SL_Post_Request_Par', details: values});  // MK
                    if (!id) {
                        values.date = czo_format.customToDate(values.date);
                        values.check_in_time = czo_format.customDateTime(values.check_in_time);
                        values.submitted_by = czo_runtime.getUser();
                    } else {
                        values.check_out_time = czo_format.customDateTime(values.check_out_time);
                    }
                    log.debug({title: 'SL_upsertFromData_values', details: values});  // MK
                    let logId = czo_log.upsertFromData({id, values});
                    log.debug({title: 'logId', details: logId});
                    fileName = submittedFileName || fileName;
                    czo_redirect.toSuitelet({scriptId: script.id, deploymentId: script.deploymentId});
                } else {
                    render(context, fileName);
                }
                log.debug({title: 'elapsedTime', details: [(new Date() - startTime) / 1000, 'seconds'].join(' ')});
            } catch (e) {
                log.error({title: 'CZO SL Timesheet Form', details: czo_format.exceptionToString(e)});
                try {
                    render(context, errorFileName, false);
                } catch (e) {
                    response.write({output: 'Unexpected Error!'});
                }
            }
        }
    };
});