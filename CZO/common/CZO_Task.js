define([
    'N/task'
], (task) => {
    return {
        submitScheduledScript(options) {
            options.taskType = task.TaskType.SCHEDULED_SCRIPT;
            let ssTask = task.create(options);
            return ssTask.submit();
        },
        submitMapReduce(options) {
            options.taskType = task.TaskType.MAP_REDUCE;
            let mapReduceTask = task.create(options);
            return mapReduceTask.submit();
        },
        createScheduledScript(options) {
            options.taskType = task.TaskType.SCHEDULED_SCRIPT;
            return task.create(options);
        },
        createMapReduce(options) {
            options.taskType = task.TaskType.MAP_REDUCE;
            return task.create(options);
        }
    };
});