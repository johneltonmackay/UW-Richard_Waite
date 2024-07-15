define([
    'N/runtime',
    './CZO_Constants'
], (runtime, czo_constants) => {
    return {
        get executionContext() {
            return runtime.executionContext;
        },
        get envType() {
            return runtime.envType;
        },
        get accountId() {
            return runtime.accountId;
        },
        isFeatureInEffect(name) {
            return runtime.isFeatureInEffect({feature: name});
        },
        getCurrentUser() {
            return runtime.getCurrentUser();
        },
        getUser() {
            return this.getCurrentUser().id + '';
        },
        getCurrentRole() {
            return this.getCurrentUser().role + '';
        },
        getPreference(options) {
            return this.getCurrentUser().getPreference(options);
        },
        getLocale() {
            return this.getPreference({name: czo_constants.Preference.LANGUAGE});
        },
        isUserInterfaceContext() {
            return runtime.executionContext == runtime.ContextType.USER_INTERFACE;
        },
        isCSVImportContext() {
            return runtime.executionContext == runtime.ContextType.CSV_IMPORT;
        },
        isMapReduceContext() {
            return runtime.executionContext == runtime.ContextType.MAP_REDUCE;
        },
        isLocationEnabled() {
            return this.isFeatureInEffect(czo_constants.Feature.LOCATIONS);
        },
        isOneWorld() {
            return this.isFeatureInEffect(czo_constants.Feature.ONE_WORLD);
        },
        getCurrentScript() {
            return runtime.getCurrentScript();
        },
        getScriptParameter(options) {
            return this.getCurrentScript().getParameter(options);
        },
        getBundleId() {
            let me = this;
            if (!me.bundleId) {
                let script = me.getCurrentScript();
                if (script) {
                    me.bundleId = (script.bundleIds || [""])[0];
                }
            }
            return me.bundleId;
        },
        getAccountSubdomain() {
            let accountId = runtime.accountId;
            return accountId.toLowerCase().replace("_", "-");
        },
        getSuiteAppId() {
            return czo_constants.SUITEAPP_ID;
        },
        getFolderPath(url, folderName) {
            let me = this;
            return [url || '', '/c.', runtime.accountId, (me.getBundleId() ? '/suitebundle' + me.getBundleId() : '/suiteapp'), '/', me.getSuiteAppId(), '/', folderName].join('');
        },
        getSrcPath(url) {
            return this.getFolderPath(url, 'src');
        },
        getLibPath(url) {
            return this.getFolderPath(url, 'lib');
        }
    };
});