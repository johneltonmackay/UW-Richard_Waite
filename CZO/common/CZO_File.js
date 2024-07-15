define([
        'N/file',
        './CZO_Search'
    ],
    function (file, f5_search) {
        var TYPE = 'file';
        var FIELDS = {
            URL: 'url'
        };
        return {
            load: function load(options) {
                return file.load(options);
            },
            lookupUrl: function lookupUrl(id) {
                var values = f5_search.lookupFields({type: TYPE, id: id, columns: [FIELDS.URL]});
                return values[FIELDS.URL] || '';
            }
        };
    });