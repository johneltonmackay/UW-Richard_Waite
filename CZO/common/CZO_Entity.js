define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const Field = czo_constants.EntityField;

    return {
        get type() {
            return czo_search.Type.ENTITY;
        },
        lookupImage(options) {
            options.type = this.type;
            options.columns = [Field.IMAGE];
            let profileImage = '';
            let fieldLookUpObj = czo_search.lookupFields(options);
            if (fieldLookUpObj[Field.IMAGE] && fieldLookUpObj[Field.IMAGE][0]) {
                profileImage = fieldLookUpObj[Field.IMAGE][0].text;
            }

            return profileImage;
        },
        lookupRecordType(options) {
            options.type = this.type;
            options.columns = [Field.RECORD_TYPE];
            let fieldLookUpObj = czo_search.lookupFields(options);

            return fieldLookUpObj[Field.RECORD_TYPE] || '';
        },
        isTypeEmployee(type) {
            return type == czo_record.Type.EMPLOYEE;
        }
    };
});