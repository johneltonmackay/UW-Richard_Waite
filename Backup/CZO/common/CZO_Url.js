define([
    'N/url'
], (url) => {
    return {
        redirect(options) {
            return url.redirect(options);
        },
        resolveDomain(options) {
            return url.resolveDomain(options);
        },
        resolveRecord(options) {
            return url.resolveRecord(options);
        },
        resolveScript(options) {
            return url.resolveScript(options);
        },
        getTransactionUrl(tranType, id) {
            let domain = this.resolveDomain({hostType: url.HostType.APPLICATION});

            return ['https://', domain, '/app/accounting/transactions/', tranType.toLowerCase(), '.nl?id=', id].join('');
        },
        getRecordUrl(options) {
            let domain = this.resolveDomain({hostType: url.HostType.APPLICATION});
            let recordUrl = this.resolveRecord(options)

            return ['https://', domain, recordUrl].join('');
        },
        getScriptStatusUrl(scriptId) {
            let domain = this.resolveDomain({hostType: url.HostType.APPLICATION});
            let scriptStatusUrl = '/app/common/scripting/mapreducescriptstatus.nl?daterange=TODAY&scripttype={id}&primarykey=';

            return ['https://', domain, scriptStatusUrl.replace('{id}', scriptId)].join('');
        },
        getParamValue(name) {
            let matches = location.href.match(new RegExp('[?&]' + name + '=([^&]*)'));
            return matches && matches[1];
        },
        removeParam(url, param) {
            let sep = "&";
            let start = url.indexOf("&" + param + "=");
            if (start == -1) {
                start = url.indexOf("?" + param + "=");
                sep = "?";
            }
            if (start != -1) {
                let end = url.indexOf("&", start + 1);
                return url.substring(0, start) + (end > 0 ? (sep == "?" ? "?" + url.substr(end + 1) : url.substr(end)) : "");
            }
            return url;
        },
        addParam(url, param, value, replace) {
            let me = this;
            if (!url || !param) {
                return url;
            }
            if (url.length && url.charAt(url.length - 1) == '#') {
                url = url.substring(0, url.length - 1);
            }

            if (url.length && url.indexOf('#') > -1) {
                url = url.substring(0, url.indexOf('#'));
            }

            if (replace) {
                url = me.removeParam(url, param);
            }

            return (url + (url.indexOf("?") == -1 ? "?" : "&")) + param + "=" + (value || '');
        },
        addParams(url, params, replace) {
            let me = this;
            params = params || {};

            for (let paramId in params) {
                url = me.addParam(url, paramId, params[paramId], replace);
            }

            return url;
        },
        replaceCurrent(url) {
            window.history.replaceState({}, '', url);
        },
        addToHistory(url) {
            window.history.pushState({}, '', url);
        }
    };
});