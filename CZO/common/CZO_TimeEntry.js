/**
* Script to create timesheet record from SL form
* 
* 
* Version    Date            Author           		Remarks
* 1.0		 XX XXX XXXX	 czo		  		    initial script
* 1.1		 17 Jan 2024	 mKasaprek		  		CRXXX - Project field not set in timesheet record
*/

define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const Field = czo_constants.SublistField;
    const keyFieldIdMap = {
        employee: Field.EMPLOYEE,
        tranDate: Field.TRAN_DATE,
        item: Field.ITEM,
        hours: Field.HOURS,
        mealAllowance: Field.MEAL_ALLOWANCE,
        // [1.1][mKasparek][START] Support Ticket - Project field not set in timesheet record
        customer: Field.PROJECT
        // [1.1][mKasparek][END] Support Ticket - Project field not set in timesheet record
    };

    class TimeEntry extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_search.Type.TIME_BILL;
        },
        cast(record) {
            return new TimeEntry(record);
        },
        create(options) {
            options.type = this.type;
            return new TimeEntry(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new TimeEntry(czo_record.load(options));
        },
        createFromData(options) {
            log.debug({title: 'createFromData', details: options});
            let {values} = options;
            let timeEntry = this.create({isDynamic: true});
            timeEntry.setValues({keyFieldIdMap, values});
            // [1.1][mKasparek][START] Support Ticket - Project field not set in timesheet record
            timeEntry.setValue({
                fieldId: 'customer',
                value: values.customer,
                ignoreFieldChange: true
            });
            timeEntry.setValue({
                fieldId: 'custcol_czo_start_time',
                value: values.checkInTime,
                ignoreFieldChange: true
            });
            timeEntry.setValue({
                fieldId: 'custcol_czo_end_time',
                value: values.checkOutTime,
                ignoreFieldChange: true
            });       
            timeEntry.setValue({
                fieldId: 'item',
                value: 234, // Labour Code
                ignoreFieldChange: true
            }); 
            timeEntry.setValue({
                fieldId: 'location',
                value: 12, // 0 National
                ignoreFieldChange: true
            }); 

            // [1.1][mKasparek][END] Support Ticket - Project field not set in timesheet record
            return timeEntry.save({ignoreMandatoryFields: true});
        }
    };
});