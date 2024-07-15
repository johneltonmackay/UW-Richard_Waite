/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/runtime', 'N/record'],
    /**
     * @param {serverWidget} serverWidget
     */
    function (serverWidget, runtime, record) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @param {Object} scriptContext.request http.ServerRequest
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            if (scriptContext.type != 'view')
                return;

            var currentForm = scriptContext.form;
         
			var rec = scriptContext.newRecord;
									
			var html = '<script>';
            html += 'require([\'N/ui/message\'], function (message){'; 
            html += 'var msg = message.create({'; 
            html += 'title: \'Alert\', '; 
            html += 'message: \'Project invoice has been created. \', '; 
            html += 'type: message.Type.WARNING'; 
            html += '}); ';
            html += 'msg.show();'; 
            html += '})';
            html += '</script>';

			if ((rec.getValue('custentity_czo_last_inv') != 'No Invoice') && (rec.getValue('custentity_czo_last_inv')))  {
			           
				var field = currentForm.addField({
					id: "custpage_posubmitted", 
					label: "Message", 
					type: serverWidget.FieldType.INLINEHTML, 

				});

            field.defaultValue = html;
			}
			
			var html2 = '<script>';
            html2 += 'require([\'N/ui/message\'], function (message){'; 
            html2 += 'var msg = message.create({'; 
            html2 += 'title: \'Alert\', '; 
            html2 += 'message: \'No data found for invoicing. \', '; 
            html2 += 'type: message.Type.ERROR'; 
            html2 += '}); ';
            html2 += 'msg.show();'; 
            html2 += '})';
            html2 += '</script>';

			if (rec.getValue('custentity_czo_last_inv') == 'No Invoice')  {
			           
				var field = currentForm.addField({
					id: "custpage_posubmitted", 
					label: "Message", 
					type: serverWidget.FieldType.INLINEHTML, 

				});

            field.defaultValue = html2;
			}
			
			 var rec = record.load({
                type: scriptContext.newRecord.type,
                id: scriptContext.newRecord.id,
                isDynamic: true
            });
			
			rec.setValue('custentity_czo_last_inv', '');
			
			var recId = rec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
			/*rec.submitFields({
				type: 'project',
				id: rec.record.id,
				values: {
					custentity_czo_last_inv: ''
				}
			});*/
			
        }
        return {
            beforeLoad: beforeLoad
        };

    });