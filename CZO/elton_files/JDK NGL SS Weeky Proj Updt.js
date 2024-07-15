/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/recordContext', 'N/runtime', 'N/search'],
    /**
 * @param{record} record
 * @param{recordContext} recordContext
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, recordContext, runtime, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                search.load({
                    id: 'customsearch3409'
                }).run().each(function(result) {
                    let projId = result.id;
                    log.debug('result', result)
                    log.debug('result.id', result.id)
                    
                    var strSubmittedBy = result.getValue({
                        name: 'custrecord_d5sa_submitted_by',
                        join: 'custrecord_d5sa_project' 
                    });
                    log.debug('strSubmittedBy', strSubmittedBy)
                    var wklyUpdateRecord = record.create({
                        type: 'customrecord_nat_weekly_proj_update',
                        isDynamic: false
                    });
                    wklyUpdateRecord.setValue({
                        fieldId: 'custrecord_nat_wkly_proj_up_proj',
                        value: projId
                    });
                    wklyUpdateRecord.setValue({
                        fieldId: 'custrecord_nat_wkly_proj_up_status',
                        value: 2
                    });
                    wklyUpdateRecord.setValue({
                        fieldId: 'custrecord_nat_wkly_proj_up_date',
                        value: new Date()
                    });
                    wklyUpdateRecord.setValue({
                        fieldId: 'custrecord_completed_by',
                        value: strSubmittedBy
                    });
                    
                    var wklyUpdateRecordId = wklyUpdateRecord.save();
                    log.debug('wklyUpdateRecordId', wklyUpdateRecordId)
                    return true;
                });
            } catch (e) {
                var subject = 'Fatal Error: Unable to create Weekly Project Update!';
                var authorId = -5;
                var recipientEmail = 'notify@example.com';
                /* email.send({
                    author: authorId,
                    recipients: recipientEmail,
                    subject: subject,
                    body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
                }); */
            }

        }

        return {execute}

    });
