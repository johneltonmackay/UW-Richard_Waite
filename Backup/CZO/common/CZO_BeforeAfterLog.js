define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Operator, LogicalOperator} = czo_search;
    const Field = czo_constants.BeforeAfterLogField;
    const FIELD_PREFIX = 'custrecord_bal';

    class BeforeAfterLog extends czo_record.Record {
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
    };

    return {
        get type() {
            return czo_constants.CustomRecordType.BEFORE_AFTER_LOG;
        },
        cast(record) {
            return new BeforeAfterLog(record);
        },
        create(options) {
            options.type = this.type;
            return new BeforeAfterLog(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new BeforeAfterLog(czo_record.load(options));
        },
        upsertFromData(options) {
            log.debug({title: 'createFromData', details: options});

            let {id, values} = options;
            let beforeAfterLog = id ? this.load({id, isDynamic: true}) : this.create({isDynamic: true});
            Object.keys(values).forEach((key) => {
                let fieldId = [FIELD_PREFIX, key].join('_');
                beforeAfterLog.setValue({fieldId, value: values[key] || ''});
            });

            return beforeAfterLog.save({ignoreMandatoryFields: true});
        },
        searchDetails(options) {
            let details = {};
            let {projectId} = options;
            if (projectId) {
                let columnMap = {
                    id: {name: Field.INTERNAL_ID}
                };
                for (let i = 1; i <= 15; i++) {
                    ['before_photo', 'after_photo'].forEach((key) => {
                        columnMap[key + i + 'Text'] = {name: [FIELD_PREFIX, key + i].join('_')};
                    });
                }
                let search = czo_search.create({
                    type: this.type,
                    filters: [
                        [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                        [Field.PROJECT, Operator.IS, projectId]
                    ],
                    columnMap
                });
                let jsonResults = search.getJSONResults(columnMap);
                details = jsonResults[0] || {};
            }

            return details;
        }
    };
});