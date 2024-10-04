define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Operator, LogicalOperator, FormulaField} = czo_search;
    const Field = czo_constants.EntityField;

    class Project extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_search.Type.JOB;
        },
        cast(record) {
            return new Project(record);
        },
        create(options) {
            options.type = this.type;
            return new Project(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new Project(czo_record.load(options));
        },
        lookupEntityId(options) {
            options.type = this.type;
            options.columns = [Field.ENTITY_ID];
            let fieldLookUpObj = czo_search.lookupFields(options);
            return fieldLookUpObj[Field.ENTITY_ID] || '';
        },
        searchSelectOptions(options) {
            let {contractor} = options || {};
            let filters = [Field.IS_INACTIVE, Operator.IS, false];
            if (contractor) {
                filters = [
                    filters, LogicalOperator.AND,
                    [
                        [Field.FOREMAN, Operator.IS, contractor], LogicalOperator.OR,
                        [Field.ADDITIONAL_FOREMAN, Operator.IS, contractor]
                    ]
                ];
            }
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                name: { name: FormulaField.TEXT, formula: `{${Field.ENTITY_ID}}||' '||{${Field.JOB_NAME}}` }
            };
            let search = czo_search.create({type: this.type, filters, columnMap});

            return search.getJSONResults(columnMap);
        },
        searchDetails(options) {
            let {id} = options;
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                name: {name: Field.COMPANY_NAME},
                customerText: {name: Field.CUSTOMER},
                address: {name: Field.PROJECT_ADDRESS},
                city: {name: Field.PROJECT_CITY},
                salesmanText: {name: Field.SALESMAN},
                projectManagerText: {name: Field.PROJECT_MANAGER},
                foremanText: {name: Field.FOREMAN},
                jobDocsURL: {name: Field.JOB_DOCS},
                scopeOfWorks: {name: Field.SCOPE_OF_WORKS},
                exclusions: {name: Field.EXCLUSIONS},
                method: {name: Field.METHOD},
                deliverables: {name: Field.DELIVERABLES},
                statusText: {name: Field.ENTITY_STATUS}
            };
            let search = czo_search.create({
                type: this.type,
                filters: [Field.INTERNAL_ID, Operator.IS, id],
                columnMap
            });
            let jsonResults = search.getJSONResults(columnMap)
            return jsonResults[0] || {};
        },
        searchDetailedList(options) {
            let {contractor, status} = options;
            let filters = [Field.IS_INACTIVE, Operator.IS, false];
            if (status) {
                filters = [
                    filters, LogicalOperator.AND,
                    [Field.STATUS, Operator.IS, status]
                ];
            }
            if (contractor) {
                filters = [
                    filters, LogicalOperator.AND,
                    [
                        [Field.FOREMAN, Operator.IS, contractor], LogicalOperator.OR,
                        [Field.ADDITIONAL_FOREMAN, Operator.IS, contractor]
                    ]
                ];
            }
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                name: {name: Field.ENTITY_ID},
                altName: {name: Field.ALT_NAME},
                foremanText: {name: Field.FOREMAN},
            };
            let search = czo_search.create({type: this.type, filters, columnMap});

            return search.getJSONResults(columnMap);
        },
        searchSubProjectList(options) {
            let {parentId} = options;
            let columnMap = {
                id: {name: Field.INTERNAL_ID},
                name: {name: Field.ENTITY_ID},
                altName: {name: Field.ALT_NAME}
            };
            let search = czo_search.create({
                type: this.type,
                filters: [
                    [Field.IS_INACTIVE, Operator.IS, false], LogicalOperator.AND,
                    [Field.PARENT_ID, Operator.IS, parentId]
                ],
                columnMap
            });

            return search.getJSONResults(columnMap);
        }
    };
});