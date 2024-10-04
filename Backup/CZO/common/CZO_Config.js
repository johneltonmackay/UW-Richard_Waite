define([
    'N/config',
    './CZO_Record',
    './CZO_Constants'
], (ns_config, czo_record, czo_constants) => {
    const {Field} = czo_constants;

    class UserPreferences extends  czo_record.Record{
        constructor(record) {
            super(record);
        };

        get timeZone() {
            return this.getValue({fieldId: Field.TIME_ZONE});
        }
    }

    return {
        loadUserPreferences() {
            return new UserPreferences(ns_config.load({type: ns_config.Type.USER_PREFERENCES}));
        }
    };
});