/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/render', 'N/record', 'N/search', 'N/runtime', 'N/log'],
function(email, render, record, search, runtime, log) {
    function beforeLoad(scriptContext) {
        log.debug('CONTEXT', scriptContext.type);
        try {
           if (scriptContext.type === scriptContext.UserEventType.VIEW){

            addResendButton(scriptContext)

           }
        } catch (err) {
            log.error({title: 'afterSubmit Error', details: err.message});
        }
    }

    // Private Function

    const addResendButton = (scriptContext) => {
        try {
            const objRecord = scriptContext.newRecord;
            const objForm = scriptContext.form;
            log.debug('objRecord', objRecord);
            log.debug('objForm', objForm);
    
            const stSuiteletLinkParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_suitelet_id'
            });

            const stEmailTemplateParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_email_template'
            });
    
            const recordId = objRecord.id;
            
            // Construct the Suitelet URL with the parameter
            const suiteletURL = `\"${stSuiteletLinkParam}&recordId=${recordId}&emailTemplateId=${stEmailTemplateParam}\"`;

            objForm.addButton({
                id: 'custpage_suiteletbutton',
                label: 'Resend 5x5 Form',
                functionName: `window.open(${suiteletURL})`,
            });
    
        } catch (err) {
            log.error('addResendButton', err.message);
        }
    };
    

    return {
        beforeLoad: beforeLoad
    };
});
