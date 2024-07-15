/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/ui/serverWidget', 'N/file'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 */
    (record, redirect, serverWidget, file) => {
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
                    let intQualityFormId = scriptContext.request.parameters['qualityFormId'];
                    log.debug('onRequest GET intProjectId', intProjectId)
                    log.debug('onRequest GET intQualityFormId', intQualityFormId)
                    if (intProjectId && intQualityFormId){
                        var form = serverWidget.createForm({
                            title: ' ',
                            hideNavBar: true
                        });
        
                        var fileField = form.addField({
                            id: 'custpage_file',
                            type: 'file',
                            label: 'Document',
                            isMandatory: true
                        });

                        var projectIdField = form.addField({
                            id: 'custpage_project_id',
                            type: 'text',
                            label: 'Project Id'
                        });
                        projectIdField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        
                        projectIdField.defaultValue = intProjectId;

                        var qualityFormIdField = form.addField({
                            id: 'custpage_quality_form_id',
                            type: 'text',
                            label: 'Quality Form Id'
                        });
                        
                        qualityFormIdField.defaultValue = intQualityFormId;
                        qualityFormIdField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
        
                        let smbButton = form.addSubmitButton({
                            label: 'Submit'
                        });
                        smbButton.isHidden = true;
        
                        scriptContext.response.writePage(form);
                    }

                } else {
                    log.debug('post param', scriptContext.request.parameters);

                    let proId = scriptContext.request.parameters.custpage_project_id;
                    let qaId = scriptContext.request.parameters.custpage_quality_form_id;
                    let fileObj = scriptContext.request.files.custpage_file;

                    // Get current date and time in NZT
                    const nztOffset = 12; // NZT is usually UTC+12
                    const now = new Date(new Date().getTime() + nztOffset * 3600 * 1000);
                    const dateString = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
                    const timeString = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
                    const datetimeString = `${dateString}_${timeString}`;

                    // Update the filename with date and time
                    let originalFileName = fileObj.name;
                    let fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
                    let newFileName = originalFileName.replace(fileExtension, `_${datetimeString}${fileExtension}`);
                    fileObj.name = newFileName;

                    // Set the destination folder
                    fileObj.folder = 8590; // Replace with own folder ID

                    // Save the file and log relevant information
                    let attachmentId = fileObj.save();

                    var mediaObj = file.load({
                        id: attachmentId
                    });
                    log.debug({
                        details: "File URL: " + mediaObj.url
                    });

                    let attachmentUrl = mediaObj.url
                    log.debug('attachmentId', attachmentId);
                    log.debug('attachmentUrl', attachmentUrl);
                    log.debug('proId', proId);
                    log.debug('qaId', qaId);

                    if (attachmentId) {
                        var recQAID = record.submitFields({
                            type: 'customrecord_nat_qua_ctrl_sys',
                            id: qaId,
                            values: {
                                custrecord_nat_qua_ctrl_sys_attach: attachmentId,
                                custrecord_file_url: attachmentUrl
                            }
                        });
                        log.debug('onRequest GET Updated Quality Check', recQAID)
                    }
                    
                }
            } catch (err) {
                log.error('ERROR ONREQUEST:', err)
            }
            
        }
        

        return {onRequest}

    });
