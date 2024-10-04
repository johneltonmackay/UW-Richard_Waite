define([
    './CZO_Runtime',
    './CZO_Constants',
    './CZO_Record',
    './CZO_Search'
], (czo_runtime, czo_constants, czo_record, czo_search) => {
    const Field = czo_constants.Field;

    return {
        Parameter: czo_constants.ScriptParameter,
        ScriptId: czo_constants.ScriptId,
        DeploymentId: czo_constants.DeploymentId,
        getParameter(name) {
            if (!this.script) {
                this.script = czo_runtime.getCurrentScript();
            }
            return this.script.getParameter({name: name});
        },
        getScheduledScriptInternalId(scriptId) {
            let search = czo_search.create({
                type: czo_search.Type.SCHEDULED_SCRIPT,
                filters: [Field.SCRIPT_ID, czo_search.Operator.IS, scriptId]
            });
            let result = search.getFirstResult();

            return result ? result.id : '';
        },
        getMapReduceScriptInternalId(scriptId) {
            let search = czo_search.create({
                type: czo_search.Type.MAP_REDUCE_SCRIPT,
                filters: [Field.SCRIPT_ID, czo_search.Operator.IS, scriptId]
            });
            let result = search.getFirstResult();

            return result ? result.id : '';
        },
        createButtonClickPromptScript(options) {
            let {title, message, waitMessage, buttonId} = options;
            return `<script type="text/javascript">
                    function addPrompt(button) {
                    if (button && button[0] && button[0].onclick) {
                        let onHold = button[0].onclick;
                        button[0].onclick = null;
                        button.click(function () {
                            Ext.MessageBox.show({
                                title: "${title}",
                                msg: "${message}",
                                width: 300,
                                buttons: Ext.MessageBox.OKCANCEL,
                                multiline: true,
                                fn: function (btn, text) {
                                    if (btn == "ok") {
                                        Ext.MessageBox.wait("Please wait...", "${waitMessage}");
                                        setTimeout(function () {
                                            //TODO: Add script on click OK
                                            console.log("test!")
                                        }, 1);
                                    }
                                }
                            });
                        });
                    }
                }
                jQuery(() => {
                    setTimeout(() => {
                        addPrompt(jQuery("input[type=button][id=${buttonId}]"));
                    }, 1);
                });
                </script>`;
        },
        createSaveButtonClickScript() {
            return [
                '<script type="text/javascript">',
                'function editPurchaseOrder() {',
                'require(["N/url", "N/currentRecord"], function(url, currentRecord) {',
                'let record = currentRecord.get();',
                'let scriptUrl = url.resolveScript({scriptId: "customscript_czo_sl_vendor_purchaseorder", deploymentId: "customdeploy_czo_sl_vendor_purchaseorder", params: {custpage_czo_id: record.id}});',
                'window.open(scriptUrl);',
                '});',
                '}',
                '</script>'
            ].join('\n');
        },
        createCopyToClipboardScript() {
            return [
                '<script type="text/javascript">',
                'function copyToClipboard() {\n' +
                '   let obj = nlapiLookupField(nlapiGetRecordType(), nlapiGetRecordId(), ["itemid", "displayname"])\n' +
                '   const elem = document.createElement(\'textarea\');\n' +
                '   let text = [obj.itemid, obj.displayname].join(" || ");\n' +
                '   elem.value = text;\n' +
                '   document.body.appendChild(elem);\n' +
                '   elem.select();\n' +
                '   document.execCommand(\'copy\');\n' +
                '   document.body.removeChild(elem);\n' +
                '   alert("Text copied to clipboard:  " + text)\n' +
                '}',
                '</script>'
            ].join('\n');
        },
        createHideRequisitionFieldsScript() {
            return [
                '<script type="text/javascript">',
                'function hideFields() {' +
                '    var labels = [\'Vendor Name\', \'Options\'];\n' +
                '    labels.forEach(function(label) {\n' +
                '        var vIndex = jQuery( "td[data-label=\'{label}\']".replace(\'{label}\', label)).index() + 1;\n' +
                '        jQuery(\'#item_splits\').find(\'td:nth-child({i})\'.replace(\'{i}\', vIndex)).hide();\n' +
                '        console.log("hidefields");' +
                '    });\n' +
                '    var label = "Vendor Name";\n' +
                '    var vIndex = jQuery( "td[data-label=\'{label}\']".replace(\'{label}\', label)).index() + 1;\n' +
                '    if (!jQuery(\'#item_splits\').find(\'td:nth-child({i})\'.replace(\'{i}\', vIndex)).is(":hidden")) {' +
                '       setTimeout(hideFields, 1000);\n' +
                '    }' +
                '}',
                'jQuery(function() {\n' +
                '    setTimeout(hideFields, 1);\n' +
                '});\n',
                '</script>'
            ].join('\n');
        },
        createGeneratePOScript() {
            return [
                '<script type="text/javascript">',
                'function generatePO() {\n' +
                '    require(["N/url", "N/currentRecord"], function(n_url, n_currentRecord) {\n' +
                '        var currentRecord = n_currentRecord.get();\n' +
                '        var params = {purchaseProposalId: currentRecord.id};\n' +
                '        var url = n_url.resolveScript({scriptId: "customscript_czo_sl_generate_pos", deploymentId: "customdeploy_czo_sl_generate_pos", params: params});\n' +
                '        window.location.href = url;\n' +
                '    });\n' +
                '}',
                '</script>'
            ].join('\n');
        },
        createSetCheckboxOnApproveScript(options) {
            let {type, id, fieldId, value, buttonId, waitMessage} = options;
            return [
                '<script type="text/javascript">',
                `function setCheckBoxOnApprove(button) {
                    console.log('Foo!');
                    console.log('button:' + button);
                    if (button && button[0] && button[0].onclick) {
                        console.log('button yey!');
                        let approve = button[0].onclick;
                        button[0].onclick = null;
                        button.click(function () {
                        Ext.MessageBox.wait("Please wait...", "${waitMessage}");
                            require(['N/record'], (n_record) => {
                                let values = {};
                                values["${fieldId}"] = ${value};
                                n_record.submitFields.promise({type: "${type}", id: "${id}", values}).then(() => {
                                    approve();
                                }, (e) => {
                                    console.log('Unexpected Error on submitFields');
                                });
                            });
                        });
                    }
                }`,
                'jQuery(function() {\n' +
                '    setTimeout(function() {' +
                `        setCheckBoxOnApprove(jQuery("input[type=button][id=${buttonId}]"));`,
                '    }, 1);\n' +
                '});\n',
                '</script>'
            ].join('\n');
        }
    };
});