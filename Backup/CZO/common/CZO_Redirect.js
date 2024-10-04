define([
    'N/redirect'
], (ns_redirect) => {
    return {
        redirect(options) {
            ns_redirect.redirect(options);
        },
        toRecord(options) {
            ns_redirect.toRecord(options);
        },
        toSuitelet(toSuitelet) {
            ns_redirect.toSuitelet(toSuitelet);
        }
    };
});