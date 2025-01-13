/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/search', 'N/redirect', 'N/ui/dialog'], function (record, runtime, search, redirect, dialog) {

    function beforeLoad(scriptContext) {
        log.debug('CONTEXT', scriptContext.type);
        try {
           if (scriptContext.type === scriptContext.UserEventType.VIEW){

            createVCardButton(scriptContext)

           }
        } catch (err) {
            log.error({title: 'afterSubmit Error', details: err.message});
        }
    }

    // Private Function
    const createVCardButton = (scriptContext) => {
        try {
            const objRecord = scriptContext.newRecord;
            const objForm = scriptContext.form;
            log.debug('objRecord', objRecord);
            log.debug('objForm', objForm);
    
            const stSuiteletLinkParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_vcard_suitelet_id'
            });

            const recordId = objRecord.id;
            
            // Construct the Suitelet URL with the parameter
            const suiteletURL = `\"${stSuiteletLinkParam}&recordId=${recordId}\"`;

            objForm.addButton({
                id: 'custpage_export_vcard_button',
                label: 'Export VCard',
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
