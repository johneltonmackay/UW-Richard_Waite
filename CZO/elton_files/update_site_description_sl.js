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
                    let strSiteDescription = scriptContext.request.parameters['siteDescription'];
                    log.debug('onRequest GET strSiteDescription', strSiteDescription)
                    if (strSiteDescription){
                        var recProjectID = record.submitFields({
                            type: 'job',
                            id: intProjectId,
                            values: {
                                custrecord_site_description: strSiteDescription
                            }
                        });
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

                }
            } catch (err) {
                log.error('ERROR ONREQUEST:', err)
            }
        }

        return {onRequest}

    });
