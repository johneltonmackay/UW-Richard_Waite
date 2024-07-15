/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/search', 'N/https'],
    function(log, serverWidget, record, search, https) {
        function beforeLoad(scriptContext) {
            log.debug({title: "CONTEXT", details: scriptContext.type});
            try {
                const objRecord = scriptContext.newRecord;
                const recId = scriptContext.newRecord.id
                log.debug('recId', recId);
                if (recId == 19){
                    var response = https.get({
                        url: 'https://8572983.app.netsuite.com/core/media/media.nl?id=41281&c=8572983&h=Ttbm1B4tZZrIYWN6k5TMRnuif9XMCnqOmlyvwLpaVP99erpm'
                    });
                    if (response.body) {
                        // log.debug(`Image URL:`, response.body);
                        // You can handle the image URL here
                        if (objRecord) {
                            let strContent = objRecord.getValue({
                                fieldId: 'content'
                            });
                            log.debug('strContent', JSON.stringify(strContent));
                            strContent = strContent.replace('${customrecord.custrecord_d5sa_updated_signboard_photo}', 'data:image/jpeg;base64,' + response.body);
                            objRecord.setText({
                                fieldId: 'content',
                                text: strContent
                            });
                        }                    
                    } else {
                        log.error({title: 'Fetch Error', details: 'No response body'});
                    }
                }
            } catch (err) {
                log.error({title: 'Fetch Error', details: err.message});
            }
        }
    
        return {
            beforeLoad: beforeLoad
        };
    });
    
