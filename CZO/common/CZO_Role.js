define([
    './CZO_Record',
    './CZO_Search',
    './CZO_Constants'
], (czo_record, czo_search, czo_constants) => {
    const {Field} = czo_constants;

    return {
        get type() {
            return czo_search.Type.ROLE;
        },
        searchIdInResults(options) {
            let {savedSearchId, id} = options;
            let search = czo_search.load({type: this.type, id: savedSearchId});

            return search.ids.indexOf(id) > -1;
        }
    };
});