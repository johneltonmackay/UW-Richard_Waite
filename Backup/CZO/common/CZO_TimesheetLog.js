/**
* Script to create timesheet record from SL form
* 
* 
* Version    Date            Author           		Remarks
* 1.0		 XX XXX XXXX	 czo		  		    initial script
* 1.1		 17 Jan 2024	 CZO-MK		  		    Support Ticket - Project field not set in timesheet record
*/

define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const Field = czo_constants.TimesheetLogField;
    const {Operator, LogicalOperator, Value} = czo_search;

    class TimesheetLog extends czo_record.Record {
        constructor(record) {
            super(record);
        };

        get submittedBy() {
            return this.getValue({fieldId: Field.SUBMITTED_BY});
        };

        get date() {
            return this.getValue({fieldId: Field.DATE});
        };

        get checkInTime() {
            return this.getValue({fieldId: Field.CHECK_IN_TIME});
        };

        get checkOutTime() {
            return this.getValue({fieldId: Field.CHECK_OUT_TIME});
        };

        get serviceItem() {
            return this.getValue({fieldId: Field.SERVICE_ITEM});
        };

        get mealAllowance() {
            return this.getValue({fieldId: Field.MEAL_ALLOWANCE});
        };

        get customer() {
            return this.getValue({fieldId: Field.PROJECT});
        };

        get timeEntry() {
            return this.getValue({fieldId: Field.TIME_ENTRY});
        };
    };

    return {
        get type() {
            return czo_constants.CustomRecordType.TIMESHEET_LOG;
        },
        cast(record) {
            return new TimesheetLog(record);
        },
        create(options) {
            options.type = this.type;
            return new TimesheetLog(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new TimesheetLog(czo_record.load(options));
        },
        submitTimeEntry(options) {
            czo_record.submitFields({type: this.type, id: options.id, values: {[Field.TIME_ENTRY]: options.value}});
        },
        upsertFromData(options) {
            log.debug({title: 'createFromData', details: options});
            let prefix = 'custrecord_tl';
            let {id, values} = options;
            let timesheetLog = id ? this.load({id, isDynamic: true}) : this.create({isDynamic: true});
            Object.keys(values).forEach((key) => {
                let fieldId = [prefix, key].join('_');
                timesheetLog.setValue({fieldId, value: values[key] || ''});
            });

            return timesheetLog.save({ignoreMandatoryFields: true});
        },
        searchCheckedInTodayDetails(options) {
            let {submittedBy} = options;
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                projectText: {name: Field.PROJECT}
            };
            let search = czo_search.create({
                type: this.type,
                filters: [
                    [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                    [Field.CHECK_OUT_TIME, Operator.ISEMPTY, ''], LogicalOperator.AND,
                    [Field.DATE, Operator.ON, Value.TODAY], LogicalOperator.AND,
                    [Field.SUBMITTED_BY, Operator.IS, submittedBy]
                ],
                columnMap
            });
            let results = search.getJSONResults(columnMap);

            return results.length > 0 ? results[0] : {};
        }
    };
});