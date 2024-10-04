/**
 * Module Description
 * Reprocess Case Audit Log
 *
 * Version    Date            Author           Remarks
 * 1.00       29 Jul 2023     CZO-MRC          Initial Development
 * 1.01       17 Jan 2024     mKasparek        Adding project filed to be set in timesheet record
 *
 * @NApiVersion 2.1
 * @NScriptType usereventscript
 */
define([
    '../common/CZO_Constants',
    '../common/CZO_Format',
    '../common/CZO_TimesheetLog',
    '../common/CZO_TimeEntry',
    'N/search',
    'N/record',
], (czo_constants, czo_format, czo_timesheetLog, czo_timeEntry, search, record) => {

    const beforeSubmit = (context) => {
        try {
            const {newRecord, type, UserEventType} = context; 
            if (type == UserEventType.CREATE){
                let strCheckInnTime = newRecord.getValue({
                    fieldId: 'custrecord_tl_check_in_time'
                })
                let intEmployee = newRecord.getValue({
                    fieldId: 'custrecord_tl_submitted_by'
                })
                let intProject = newRecord.getValue({
                    fieldId: 'custrecord_tl_project'
                })
                log.debug({
                    title: 'beforeSubmit newLogs',
                    details: {
                        strCheckInnTime: strCheckInnTime,
                        intEmployee: intEmployee,
                        intProject: intProject
                    }
                });
                if (strCheckInnTime){
                    let isProjectResource = searchProject(intEmployee, intProject)
    
                    if (!isProjectResource) {
                        let projectId = addProjectResource(intEmployee, intProject)
                        log.debug('beforeSubmit projectId Resource Added', projectId)
                    }
                }
            }
        } catch (err) {
            log.error('beforeSubmit Error', err.message);
        }
    }

    const afterSubmit = (context) => {
        try {
            const {newRecord, type, UserEventType} = context;
            if (type == UserEventType.EDIT) {
                const {id} = newRecord;
                let timesheetLog = czo_timesheetLog.load({id});
                let {submittedBy, date, checkInTime, checkOutTime, serviceItem, mealAllowance, customer, timeEntry, Time_In, Time_Out} = timesheetLog;
                log.debug({title: 'afterSubmit timesheetLog', details: {submittedBy, date, checkInTime, checkOutTime, serviceItem, mealAllowance, customer, timeEntry, Time_In, Time_Out}});
                log.debug({
                    title: 'afterSubmit newLogs',
                    details: {
                        checkInTime,
                        checkOutTime,
                        Time_In,
                        Time_Out,
                        strContext : type,
                        customer,
                        recId: id
                    }
                });
                if (checkOutTime && !timeEntry) {
                    let hours = czo_format.floatToRounded((Time_Out - Time_In) / (60 * 60 * 1000), 2);
                    log.debug({title: 'hours', details: hours});
                    // [1.01][mKasparek][START] Support Ticket - Adding customer to values
                    let timeEntryId = czo_timeEntry.createFromData({values: {
                        employee: submittedBy,
                        tranDate: date,
                        item: serviceItem,
                        hours,
                        mealAllowance,
                        customer,
                        checkInTime,
                        checkOutTime
                    }});
                    // [1.01][mKasparek][END] Support Ticket - Adding customer to values
                    log.debug({title: 'timeEntryId', details: timeEntryId});
                    czo_timesheetLog.submitTimeEntry({id, value: timeEntryId});
                } 
            }
        } catch (err) {
            log.error('afterSubmit Error', err.message);
        }
    }
        
    // Private Function
    function searchProject(submittedBy, customer){
        let isProjectResource = null
        let arrProject = [];
          try {
              let objProjectSearch = search.create({
                  type: 'job',
                  filters:  [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['jobresource', 'anyof', submittedBy],
                    'AND',
                    ['internalid', 'anyof', customer],
                  ],
                  columns: [
                      search.createColumn({ name: 'internalid' }),
                      search.createColumn({ name: 'customer' }),
                      
                  ]
              });
              
              var searchResultCount = objProjectSearch.runPaged().count;
              if (searchResultCount != 0) {
                  var pagedData = objProjectSearch.runPaged({pageSize: 1000});
                  for (var i = 0; i < pagedData.pageRanges.length; i++) {
                      var currentPage = pagedData.fetch(i);
                      var pageData = currentPage.data;
                      if (pageData.length > 0) {
                          for (var pageResultIndex = 0; pageResultIndex < pageData.length; pageResultIndex++) {
                            arrProject.push({
                                  internalId: pageData[pageResultIndex].getValue({name: 'internalid'}),
                                  customerId: pageData[pageResultIndex].getValue({name: 'customer'}),
                              });
                          }
                      }
                  }
              }

              if (arrProject.length > 0){
                isProjectResource = true;
              } else {
                isProjectResource = false;
              }

          } catch (err) {
              log.error('searchProject', err.message);
          }
          log.debug("searchProject arrProject", arrProject)
          return isProjectResource;
    }

    function addProjectResource(submittedBy, customer) {
        log.debug("addProjectResource submittedBy", submittedBy);
        log.debug("addProjectResource customer", customer);
        let recordId = null;
        let maxRetries = 3; 
        let retries = 0;
    
        function trySave() {
            try {
                let objRecord = record.load({
                    type: 'job',
                    id: customer,
                    isDynamic: true,
                });
                log.debug("addProjectResource objRecord", objRecord);
                if (objRecord) {
                    objRecord.selectNewLine({
                        sublistId: 'jobresources',
                    });
                    objRecord.setCurrentSublistValue({
                        sublistId: 'jobresources',
                        fieldId: 'jobresource',
                        value: submittedBy,
                    });
                    objRecord.commitLine({
                        sublistId: 'jobresources',
                    });
                    recordId = objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true,
                    });
                }
            } catch (error) {
                log.error('addProjectResource Error', error.message);
                if (error.message.includes('Record has been changed') && retries < maxRetries) {
                    retries++;
                    log.debug('Retrying save, attempt:', retries);
                    trySave(); 
                } else {
                    throw error; 
                }
            }
        }
    
        trySave(); 
    
        log.debug("addProjectResource recordId", recordId);
        return recordId;
    }
    

    return {beforeSubmit, afterSubmit}
});