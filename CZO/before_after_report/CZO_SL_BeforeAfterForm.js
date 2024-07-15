/**
 * Module Description
 * UI for Before & After Report
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jul 2023     CZO-MRC          Before & After Report
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
    '../common/CZO_BeforeAfterLog',
    '../lib/handlebars'
], (czo_constants, czo_format, czo_runtime, czo_script, czo_serverWidget, czo_file, czo_folder, czo_redirect, czo_https, czo_url, czo_email, czo_render, czo_entity, czo_project, czo_log, hb) => {
    const {FileName, ScriptParameter, Field, CustomRecordTypeId, SUITEAPP_ID} = czo_constants;

    const render = (context, fileName, includeFiles) => {
        let {request} = context;
        let {projectId} = request.parameters;
        let user = czo_runtime.getCurrentUser();
        let strFirstName = user.name.split(' ').slice(0, -1).join(' '); // remove last index
        let script = czo_runtime.getCurrentScript();
        let profileImage = czo_entity.lookupImage({id: user.id});
        let form = czo_serverWidget.castForm(czo_serverWidget.createForm({title: ' ', hideNavBar: true}));
        let suiteAppFolderId = czo_folder.getFolderId({name: SUITEAPP_ID});
        let domainUrl = request.url.substring(0, request.url.indexOf('/app'))
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
        let recordType = czo_entity.lookupRecordType({id: user.id});
        let data = {
            libPath,
            projectId,
            details: czo_log.searchDetails({projectId}),
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
        let {id, recordType, customRecord, entityId, recipients, author, cc, templateId} = options;
        if (author && templateId && recipients.length > 0) {
            let mergedEmail = czo_render.mergeEmail({templateId, customRecord});
            let {subject, body} = mergedEmail;
            czo_email.send({author, recipients, cc, subject, body, relatedRecords: {entityId, customRecord: {id, recordType}}});
        }
    };

    return {
        onRequest(context) {
            const {Method} = czo_https;
            const {request, response} = context;
            let fileName = czo_script.getParameter(ScriptParameter.SL_BAF_MAIN_HTML_FILE_NAME);
            let submittedFileName = czo_script.getParameter(ScriptParameter.SL_BAF_SUBMITTED_HTML_FILE_NAME);
            let errorFileName = czo_script.getParameter(ScriptParameter.SL_BAF_ERROR_HTML_FILE_NAME);
            let mainFolderId = czo_script.getParameter(ScriptParameter.BEFORE_AFTER_FOLDER_ID);
            let includeFiles = false;
            try {
                let startTime = new Date();
                if (request.method == Method.POST) {
                    let {parameters, files} = request;
                    log.debug({title: 'Method', details: request.method});
                    log.debug({title: 'includeFiles', details: includeFiles});
                    log.debug({title: 'parameters', details: parameters});
                    log.debug({title: 'files', details: files});
                    let {id, values} = JSON.parse(parameters[Field.UI_INPUT_DATA] || '{}');
                    let {notify} = values;
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
                    let assessmentId = czo_log.upsertFromData({id, values});
                    log.debug({title: 'assessmentId', details: assessmentId});
                    let assessment = czo_log.load({id: assessmentId});
                    let {project, projectManager} = assessment;
                    if (project && projectManager && notify) {
                      //[JDK]-Modify to only send to olivia and national operations group
                      //START CHANGE
                      sendEmail({
                            author: czo_script.getParameter(ScriptParameter.DEFAULT_EMAIL_AUTHOR),
                            recipients: [projectManager],
                            cc: [13249], //operations@nationalgroupltd.com
                            templateId: 16,
                            entityId: project,
                            recordType: CustomRecordTypeId.BEFORE_AFTER_LOG,
                            id: assessmentId,
                            customRecord: assessment.record
                        });
                      //END CHANGE

                      //ORIGINAL
                        /* sendEmail({
                            author: czo_script.getParameter(ScriptParameter.DEFAULT_EMAIL_AUTHOR),
                            recipients: [projectManager],
                            templateId: czo_script.getParameter(ScriptParameter.SL_BAF_EMAIL_TEMPLATE),
                            entityId: project,
                            recordType: CustomRecordTypeId.BEFORE_AFTER_LOG,
                            id: assessmentId,
                            customRecord: assessment.record
                        }); */
                    }
                    fileName = submittedFileName || fileName;
                } else {
                    includeFiles = true;
                }
                render(context, fileName, includeFiles);
                log.debug({title: 'elapsedTime', details: [(new Date() - startTime) / 1000, 'seconds'].join(' ')});
            } catch (e) {
                log.error({title: 'CZO SL Before & After Form', details: czo_format.exceptionToString(e)});
                try {
                    render(context, errorFileName, false);
                } catch (e) {
                    response.write({output: 'Unexpected Error!'});
                }
            }
        }
    };
});