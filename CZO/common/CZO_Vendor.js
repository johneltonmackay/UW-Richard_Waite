define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const Field = czo_constants.EntityField;

    class Vendor extends czo_record.Record {
        constructor(record) {
            super(record);
        };
    };

    return {
        get type() {
            return czo_search.Type.VENDOR;
        },
        cast(record) {
            return new Vendor(record);
        },
        create(options) {
            options.type = this.type;
            return new Vendor(czo_record.create(options));
        },
        load(options) {
            options.type = this.type;
            return new Vendor(czo_record.load(options));
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
        }
    };
});