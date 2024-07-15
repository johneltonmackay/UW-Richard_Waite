/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/email', 'N/render'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 */
    (record, redirect, email, render) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const CONTEXT_METHOD = {
            GET: "GET",
            POST: "POST"
        };

        const onRequest = (scriptContext) => {
            try {
                if (scriptContext.request.method == CONTEXT_METHOD.GET) {
                    const paramRecId = scriptContext.request.parameters['recordId'];
                    const paramTemplateId = scriptContext.request.parameters['emailTemplateId'];
                    
                    if (paramRecId && paramTemplateId){
                        log.debug('onRequest GET paramRecId', paramRecId)
                        log.debug('onRequest GET paramTemplateId', paramTemplateId)
                        let obj5x5Record = load5x5Record(paramRecId)
                        let senderId = -5;
                        let recipientId = 43531; // JEM
                        let mergeResult = render.mergeEmail({
                            templateId: paramTemplateId,
                            customRecord: obj5x5Record
                        });
                        log.debug('onRequest GET mergeResult', mergeResult)
                        if (mergeResult){
                            email.send({
                                author: senderId,
                                recipients: recipientId,
                                subject: mergeResult.subject,
                                body: mergeResult.body,
                                relatedRecords: {
                                    entityId: recipientId,
                                    customRecord: {
                                        id: obj5x5Record.id,
                                        recordType: obj5x5Record.type
                                    }
                                }
                            });

                            redirect.toRecord({
                                type: obj5x5Record.type,
                                id: obj5x5Record.id,
                            });
                            
                        }
                    }

                }
            } catch (err) {
                log.error('ERROR ONREQUEST:', err)
            }
        }

        const load5x5Record = (paramRecId) => {
            const obj5x5Record = record.load({
                type: 'customrecord_czo_daily_5x5_safety_assmnt',
                id: paramRecId,
                isDynamic: true
            })
            log.debug('load5x5Record obj5x5Record', obj5x5Record)
            return obj5x5Record
        }
        return {onRequest}

    });
