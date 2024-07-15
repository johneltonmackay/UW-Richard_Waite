/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/search'],
function(log, serverWidget, record, search) {
    function beforeSubmit(scriptContext) {
        log.debug({title: "CONTEXT", details: scriptContext.type});
        try {
            var newRecord = scriptContext.newRecord;
            var recType = newRecord.type;
            var strId = newRecord.id;
            log.debug({title: "beforeSubmit: recType", details: recType});
            log.debug({title: "beforeSubmit: strId", details: strId});
            let dtDate = newRecord.getValue({
                fieldId: 'custrecord_current_dt'
            });
            log.debug({ title: "beforeSubmit: dtDate", details: dtDate });
            if (dtDate) {
                // Convert dtDate to a Date object
                let dateObject = new Date(dtDate);
                // Get individual components of the date
                let day = dateObject.getDate();
                let month = dateObject.getMonth() + 1; // Months are 0-based
                let year = dateObject.getFullYear();
                // Format the date as 'dd/mm/yyyy'
                let formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
                newRecord.setValue({
                    fieldId: 'custrecord_nstz_date_only',
                    value: formattedDate
                });
            }
        } catch (err) {
            log.error({title: 'beforeSubmit Error', details: err.message});
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});
