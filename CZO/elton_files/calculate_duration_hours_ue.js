/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search'],
function(log, runtime, record, search) {
    function afterSubmit(scriptContext) {
        log.debug({title: "CONTEXT", details: scriptContext.type});
        try {
            
            const newRecord = scriptContext.newRecord;
            const recType = newRecord.type;
            const strId = newRecord.id;

            let dtTimeIn = ""
            let dtTimeOut = ""
            let intDuration = ""

            log.debug({title: "afterSubmit: recType", details: recType});
            log.debug({title: "afterSubmit: strId", details: strId});

            let intTimeEntry = newRecord.getValue({
                fieldId: 'custrecord_tl_time_entry'
            });
            log.debug({ title: "afterSubmit: intTimeEntry", details: intTimeEntry });
            

        } catch (err) {
            log.error({title: 'afterSubmit Error', details: err.message});
        }
    }

    // Private Function
    const calculateDuration = (dtTimeIn, dtTimeOut, intTimeEntry) => {
        try {
            // Parse the date strings into Date objects
            let dtCheckTimeIn = new Date(dtTimeIn);
            let dtCheckTimeOut = new Date(dtTimeOut);
        
            // Calculate the difference in milliseconds
            let differenceInMillis = dtCheckTimeOut - dtCheckTimeIn;
        
            // Convert milliseconds to hours
            let intDuration = differenceInMillis / (1000 * 60 * 60);
        
            // Log the Duration hours
            log.debug({ title: "calculateDuration: intDuration", details: intDuration });

            var submitFieldsPromise = record.submitFields.promise({
                type: 'timebill',
                id: intTimeEntry,
                values: {
                    hours: parseFloat(overTime).toFixed(2),
                },
                options: {
                    enableSourcing: true,
                    ignoreMandatoryFields : true
                }
            });
            submitFieldsPromise.then(function(recordId) {
                if (recordId){
                    log.debug({ title: "calculateDuration: record saved: recId", details: recId });
                }
            });
        } catch (err) {
            log.error({title: 'calculateDuration', details: err.message});
        }
    };

    return {
        afterSubmit: afterSubmit
    };
});
