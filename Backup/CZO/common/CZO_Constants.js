define([
    './CZO_StandardConstants'
], (czo_standardConstants) => {
    const constants = {...czo_standardConstants};

    constants.EntityField.SERVICE_ITEM = 'custentity_czo_service_item';
    constants.EntityField.FOREMAN = 'custentity_czo_foreman';
    constants.EntityField.ADDITIONAL_FOREMAN = 'custentity_czo_add_foreman';
    constants.EntityField.PARENT_ID = 'custentity_czo_parent_id';
    constants.EntityField.PROJECT_ADDRESS = 'custentity_czo_pro_address';
    constants.EntityField.PROJECT_CITY = 'custentity_pro_city';
    constants.EntityField.SALESMAN = 'custentity_czo_salesman';
    constants.EntityField.JOB_DOCS = 'custentity_czo_sssp';
    constants.EntityField.SCOPE_OF_WORKS = 'custentity_scope_of_works';
    constants.EntityField.EXCLUSIONS = 'custentity_czo_exclusions';
    constants.EntityField.METHOD = 'custentity_czo_method';
    constants.EntityField.DELIVERABLES = 'custentity_czo_key_deliverables';
    constants.EntityField.JOB_INTERNAL_ID = 'job.internalid';

    constants.SublistField.MEAL_ALLOWANCE = 'custcol_czo_meal_allowance';

    constants.Field.TIME_ZONE = 'TIMEZONE';

    constants.Field.UI_HTML = 'custpage_czo_html';
    constants.Field.UI_FILE = 'custpage_czo_file';
    constants.Field.UI_INPUT_DATA = 'custpage_czo_input_data';

    constants.CustomRecordType = {
        DAILY_5x5_ASSESSMENT: 'customrecord_czo_daily_5x5_safety_assmnt',
        BEFORE_AFTER_LOG: 'customrecord_czo_before_after_log',
        TIMESHEET_LOG: 'customrecord_czo_timesheet_log',
        SPECIFICATION: 'customrecord1361',
        COST_CENTRE: 'customrecord_project_sales'
    };

    constants.CustomRecordTypeId = {
        DAILY_5x5_ASSESSMENT: 1356,
        BEFORE_AFTER_LOG: 1359
    };

    constants.Daily5x5AssessmentField = {...czo_standardConstants.Field};
    constants.Daily5x5AssessmentField.PROJECT = 'custrecord_d5sa_project';
    constants.Daily5x5AssessmentField.CLIENT = 'custrecord_d5sa_client';
    constants.Daily5x5AssessmentField.PROJECT_MANAGER = 'custrecord_d5sa_project_manager';
    constants.Daily5x5AssessmentField.SALESMAN = 'custrecord_d5sa_salesman';

    constants.BeforeAfterLogField = {...czo_standardConstants.Field};
    constants.BeforeAfterLogField.PROJECT = 'custrecord_bal_project';
    constants.BeforeAfterLogField.CLIENT = 'custrecord_bal_client';
    constants.BeforeAfterLogField.PROJECT_MANAGER = 'custrecord_bal_project_manager';

    constants.TimesheetLogField = {...czo_standardConstants.Field};
    constants.TimesheetLogField.PROJECT = 'custrecord_tl_project';
    constants.TimesheetLogField.SUBMITTED_BY = 'custrecord_tl_submitted_by';
    constants.TimesheetLogField.DATE = 'custrecord_tl_date';
    constants.TimesheetLogField.CHECK_IN_TIME = 'custrecord_tl_check_in_time';
    constants.TimesheetLogField.CHECK_OUT_TIME = 'custrecord_tl_check_out_time';
    constants.TimesheetLogField.MEAL_ALLOWANCE = 'custrecord_tl_meal_allowance';
    constants.TimesheetLogField.SERVICE_ITEM = 'custrecord_tl_service_item';
    constants.TimesheetLogField.TIME_ENTRY = 'custrecord_tl_time_entry';

    constants.SpecificationField = {...czo_standardConstants.Field};
    constants.SpecificationField.PROJECT = 'custrecord_czo_s_project';
    constants.SpecificationField.AREA = 'custrecord_czo_s_area';
    constants.SpecificationField.COLOR = 'custrecord_czo_s_color';
    constants.SpecificationField.GLOSS = 'custrecord_czo_s_gloss';
    constants.SpecificationField.PRODUCT = 'custrecord_czo_s_product';
    constants.SpecificationField.SUPPLIER = 'custrecord_czo_s_supplier';

    constants.CostCentreField = {...czo_standardConstants.Field};
    constants.CostCentreField.PROJECT = 'custrecord_project';
    constants.CostCentreField.DESCRIPTION = 'custrecord_description';
    constants.CostCentreField.BUDGET_HOURS = 'custrecord_czo_budget_hours';

    constants.ScriptParameter = {
        SL_MAIN_HTML_FILE_NAME: 'custscript_sl_d5f_main_html_file_name',
        SL_SUBMITTED_HTML_FILE_NAME: 'custscript_sl_d5f_sbmttd_html_file_name',
        SL_ERROR_HTML_FILE_NAME: 'custscript_sl_d5f_error_html_file_name',
        SL_EMAIL_TEMPLATE: 'custscript_sl_d5f_email_template',
        SL_BAF_MAIN_HTML_FILE_NAME: 'custscript_sl_baf_main_html_file_name',
        SL_BAF_SUBMITTED_HTML_FILE_NAME: 'custscript_sl_baf_sbmttd_html_file_name',
        SL_BAF_ERROR_HTML_FILE_NAME: 'custscript_sl_baf_error_html_file_name',
        SL_BAF_EMAIL_TEMPLATE: 'custscript_sl_baf_email_template',
        SL_TF_MAIN_HTML_FILE_NAME: 'custscript_sl_tf_main_html_file_name',
        SL_TF_SUBMITTED_HTML_FILE_NAME: 'custscript_sl_tf_sbmttd_html_file_name',
        SL_TF_ERROR_HTML_FILE_NAME: 'custscript_sl_tf_error_html_file_name',
        SL_PF_MAIN_HTML_FILE_NAME: 'custscript_sl_pf_main_html_file_name',
        SL_PF_DETAIL_HTML_FILE_NAME: 'custscript_sl_pf_detail_html_file_name',
        SL_PF_ERROR_HTML_FILE_NAME: 'custscript_sl_pf_error_html_file_name',
        SL_MLP_MAIN_HTML_FILE_NAME: 'custscript_sl_mlp_main_html_file_name',
        SL_MLP_ERROR_HTML_FILE_NAME: 'custscript_sl_mlp_error_html_file_name',
        DAILY_5x5_FOLDER_ID: 'custscript_czo_daily_5x5_folder_id',
        BEFORE_AFTER_FOLDER_ID: 'custscript_czo_before_after_folder_id',
        DEFAULT_EMAIL_AUTHOR: 'custscript_czo_default_email_author'
    };

    constants.ScriptId = {};

    constants.DeploymentId = {};

    constants.SavedSearch = {
        VENDOR_ROLES: 'customsearch_czo_vendor_roles'
    };

    constants.FileName = {
        JQUERY_SLIM_JS: 'jquery-3.3.1.slim.min.js',
        POPPER_JS: 'popper.min.js',
        BOOTSTRAP_JS: 'bootstrap.js',
        SELECT_2_JS: 'select2.full.min.js',
        BOOTSTRAP_CSS: 'bootstrap.css',
        SELECT_2_CSS: 'select2.min.css',
        ICHECK_BOOTSTRAP_CSS: 'icheck-bootstrap.min.css',
        ADMIN_LTE_CSS: 'adminlte.css',
        STYLE_CSS: 'style.css',
        GENERIC_AVATAR_IMG: 'generic_avatar.png'
    };

    constants.SUITEAPP_ID = 'com.netsuite.nationalgroupui';

    constants.ProjectStatus = {
        IN_PROGRESS: '2'
    };

    return constants;
});