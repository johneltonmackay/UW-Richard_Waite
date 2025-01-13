/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/currentRecord', 'N/ui/dialog', 'N/record'],
/**
 * @param{search} search
 */
function(search, currentRecord, dialog, record) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        console.log('pageInit Test by John')
        createVCard()
    }


    // Private Function
    function createVCard() {
        try {
            const objSuiteletRecord = currentRecord.get()

            let strContactRecId = objSuiteletRecord.getValue({ fieldId: 'custpage_rec_id' })

            if (strContactRecId){
                const objRecord = record.load({
                    type: 'contact',
                    id: strContactRecId,
                    isDynamic: true
                })
                // Extract contact details
                var firstName = objRecord.getValue({ fieldId: 'firstname' }) || "";
                var lastName = objRecord.getValue({ fieldId: 'lastname' }) || "";
                var email = objRecord.getValue({ fieldId: 'email' }) || "";
                var company = objRecord.getText({ fieldId: 'custentity_vcard_company' }) || "";
                var phone = objRecord.getValue({ fieldId: 'phone' }) || "";
                var mobilephone = objRecord.getValue({ fieldId: 'mobilephone' }) || "";
                var title = objRecord.getValue({ fieldId: 'title' }) || "";

                var vCard = `
                    BEGIN:VCARD\n
                    VERSION:3.0\n
                    FN:${firstName} ${lastName}\n
                    ORG:${company}\n
                    TITLE:${title}\n
                    EMAIL:${email}\n
                    TEL;WORK;VOICE:${phone}\n
                    TEL;CELL;VOICE:${mobilephone}\n
                    END:VCARD
                `;
            

                // Create a single file for all vCards
                var blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = `${firstName} ${lastName}.vcf`; // Single file name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                dialog.alert({ title: 'Success', message: 'vCards have been downloaded as a single file.' });

                window.close();
                
                }

        } catch (error) {
            dialog.alert({ title: 'Error', message: error.message });
        }
    }


    return {
        pageInit: pageInit,
    };
    
});
