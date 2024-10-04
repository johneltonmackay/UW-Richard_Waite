define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Operator, LogicalOperator} = czo_search;
    const Field = czo_constants.SpecificationField;

    class Specification extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_constants.CustomRecordType.SPECIFICATION;
        },
        cast(record) {
            return new Specification(record);
        },
        create(options) {
            options.type = this.type;
            return new Specification(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new Specification(czo_record.load(options));
        },
        searchList(options) {
            let {projectId} = options;
            let columnMap = {
                area: {name: Field.AREA},
                color: {name: Field.COLOR},
                gloss: {name: Field.GLOSS},
                product: {name: Field.PRODUCT},
                supplierText: {name: Field.SUPPLIER}
            };
            let search = czo_search.create({
                type: this.type,
                filters: [
                    [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                    [Field.PROJECT, Operator.IS, projectId]
                ],
                columnMap
            });

            return search.getJSONResults(columnMap);
        }
    };
});