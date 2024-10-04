define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const Field = czo_constants.Daily5x5AssessmentField;

    class DailyAssessment extends czo_record.Record {
        constructor(record) {
            super(record);
        };

        get project() {
            return this.getValue({fieldId: Field.PROJECT});
        };

        get client() {
            return this.getValue({fieldId: Field.CLIENT});
        };

        get projectManager() {
            return this.getValue({fieldId: Field.PROJECT_MANAGER});
        };

        get salesman() {
            return this.getValue({fieldId: Field.SALESMAN});
        };
    };

    return {
        get type() {
            return czo_constants.CustomRecordType.DAILY_5x5_ASSESSMENT;
        },
        cast(record) {
            return new DailyAssessment(record);
        },
        create(options) {
            options.type = this.type;
            return new DailyAssessment(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new DailyAssessment(czo_record.load(options));
        },
        createFromData(options) {
            log.debug({title: 'createFromData', details: options});
            let prefix = 'custrecord_d5sa';
            let {values} = options;
            let dailyAssessment = this.create({isDynamic: true});
            Object.keys(values).forEach((key) => {
                let fieldId = [prefix, key].join('_');
                dailyAssessment.setValue({fieldId, value: values[key] || ''});
            });

            return dailyAssessment.save({ignoreMandatoryFields: true});
        }
    };
});