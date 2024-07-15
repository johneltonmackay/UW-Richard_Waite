define([
    'N/email'
], (email) => {
    return {
        send(options) {
            log.debug({title: 'send', details: options});
            return email.send(options);
        }
    };
});