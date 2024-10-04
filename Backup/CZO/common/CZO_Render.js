define([
    'N/render'
], (render) => {
    return {
        PrintMode: render.PrintMode,
        DataSource: render.DataSource,
        mergeEmail(options) {
            return render.mergeEmail(options);
        },
        transaction(options) {
            return render.transaction(options);
        },
        statement(options) {
            return render.statement(options);
        },
        create() {
            return render.create();
        }
    };
});