define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Operator, LogicalOperator} = czo_search;
    const Field = czo_constants.EntityField;

    class Contact extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_search.Type.CONTACT;
        },
        cast(record) {
            return new Contact(record);
        },
        create(options) {
            options.type = this.type;
            return new Contact(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new Contact(czo_record.load(options));
        },
        searchDetailedList(options) {
            let {project} = options;
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                name: {name: Field.ENTITY_ID},
                jobtitle: {name: Field.JOB_TITLE},
                email: {name: Field.EMAIL},
                phone: {name: Field.PHONE}
            };
            let search = czo_search.create({
                type: this.type,
                filters: [
                    [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                    [Field.JOB_INTERNAL_ID, Operator.IS, project]
                ],
                columnMap
            });

            return search.getJSONResults(columnMap);
        },
        searchIdsByProject(options) {
            let {project} = options;
            let ids = [];
            if (project) {
                let search = czo_search.create({
                    type: this.type,
                    filters: [
                        [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                        [Field.JOB_INTERNAL_ID, Operator.IS, project]
                    ]
                });

                ids = search.ids;
            }

            return ids;
        }
    };
});