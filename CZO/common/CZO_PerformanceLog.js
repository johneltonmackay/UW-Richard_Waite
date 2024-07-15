define([], () => {
    let logMap = {};
    return {
        start(name) {
            logMap[name] = new Date();
        },
        end(name) {
            if (logMap[name]) {
                log.debug({title: name, details: 'elapsed time: ' + [(new Date() - logMap[name]) / 1000, 'seconds'].join(' ')});
            }
        }
    };
});