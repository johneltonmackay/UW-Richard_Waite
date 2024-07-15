define([
    'N/file',
    './CZO_Search',
    './CZO_Record',
    './CZO_Constants'
], (file, czo_search, czo_record, czo_constants) => {
    const {Field} = czo_constants;
    const {Operator, LogicalOperator} = czo_search;
    const keyFieldIdMap = {
        name: Field.NAME,
        parent: Field.PARENT
    };

    class Folder extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    }

    return {
        get type() {
            return czo_search.Type.FOLDER;
        },
        create(options) {
            options.type = this.type;
            return new Folder(czo_record.create(options));
        },
        creatFromData(options) {
            let {values} = options;
            let folder = this.create({isDynamic: true});
            folder.setValues({keyFieldIdMap, values});

            return folder.save({ignoreMandatoryFields: true});
        },
        getFolderId(options) {
            let search = czo_search.create({
                type: this.type,
                filters: [Field.NAME, Operator.IS, options.name]
            });
            let firstResult = search.getFirstResult();
            return firstResult ? firstResult.id : '';
        },
        getFileId(options) {
            let filters = [
                [Field.PREDECESSOR, Operator.IS, options.folderId], LogicalOperator.AND,
                [Field.FILE_NAME, Operator.IS, options.fileName]
            ];
            let columns = [Field.FILE_INTERNAL_ID];
            let search = czo_search.create({type: this.type, filters, columns});

            let firstResult = search.getFirstResult();

            return firstResult ? firstResult.getValue(columns[0]) : '';
        }
    };
});