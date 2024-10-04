define([
    './CZO_Search',
    './CZO_Record',
    './CZO_Constants',
    './CZO_StandardTransaction'
], (czo_search, czo_record, czo_constants, czo_standardTransaction) => {
    let Field = czo_constants.TransactionField;
    let Sublist = czo_constants.Sublist;
    let SublistField = czo_constants.SublistField;

    class Transaction extends czo_standardTransaction.StandardTransaction {
        constructor(record) {
            super(record);
        };

        get requireByDateText() {
            return this.getText({fieldId: Field.REQUIRE_BY_DATE});
        }
    };

    return {
        Transaction,
        cast(record) {
            return new Transaction(record);
        },
        create(options) {
            return new Transaction(czo_record.create(options));
        },
        load(options) {
            return new Transaction(czo_record.load(options));
        },
        lookupCreatedFrom(options) {
            options.columns = [Field.CREATED_FROM];
            let createdFrom = '';
            let fieldLookUpObj = czo_search.lookupFields(options);
            let column = fieldLookUpObj[Field.CREATED_FROM];
            if (column && column[0]) {
                createdFrom = column[0].value || ''
            }
            return createdFrom;
        },
        lookupTransactionType(options) {
            options.columns = [Field.TYPE];
            let transactionType = '';
            let fieldLookUpObj = czo_search.lookupFields(options);
            let column = fieldLookUpObj[Field.TYPE];
            if (column && column[0]) {
                transactionType = column[0].value || ''
            }
            return transactionType;
        },
        submitOrderStatus(options) {
            let values = {};
            values[Field.ORDER_STATUS] = options.value;
            czo_record.submitFields({type: options.type, id: options.id, values: values});
        }
    };
});