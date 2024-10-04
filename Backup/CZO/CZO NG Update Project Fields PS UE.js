function afterSubmitPS(type)
{
	if ((type == 'create') || (type == 'edit'))
    {
		var psID = nlapiGetRecordId();
		var psRec = nlapiGetNewRecord();
		var projID = psRec.getFieldValue('custrecord_project');
		
		if (projID)
		{
			var projSalesSearch = nlapiSearchRecord("customrecord_project_sales",null,
			[
			   ["custrecord_project","anyof", projID]
			], 
			[
			   new nlobjSearchColumn("custrecord_project",null,"GROUP"), 
			   new nlobjSearchColumn("custrecord_value",null,"SUM"), 
			   new nlobjSearchColumn("custentity_czo_project_value","CUSTRECORD_PROJECT","MAX")
			]
			);

			if (projSalesSearch)
			{
				try
				{
					var cols = projSalesSearch[0].getAllColumns();
					var projID = projSalesSearch[0].getValue(cols[0]);
					var projValue = projSalesSearch[0].getValue(cols[1]) || 0;

					var projRec = nlapiLoadRecord('job', projID);
					var projInv = projRec.getFieldValue('custentity_invoiced_to_date') || 0;
						
					if (projValue > 0)
						var projInvPC = (parseFloat(projInv)*100)/parseFloat(projValue);
					else
						var projInvPC = 0;
					
					nlapiLogExecution('DEBUG', 'projID', projID);
					nlapiLogExecution('DEBUG', 'projValue', projValue);
					nlapiLogExecution('DEBUG', 'projInvPC', projInvPC);
					projRec.setFieldValue('custentity_czo_project_value', projValue);
					projRec.setFieldValue('custentity_czo_invoiced_perc_complete', projInvPC);
					nlapiSubmitRecord(projRec, true, true);
				}
				catch(e)
				{
					nlapiLogExecution('DEBUG','ERROR', e.message);
				}
			}		
		}
	}
}