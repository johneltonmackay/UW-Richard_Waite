define([
    './CZO_Search',
    './CZO_Record',
    './CZO_Constants'
], (czo_search, czo_record, czo_constants) => {
    let Field = czo_constants.TransactionField;
    let Sublist = czo_constants.Sublist;
    let TypeShort = czo_constants.TransactionTypeShort;
    let TypeName = czo_constants.TransactionTypeName;
    let TypeId = czo_constants.TransactionTypeInternalId;
    let SublistField = czo_constants.SublistField;
    let AddressField = czo_constants.AddressField;

    class StandardTransaction extends czo_record.Record {
        constructor(record) {
            super(record);
        };

        get typeShort() {
            return TypeShort[this.type.toUpperCase()] || '';
        };

        get typeName() {
            return TypeName[this.type.toUpperCase()] || '';
        };

        get typeId() {
            return TypeId[this.type.toUpperCase()] || '';
        };

        get tranId() {
            return this.getValue({fieldId: Field.TRAN_ID});
        };

        get otherReferenceNumber() {
            return this.getValue({fieldId: Field.OTHER_REFERENCE_NUMBER});
        };

        get date() {
            return this.getValue({fieldId: Field.DATE});
        };

        get tranDate() {
            return this.getValue({fieldId: Field.TRAN_DATE});
        };

        get tranDateText() {
            return this.getText({fieldId: Field.TRAN_DATE});
        };

        get entity() {
            return this.getValue({fieldId: Field.ENTITY});
        };

        get entityName() {
            return this.getText({fieldId: Field.ENTITY});
        };

        get total() {
            return this.getValue({fieldId: Field.TOTAL}) || 0;
        };

        get subsidiary() {
            return this.getValue({fieldId: Field.SUBSIDIARY});
        };

        get department() {
            return this.getValue({fieldId: Field.DEPARTMENT});
        };

        get class() {
            return this.getValue({fieldId: Field.CLASS});
        };

        get location() {
            return this.getValue({fieldId: Field.LOCATION});
        };

        get job() {
            return this.getValue({fieldId: Field.JOB});
        };

        get status() {
            return this.getValue({fieldId: Field.STATUS});
        };

        get statusRef() {
            return this.getValue({fieldId: Field.STATUS_REF});
        };

        get createdFrom() {
            return this.getValue({fieldId: Field.CREATED_FROM}) || '';
        };

        get memo() {
            return this.getValue({fieldId: Field.MEMO});
        };

        get createdFromTranId() {
            let tranId = '';
            let text = this.getText({fieldId: Field.CREATED_FROM}) || '';
            if (text) {
                let arr = text.split('#');
                tranId = arr[1];
            }

            return tranId;
        };

        get location() {
            return this.getValue({fieldId: Field.LOCATION});
        };

        get approvalStatus() {
            return this.getValue({fieldId: Field.APPROVAL_STATUS});
        };

        get entityStatus() {
            return this.getValue({fieldId: Field.ENTITY_STATUS});
        };

        get orderStatus() {
            return this.getValue({fieldId: Field.ORDER_STATUS});
        };

        get landedCostPerline() {
            return this.getValue({fieldId: Field.LANDED_COST_PER_LINE});
        };

        get currency() {
            return this.getValue({fieldId: Field.CURRENCY});
        };

        get exchangeRate() {
            return this.getValue({fieldId: Field.EXCHANGE_RATE});
        };

        isItemSublist(sublistId) {
            return sublistId == Sublist.ITEM
        };

        set date(value) {
            this.setValue({fieldId: Field.DATE, value: value});
        };

        set tranDate(value) {
            this.setValue({fieldId: Field.TRAN_DATE, value: value});
        };

        set memo(value) {
            this.setValue({fieldId: Field.MEMO, value: value});
        };

        set subsidiary(value) {
            this.setValue({fieldId: Field.SUBSIDIARY, value: value});
        };

        set department(value) {
            this.setValue({fieldId: Field.DEPARTMENT, value: value});
        };

        set class(value) {
            this.setValue({fieldId: Field.CLASS, value: value});
        };

        set location(value) {
            this.setValue({fieldId: Field.LOCATION, value: value});
        };

        set entity(value) {
            this.setValue({fieldId: Field.ENTITY, value: value});
        };

        set nextApprover(value) {
            this.setValue({fieldId: Field.NEXT_APPROVER, value: value});
        };

        set customForm(value) {
            this.setValue({fieldId: Field.CUSTOM_FORM, value: value});
        };

        set job(value) {
            this.setValue({fieldId: Field.JOB, value: value});
        };

        set postingPeriod(value) {
            this.setValue({fieldId: Field.POSTING_PERIOD, value: value});
        };

        setCurrentItemInventoryAssignments(options) {
            let me = this;
            let inventoryFieldId = options.inventoryFieldId;
            let inventoryAssignments = options.inventoryAssignments;
            let sublistId = Sublist.INVENTORY_ASSIGNMENT
            let subRecord = this.getCurrentSublistSubrecord({
                sublistId: Sublist.ITEM,
                fieldId: SublistField.INVENTORY_DETAIL
            });
            inventoryAssignments.forEach(function (inventoryAssignment) {
                this.setCurrentItemInventoryAssignment({
                    subRecord: subRecord,
                    inventoryFieldId: inventoryFieldId,
                    number: inventoryAssignment.number,
                    quantity: inventoryAssignment.quantity
                });
            })
        };

        setCurrentItemInventoryAssignment(options) {
            let subRecord = options.subRecord;
            if (!subRecord) {
                subRecord = this.getCurrentSublistSubrecord({
                    sublistId: Sublist.ITEM,
                    fieldId: SublistField.INVENTORY_DETAIL
                });
            }
            subRecord.selectNewLine({sublistId: sublistId});
            subRecord.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: SublistField.QUANTITY,
                value: options.quantity
            });
            subRecord.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: options.inventoryFieldId,
                value: options.number
            });
            subRecord.commitLine({sublistId: sublistId});
        }

        setItemInventoryAssignment(options) {
            let inventoryFieldId = options.inventoryFieldId;
            let number = options.number;
            let quantity = options.quantity;
            let sublistId = Sublist.INVENTORY_ASSIGNMENT;
            let subRecord = this.getSublistSubrecord({
                sublistId: Sublist.ITEM,
                fieldId: SublistField.INVENTORY_DETAIL,
                line: options.line
            });
            if (subRecord) {
                subRecord.setSublistValue({sublistId: sublistId, fieldId: inventoryFieldId, value: number, line: 0});
                subRecord.setSublistValue({sublistId: sublistId, fieldId: SublistField.QUANTITY, value: quantity, line: 0});
            }
        };

        getItemLines(options) {
            options.sublistId = Sublist.ITEM;
            return this.getSublistLines(options);
        };

        getExpenseLines() {
            options.sublistId = Sublist.EXPENSE;
            return this.getSublistLines(options);
        };

        getItemSublistValue(options) {
            return this.getSublistValue({sublistId: Sublist.ITEM, fieldId: options.fieldId, line: options.line});
        };

        getAddressDetails(options) {
            let details = {}
            let {fieldId} = options;
            let subRecord = this.getSubrecord({fieldId});
            let keyFieldIdMap = {
                country: AddressField.COUNTRY,
                attention: AddressField.ATTENTION,
                phone: AddressField.PHONE,
                addr1: AddressField.ADDR1,
                addr2: AddressField.ADDR2,
                addr3: AddressField.ADDR3,
                city: AddressField.CITY,
                state: AddressField.STATE,
                zip: AddressField.ZIP
            };
            Object.keys(keyFieldIdMap).forEach((key) => {
                let fieldId = keyFieldIdMap[key];
                if (fieldId) {
                    details[key] = subRecord.getValue({fieldId}) || '';
                }
            });

            return details;
        };

        getBillingAddress() {
            return this.getAddressDetails({fieldId: Field.BILLING_ADDRESS});
        };

        getShippingAddress() {
            return this.getAddressDetails({fieldId: Field.SHIPPING_ADDRESS});
        };

        setShippingAddress(options) {
            let subRecord = this.getSubrecord({fieldId: Field.SHIPPING_ADDRESS});
            subRecord.setValue({fieldId: AddressField.COUNTRY, value: options.countryCode || ''});
            subRecord.setValue({fieldId: AddressField.CITY, value: options.city || ''});
            subRecord.setValue({fieldId: AddressField.STATE, value: options.state || ''});
            subRecord.setValue({fieldId: AddressField.ZIP, value: options.zip || ''});
            subRecord.setValue({fieldId: AddressField.ADDR1, value: options.addr1 || ''});
            subRecord.setValue({fieldId: AddressField.ADDR2, value: options.addr2 || ''});
            subRecord.setValue({fieldId: AddressField.ADDR3, value: options.addr3 || ''});
            subRecord.setValue({fieldId: AddressField.ADDRESSEE, value: options.addressee || ''});
            subRecord.setValue({fieldId: AddressField.ATTENTION, value: options.attention || ''});
            subRecord.setValue({fieldId: AddressField.PHONE, value: options.phone || ''});
        };
    };

    return {
        StandardTransaction: StandardTransaction
    };
});