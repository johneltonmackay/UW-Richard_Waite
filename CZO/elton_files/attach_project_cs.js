/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/query', 'N/currentRecord', 'N/format'],

    function (message, query, currentRecord, format) {

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
            console.log('Page Fully Loaded.');
            
        }

        function resetFields() {
            
        }



        return {
            pageInit: pageInit,
            resetFields: resetFields
        };

    });
