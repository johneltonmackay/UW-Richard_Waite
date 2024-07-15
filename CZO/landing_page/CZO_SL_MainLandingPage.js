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
    '../common/CZO_PerformanceLog',
    '../common/CZO_Role',
    '../lib/handlebars'
], (czo_constants, czo_format, czo_runtime, czo_script, czo_serverWidget, czo_file, czo_folder, czo_redirect, czo_https, czo_url, czo_entity, czo_perfLog, czo_role, hb) => {
    const {FileName, ScriptParameter, Field, SavedSearch, SUITEAPP_ID} = czo_constants;

    const render = (context, fileName) => {
        let user = czo_runtime.getCurrentUser();
        let script = czo_runtime.getCurrentScript();
        let strFirstName = user.name.split(' ').slice(0, -1).join(' '); // remove last index
        let profileImage = czo_entity.lookupImage({id: user.id});
        let form = czo_serverWidget.castForm(czo_serverWidget.createForm({title: ' ', hideNavBar: true}));
        let suiteAppFolderId = czo_folder.getFolderId({name: SUITEAPP_ID});
        let domainUrl = context.request.url.substring(0, context.request.url.indexOf('/app'));
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
        let data = {
            libPath,
            scriptUrl: czo_url.resolveScript({scriptId: script.id, deploymentId: script.deploymentId})
        };
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
            czo_perfLog.start('onRequest');
            const {request, response} = context;
            let fileName = czo_script.getParameter(ScriptParameter.SL_MLP_MAIN_HTML_FILE_NAME);
            let errorFileName = czo_script.getParameter(ScriptParameter.SL_MLP_ERROR_HTML_FILE_NAME);
            try {
                if (czo_role.searchIdInResults({savedSearchId: SavedSearch.VENDOR_ROLES, id: czo_runtime.getCurrentRole()})) {
                    render(context, fileName);
                } else {
                    czo_redirect.redirect({url: '/app/center/card.nl?sc=-29'});
                }
                czo_perfLog.end('onRequest');
            } catch (e) {
                log.error({title: 'CZO SL Main Landing Page', details: czo_format.exceptionToString(e)});
                try {
                    render(context, errorFileName, false);
                } catch (e) {
                    response.write({output: 'Unexpected Error!'});
                }
            }
        }
    };
});