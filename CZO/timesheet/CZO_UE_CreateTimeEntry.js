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
    '../common/CZO_TimeEntry'
], (czo_constants, czo_format, czo_timesheetLog, czo_timeEntry) => {
    return {
        afterSubmit(context) {
            try {
                const {newRecord, type, UserEventType} = context;
                if (type == UserEventType.EDIT) {
                    const {id} = newRecord;
                    let timesheetLog = czo_timesheetLog.load({id});
                    let {submittedBy, date, checkInTime, checkOutTime, serviceItem, mealAllowance, customer, timeEntry} = timesheetLog;
                    log.debug({title: 'timesheetLog', details: {submittedBy, date, checkInTime, checkOutTime, serviceItem, mealAllowance, customer, timeEntry}});
                    if (checkOutTime && !timeEntry) {
                        let hours = czo_format.floatToRounded((checkOutTime - checkInTime) / (60 * 60 * 1000), 2);
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
            } catch(e) {
                log.error({title: 'afterSubmit: Unexpected Error', details: czo_format.exceptionToString(e)});
            }
        }
    };
});