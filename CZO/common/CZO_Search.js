define([
    'N/search',
    './CZO_Constants'
], (search, czo_constants) => {

    class Search {
        constructor(options) {
            this.search = options.search;
            this.columns = options.search.columns;
        }

        addColumns(options) {
            let additionalColumns = options.columnMap ? Object.keys(options.columnMap).map((key) => {
                return options.columnMap[key];
            }) : options.columns;
            this.search.columns = this.search.columns.concat(additionalColumns);
            this.columns = this.search.columns;
        };

        replaceColumns(options) {
            this.search.columns = options.columns;
            this.columns = this.search.columns;
        };

        addFilterExpression(filterExpression) {
            let me = this;
            this.search.filterExpression = [me.search.filterExpression, LogicalOperator.AND, filterExpression];
        };

        addFilter(filter) {
            this.search.filters.push(filter);
        };

        run() {
            return this.search.run();
        };

        runPaged(options) {
            return this.search.runPaged(options);
        };

        get ids() {
            let ids = [];

            this.search.run().each((result) => {
                ids.push(result.id);

                return true;
            });

            return ids;
        };

        getResults(options) {
            let limit = 4000;
            let allResults = [];
            let rs = this.search.run();

            rs.each((result) => {
                allResults.push(result);

                return allResults.length < limit;
            });

            if (allResults.length == limit) {
                let start = limit;
                let results = [];
                do {
                    results = rs.getRange({
                        start: start,
                        end: start + 1000
                    });
                    allResults = allResults.concat(results);
                    start += 1000;
                } while (results.length > 0);
            }

            return allResults;
        };

        getPagedResults(options) {
            options = options || {pageSize: 1000}
            let allResults = [];
            let pagedData = this.search.runPaged(options);
            pagedData.pageRanges.forEach((pageRange) => {
                let page = pageRange.fetch({index: pageRange.index});
                page.data.forEach((result) => {
                    allResults.push(result);
                });
            });

            return allResults;
        };

        getJSONResults(keyColumnMap) {
            let jsonResults = [];

            (this.getResults() || []).forEach((result) => {
                let jsonResult = {};
                for (let key in keyColumnMap) {
                    let column = keyColumnMap[key];
                    if (column) {
                        jsonResult[key] = key.indexOf('Text') > -1 ? result.getText(column) : result.getValue(column);
                    }
                }
                jsonResults.push(jsonResult);
            });

            return jsonResults || [];
        };

        getRange(options) {
            let results = this.search.run().getRange(options);

            return results || [];
        };

        getFirstResult() {
            let resultRange = this.getRange({start: 0, end: 1});
            return resultRange.length > 0 ? resultRange[0] : null;
        };
    }

    let CustomType = czo_constants.CustomRecordType;
    let LogicalOperator = {
        AND: 'AND',
        OR: 'OR'
    };
    let FormulaTemplate = czo_constants.FormulaTemplate;
    let DateTime = {
        THIS_FIS_YR: 'thisFiscalYear',
        NEXT_FIS_YR: 'nextFiscalYear',
        THIS_YR: 'thisYear',
        NEXT_YR: 'nextOneYear',
        LAST_YR: 'lastyear',
        TODAY: 'today'
    };
    let FormulaField = {
        NUMERIC: 'formulanumeric',
        TEXT: 'formulatext'
    };
    let Value = {
        NONE: '@NONE@',
        TODAY: 'today',
        THIS_MONTH: 'thismonth',
        THIS_FIS_YR: 'thisFiscalYear',
        NEXT_FIS_YR: 'nextFiscalYear',
        THIS_YR: 'thisYear',
        NEXT_YR: 'nextOneYear',
        LAST_YR: 'lastyear',
    };
    let CheckBox = czo_constants.CheckBox;

    return {
        get Type() {
            return search.Type;
        },
        get Operator() {
            return search.Operator;
        },
        get Summary() {
            return search.Summary;
        },
        get Sort() {
            return search.Sort;
        },
        CustomType,
        LogicalOperator,
        DateTime,
        FormulaTemplate,
        FormulaField,
        Value,
        CheckBox,
        create(options) {
            if (options.columnMap) {
                options.columns = Object.keys(options.columnMap).map((columnKey) => {
                    return options.columnMap[columnKey];
                });
            }
            return new Search({search: search.create(options)});
        },
        load(options) {
            return new Search({search: search.load(options)});
        },
        createFilter(options) {
            return search.createFilter(options);
        },
        createAnyOfStringFilter(options) {
            return search.createFilter({
                name: FormulaField.NUMERIC,
                operator: search.Operator.EQUALTO,
                values: 1,
                formula: FormulaTemplate.CASE_IN_STRINGS.replace("{name}", name).replace("{values}", options.values.join("', '"))
            });
        },
        createColumn(options) {
            return search.createColumn(options);
        },
        lookupFields(options) {
            return search.lookupFields(options);
        }
    };
});