define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Operator, LogicalOperator} = czo_search;
    const Field = czo_constants.CostCentreField;

    class CostCentre extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_constants.CustomRecordType.COST_CENTRE;
        },
        cast(record) {
            return new CostCentre(record);
        },
        create(options) {
            options.type = this.type;
            return new CostCentre(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new CostCentre(czo_record.load(options));
        },
        searchList(options) {
            let {projectId} = options;
            let columnMap = {
                description: {name: Field.DESCRIPTION},
                budgetHours: {name: Field.BUDGET_HOURS}
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