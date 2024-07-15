define([
    '../common/CZO_Constants',
    '../common/CZO_Format',
    '../common/CZO_Script',
    '../common/CZO_ScriptDeployment',
    '../common/CZO_Task'
], (czo_constants, czo_format, czo_script, czo_scriptDeployment, czo_task) => {
    return {
        submitMapReduce(options) {
            log.debug({title: 'submitMapReduce', details: options});
            if (options) {
                let mapReduceTask = czo_task.createMapReduce(options);
                try {
                    mapReduceTask.submit();
                } catch (e) {
                    log.error({title: 'submitMapReduce', details: czo_format.exceptionToString(e)});
                    let scriptInternalId = czo_script.getMapReduceScriptInternalId(options.scriptId);
                    let deploymentId = czo_scriptDeployment.createEntry({defaultValues: {script: scriptInternalId}});
                    log.debug({title: 'deploymentId', details: deploymentId});
                    mapReduceTask.submit();
                }
            }
        },
        submitScheduledScript(options) {
            log.debug({title: 'submitScheduledScript', details: options});
            if (options) {
                let scheduledScriptTask = czo_task.createScheduledScript(options);
                try {
                    scheduledScriptTask.submit();
                } catch (e) {
                    log.error({title: 'submitScheduledScript', details: czo_format.exceptionToString(e)});
                    let scriptInternalId = czo_script.getScheduledScriptInternalId(options.scriptId);
                    let deploymentId = czo_scriptDeployment.createEntry({defaultValues: {script: scriptInternalId}});
                    log.debug({title: 'deploymentId', details: deploymentId});
                    scheduledScriptTask.submit();
                }
            }
        }
    };
});