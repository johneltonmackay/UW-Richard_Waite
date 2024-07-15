/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    
    (record, search) => {
        const afterSubmit = (scriptContext) => {
            log.debug("CONTEXT: ", scriptContext.type);
            try {
                let newRecord = scriptContext.newRecord;
                let recType = newRecord.type
                let strId = newRecord.id
                let objRecord = record.load({
                        type: recType,
                        id: strId,
                        isDynamic: true,
                });

                if (objRecord){
                    let intTimeEntryID = objRecord.getValue({
                        fieldId: 'custrecord_tl_time_entry'
                    });

                    let intJournalID = objRecord.getValue({
                        fieldId: 'custrecord_journal_entry_id'
                    });
                    
                    if (intTimeEntryID && !intJournalID){
                        log.debug("intTimeEntryID", intTimeEntryID)

                        let timeEntryData = loadTimeEntry(intTimeEntryID)

                        if (timeEntryData){
                            let objData = {
                                postingPeriod: timeEntryData.postingPeriod,
                                amount: timeEntryData.cost * timeEntryData.duration,
                                memo: timeEntryData.memo,
                                projectId: timeEntryData.projectId,
                                timesheetLogsId: strId,
                                subsidiary: timeEntryData.subsidiary,
                                location: timeEntryData.location,
                                date: timeEntryData.date,
                                timeEntryId: intTimeEntryID
                            }
    
                            createJE(objData)
                        }
                    }
                }
            } catch (err) {
                log.error('afterSubmit', err.message);
            }
        }

        // private function

        const loadTimeEntry = (intTimeEntryID) => {
            let arrPostingPeriod = []
            let arrResourceData = []
            let objTimeEntryData = {}
            try {
                const objRecord = record.load({
                    type: 'timebill',
                    id: intTimeEntryID,
                    isDynamic: true
                }) 
                if (objRecord){
                    let intProjectId = objRecord.getValue({
                        fieldId: 'customer'
                    })

                    let intEmpId = objRecord.getValue({
                        fieldId: 'employee'
                    })

                    let intLocationId = objRecord.getValue({
                        fieldId: 'location'
                    })
                    
                    if (intProjectId && intEmpId){
                        arrResourceData = getResourceCost(intProjectId, intEmpId)
                    }

                    let strDuration = objRecord.getValue({
                        fieldId: 'hours'
                    })

                    let dtDate = objRecord.getValue({
                        fieldId: 'trandate'
                    })
    
                    if(dtDate){
                        arrPostingPeriod = getPostingPeriod(dtDate)
                    }

                    objTimeEntryData = {
                        projectId: intProjectId,
                        location: intLocationId,
                        resourceId: arrResourceData[0].resourceId,
                        cost: arrResourceData[0].cost,
                        duration: strDuration,
                        date: dtDate,
                        postingPeriod: arrPostingPeriod[0],
                        timeEntryId: intTimeEntryID,
                        memo: arrResourceData[0].memo,
                        subsidiary: arrResourceData[0].subsidiary,
                    }
                    
                }
            } catch (error) {
                log.error('getResourceCost', error.message);
            }

            log.debug('loadTimeEntry objTimeEntryData', objTimeEntryData)
            return objTimeEntryData
            
        }

        const getResourceCost = (intProjectId, intEmpId) => {
            let arrResource = []
            try {
                const objRecord = record.load({
                    type: 'job',
                    id: intProjectId,
                    isDynamic: true
                }) 
                if (objRecord){
                    
                    let strSubsidiary = objRecord.getText({
                        fieldId: 'subsidiary',
                    })

                    let intSubsidiary = objRecord.getValue({
                        fieldId: 'subsidiary',
                    })

                    let strProjectId = objRecord.getValue({
                        fieldId: 'entityid',
                    })

                    let strCustomerId = objRecord.getText({
                        fieldId: 'parent',
                    })
                    
                    let lineNum = objRecord.getLineCount({
                        sublistId: 'jobresources',
                    })
                    if (lineNum){
                        for (let i = 0; i < lineNum; i++) {
                            let intResourceId = objRecord.getSublistValue({
                                sublistId: 'jobresources',
                                fieldId: 'jobresource',
                                line: i
                            })

                            if (intEmpId == intResourceId){
                                let intOverridenCost = objRecord.getSublistValue({
                                    sublistId: 'jobresources',
                                    fieldId: 'overridencost',
                                    line: i
                                })
                                let intDefaultCost = objRecord.getSublistValue({
                                    sublistId: 'jobresources',
                                    fieldId: 'defaultcost',
                                    line: i
                                })
                                let objResourceData = {
                                    resourceId: intResourceId,
                                    cost: intOverridenCost ? intOverridenCost : intDefaultCost,
                                    subsidiary: intSubsidiary,
                                    projectId: strProjectId,
                                    customerId: strCustomerId,
                                    memo: 'Time Entry for ' + strSubsidiary + ': ' + strCustomerId + ' ' + strProjectId
                                };                                
                                arrResource.push(objResourceData)
                            }
                        }
                    }
                }
            } catch (error) {
                log.error('getResourceCost', error.message);
            }
            log.debug("getResourceCost arrResource", arrResource)
            return arrResource
        }
        
        const getPostingPeriod = (dtDate) => {
            let arrPostingPeriod = [];
            try {
                const dateObj = new Date(dtDate);
                const month = dateObj.getMonth() + 1; 
                const year = dateObj.getFullYear();

                if (month){
                    strMonth = convertMonth(month)
                }

                let periodName = strMonth + ' ' + year

                log.debug("getPostingPeriod periodName", periodName)
                let objSearch = search.create({
                    type: 'accountingperiod',
                    filters:  ['periodname', 'is', periodName],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                    ]
                });
                
                var searchResultCount = objSearch.runPaged().count;
                if (searchResultCount != 0) {
                    var pagedData = objSearch.runPaged({pageSize: 1000});
                    for (var i = 0; i < pagedData.pageRanges.length; i++) {
                        var currentPage = pagedData.fetch(i);
                        var pageData = currentPage.data;
                        if (pageData.length > 0) {
                            for (var pageResultIndex = 0; pageResultIndex < pageData.length; pageResultIndex++) {
                              let internalId = pageData[pageResultIndex].getValue({name: 'internalid'})
                              arrPostingPeriod.push(internalId);
                            }
                        }
                    }
                }
            } catch (err) {
                log.error('getPostingPeriod', err.message);
            }
            log.debug("getPostingPeriod arrPostingPeriod", arrPostingPeriod)
            return arrPostingPeriod;
        }

        const createJE = (objData) => {
            log.debug('createJE objData', objData)
            try {
                const recJournalEntry = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                });

                recJournalEntry.setValue({
                    fieldId: 'trandate',
                    value: objData.date
                });
    
                recJournalEntry.setValue({
                    fieldId: 'subsidiary',
                    value: objData.subsidiary
                });

                recJournalEntry.setValue({
                    fieldId: 'postingperiod',
                    value: objData.postingPeriod
                });
    
                let isDebitSet = createDebitLines(recJournalEntry, objData)
                let isCreditSet = createCreditLines(recJournalEntry, objData)

                if (isDebitSet && isCreditSet){
                    let journalEntryId = recJournalEntry.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
    
                    if (journalEntryId){
                        log.debug('Journal Entry Created', `Journal Entry ID: ${journalEntryId}`);
    
                        record.submitFields({
                            type: 'customrecord_czo_timesheet_log',
                            id: objData.timesheetLogsId,
                            values: {
                                custrecord_journal_entry_id: journalEntryId, 
                            }
                        })

                        record.submitFields({
                            type: 'timebill',
                            id: objData.timeEntryId,
                            values: {
                                posted: true, 
                            }
                        })
    
                        log.debug('Updated', `Timesheet Logs ID: ${objData.timesheetLogsId}`);
                    }
                }
                
            } catch (e) {
                log.error('Error Creating Journal Entry', e.message);
            }
        }

        const createDebitLines = (journalEntry, objData) => {
            log.debug('journalEntry', journalEntry)
            log.debug('objData', objData)
            let isDebitSet = true
            try {
                // Add a line to the journal entry
                journalEntry.selectNewLine({
                    sublistId: 'line'
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: 605 // 2480 Variable COGS : Project Labour 
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit', // overridencost or defaultcost * Duration (Time Tracking) 
                    value: objData.amount
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: objData.memo // Subsidiary(Text) + CustomerId(Text) + Project Id(Text)
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: objData.projectId // Project Id
                });

                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: objData.location
                });

                journalEntry.commitLine({
                    sublistId: 'line'
                });
                
            } catch (e) {
                log.error('Error Creating Debit Journal Entry', e.message);
                isDebitSet = false
            }
            return isDebitSet
        }
        
        const createCreditLines = (journalEntry, objData) => {
            let isCreditSet = true
            try {

                // Add a line to the journal entry
                journalEntry.selectNewLine({
                    sublistId: 'line'
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: 597 // 2559 Fixed COGS : Labour Recovery
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: objData.amount // overridencost or defaultcost * Duration (Timesheet Log or Time Tracking) 
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: objData.memo // Subsidiary + CustomerId + Project Id
                });
        
                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: objData.projectId // Project Id
                });

                journalEntry.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: objData.location
                });
        
                journalEntry.commitLine({
                    sublistId: 'line'
                });

            } catch (e) {
                log.error('Error Creating Credit Journal Entry', e.message);
                isCreditSet = false
            }
            return isCreditSet
        }

        const convertMonth = (intMonth) => {
            switch (intMonth) {
                case 1:
                    return 'Jan';
                case 2:
                    return 'Feb';
                case 3:
                    return 'Mar';
                case 4:
                    return 'Apr';
                case 5:
                    return 'May';
                case 6:
                    return 'Jun';
                case 7:
                    return 'Jul';
                case 8:
                    return 'Aug';
                case 9:
                    return 'Sep';
                case 10:
                    return 'Oct';
                case 11:
                    return 'Nov';
                case 12:
                    return 'Dec';
                default:
                    return 'Invalid month';
            }
        }
        
        return {afterSubmit}
    });
