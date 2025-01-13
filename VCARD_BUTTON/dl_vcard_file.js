/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/ui/dialog'], function (record, dialog) {

    function createVCard(context) {
        try {
            var rec = record.load({
                type: record.Type.CONTACT,
                id: context.currentRecord.id
            });

            // Extract contact details
            var firstName = rec.getValue({ fieldId: 'firstname' });
            var lastName = rec.getValue({ fieldId: 'lastname' });
            var email = rec.getValue({ fieldId: 'email' });
            var phone = rec.getValue({ fieldId: 'phone' });

            // vCard format
            var vCard = `
            BEGIN:VCARD
            VERSION:3.0
            N:${lastName};${firstName};;;
            FN:${firstName} ${lastName}
            EMAIL:${email}
            TEL:${phone}
            END:VCARD
            `;

            // Trigger file download
            var blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = `${firstName}_${lastName}.vcf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            dialog.alert({ title: 'Success', message: 'vCard file has been downloaded.' });

        } catch (error) {
            dialog.alert({ title: 'Error', message: error.message });
        }
    }

    return {
        pageInit: function (context) {
            // You could add this logic to trigger the vCard generation from a button click
        },
        customFunction: createVCard // Bind this function to a button in UI
    };
});
