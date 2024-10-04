define([
    'N/https'
], (https) => {
    return {
        get Method() {
            return https.Method;
        },
        get(options) {
            return https.get(options);
        },
        post(options) {
            return https.post(options);
        },
        promisedPost(options) {
            return https.post.promise(options.options).then(options.thenCallBack).catch(options.catchCallBack);
        },
        getServerRequest() {
            return https.getServerRequest();
        }
    };
});