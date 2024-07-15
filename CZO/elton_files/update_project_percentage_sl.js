/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 */
    (record, redirect) => {
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
                    let intProjectId = scriptContext.request.parameters['projectId'];
                    let intProjectPercent = scriptContext.request.parameters['projectPercent'];
                    let strProjectHazards = scriptContext.request.parameters['dailyHazards'];
                    log.debug('onRequest GET intProjectId', intProjectId)
                    log.debug('onRequest GET intProjectPercent', intProjectPercent)
                    log.debug('onRequest GET strProjectHazards', strProjectHazards)

                    if (intProjectId && intProjectPercent){
                        var recProjectID = record.submitFields({
                            type: 'job',
                            id: intProjectId,
                            values: {
                                custentity_project_percentage: intProjectPercent
                            }
                        });
                        log.debug('onRequest GET Updated intProjectPercent', intProjectPercent)
                        log.debug('onRequest GET Updated recProjectID', recProjectID)
                        if (recProjectID){
                            redirect.toSuitelet({
                                scriptId: '1776',
                                deploymentId: '1',
                                parameters: {
                                    'projectId': intProjectId
                                }
                            });
                        }
                    }

                    if (intProjectId && strProjectHazards){
                        var recProjectID = record.submitFields({
                            type: 'job',
                            id: intProjectId,
                            values: {
                                custentity_daily_hazards: strProjectHazards
                            }
                        });
                        log.debug('onRequest GET Updated strProjectHazards', strProjectHazards)
                        log.debug('onRequest GET Updated recProjectID', recProjectID)
                        if (recProjectID){
                            redirect.toSuitelet({
                                scriptId: '1772',
                                deploymentId: '1',
                            });
                        }
                    }

                }
            } catch (err) {
                log.error('ERROR ONREQUEST:', err)
            }
        }

        return {onRequest}

    });
