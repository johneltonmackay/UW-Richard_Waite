/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/runtime', 'N/record', 'N/search'],
function(log, runtime, record, search) {
    function afterSubmit(scriptContext) {
        log.debug({title: "CONTEXT", details: scriptContext.type});
        try {
            const scriptObj = runtime.getCurrentScript();
            const paramOTStart = scriptObj.getParameter({name: 'custscript_ot_start'});
            const paramOTEnd = scriptObj.getParameter({name: 'custscript_ot_end'});
            log.debug({title: "afterSubmit: paramOTStart", details: paramOTStart});
            log.debug({title: "afterSubmit: paramOTEnd", details: paramOTEnd});
            
            const newRecord = scriptContext.newRecord;
            const recType = newRecord.type;
            const strId = newRecord.id;

            let overTime = ""
            let mealCount = ""

            log.debug({title: "afterSubmit: recType", details: recType});
            log.debug({title: "afterSubmit: strId", details: strId});
            
            let strCheckOutTime = newRecord.getValue({
                fieldId: 'custrecord_tl_check_out_time'
            });
            log.debug({ title: "afterSubmit: strCheckOutTime", details: strCheckOutTime });
            
            if (strCheckOutTime && paramOTStart) {
                overTime = calculateOverTime(strCheckOutTime, paramOTStart)
            }

            let intSubmittedBy = newRecord.getValue({
                fieldId: 'custrecord_tl_submitted_by'
            });
            log.debug({ title: "afterSubmit: intSubmittedBy", details: intSubmittedBy });

            let strCheckInTime = newRecord.getValue({
                fieldId: 'custrecord_tl_check_in_time'
            });
            log.debug({ title: "afterSubmit: strCheckInTime", details: strCheckInTime });

            if (intSubmittedBy && strCheckInTime){
                mealCount = calculateMealAllowance(intSubmittedBy)
            }

            let recId = record.submitFields({
                type: recType,
                id: strId,
                values: {
                    custrecord_overtime_hours: parseFloat(overTime),
                    custrecord_today_meal_count: mealCount
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });

            log.debug({ title: "afterSubmit: updated recId", details: recId });

            
        } catch (err) {
            log.error({title: 'afterSubmit Error', details: err.message});
        }
    }

    // Private Function

    const calculateOverTime = (strCheckOutTime, paramOTStart) => {
        try {
            // Parse the date strings into Date objects
            let checkOutTime = new Date(strCheckOutTime);
            let OTStartTime = new Date(paramOTStart);
        
            // Calculate the difference in milliseconds
            let differenceInMillis = checkOutTime - OTStartTime;
        
            // Convert milliseconds to hours
            let intOverTimeHours = differenceInMillis / (1000 * 60 * 60);
        
            // Log the overtime hours
            log.debug({ title: "calculateOverTime: intOverTimeHours", details: intOverTimeHours });

            return intOverTimeHours

        } catch (err) {
            log.error({title: 'calculateOverTime', details: err.message});
        }
    };

    const calculateMealAllowance = (intSubmittedBy) => {
        let intTotalMealCount = 0
        let arrMealAllowance = [];
        try {
            let objMealSearch = search.create({
                type: 'customrecord_czo_timesheet_log',
                filters: [
                    ['created', 'within', 'today'],
                    'AND',
                    ['custrecord_tl_submitted_by.internalid', 'anyof', intSubmittedBy],
                    'AND',
                    ['custrecord_tl_meal_allowance', 'is', 'T'],
                  ],
                columns: [
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'custrecord_tl_project' }),
                    search.createColumn({ name: 'custrecord_tl_submitted_by' }),
                    search.createColumn({ name: 'created' }),
                    search.createColumn({ name: 'custrecord_tl_meal_allowance' }),


                ],

            });
            var searchResultCount = objMealSearch.runPaged().count;
            if (searchResultCount != 0) {
                var pagedData = objMealSearch.runPaged({pageSize: 1000});
                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage = pagedData.fetch(i);
                    var pageData = currentPage.data;
                    if (pageData.length > 0) {
                        for (var pageResultIndex = 0; pageResultIndex < pageData.length; pageResultIndex++) {
                            var intTimeLogsId = pageData[pageResultIndex].getValue({name: 'internalid'});
                            var intProjectId = pageData[pageResultIndex].getValue({name: 'custrecord_tl_project'});
                            var strSubmmitedBy = pageData[pageResultIndex].getValue({ name: 'custrecord_tl_submitted_by'});
                            var dtDate = pageData[pageResultIndex].getValue({ name: 'created'});
                            var blnMealAllowance = pageData[pageResultIndex].getValue({ name: 'custrecord_tl_meal_allowance'});

                            arrMealAllowance.push({
                                recTimeLogsId: intTimeLogsId,
                                recProjectId: intProjectId,
                                recSubmitterName: strSubmmitedBy,
                                recDate: dtDate,
                                recAllowance: blnMealAllowance,
                            });
                        }
                    }
                }
            }
            log.debug(`calculateMealAllowance: arrMealAllowance ${Object.keys(arrMealAllowance).length}`, arrMealAllowance);

            if (arrMealAllowance.length > 0 && arrMealAllowance){
                intTotalMealCount = arrMealAllowance.length
            }
            log.debug({ title: "calculateMealAllowance: intTotalMealCount", details: intTotalMealCount });
            return intTotalMealCount

        } catch (err) {
            log.error('calculateMealAllowance error', err.message);
        }

    }

    return {
        afterSubmit: afterSubmit
    };
});
