define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    let Field = czo_constants.Field;

    class ScriptDeployment extends czo_record.Record {
        constructor(record) {
            super(record);
        }

        get scriptId() {
            return this.getValue({fieldId: Field.SCRIPT_ID});
        };

        set scriptId(value) {
            this.setValue({fieldId: Field.SCRIPT_ID, value});
        };

        set title(value) {
            this.setValue({fieldId: Field.TITLE, value});
        };
    };

    return {
        get type() {
            return czo_search.Type.SCRIPT_DEPLOYMENT;
        },
        create(options) {
            options.type = this.type;
            return new ScriptDeployment(czo_record.create(options));
        },
        createEntry(options) {
            let {title, scriptId} = options;
            let record = this.create(options);
            if (title) {
                record.title = title;
            }
            if (scriptId) {
                record.scriptId = scriptId;
            }
            return record.save();
        }
    };
});