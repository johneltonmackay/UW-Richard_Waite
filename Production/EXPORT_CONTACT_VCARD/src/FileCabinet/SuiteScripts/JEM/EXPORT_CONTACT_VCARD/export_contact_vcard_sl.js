/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget', 'N/file'],
    /**
 * @param{record} record
 */
    (record, serverWidget, file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                var objForm = serverWidget.createForm({
                    title: 'Export Contact as VCard',
                    hideNavBar: true
                });

                try {
                    const paramRecId = scriptContext.request.parameters['recordId'];
                    if (paramRecId){
                        let fldContact = objForm.addField({
                            id: "custpage_rec_id",
                            type: "TEXT",
                            label: "Contact Record ID",
                        });
                        fldContact.defaultValue = paramRecId;
                        fldContact.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE }); 

                        objForm.clientScriptModulePath = './export_contact_vcard_cs.js';
                    }
   
                } catch (error) {
                    log.error({ title: 'Error', details: error.message });
                }

                scriptContext.response.writePage(objForm);
            }
        }

        return {onRequest}

    });
