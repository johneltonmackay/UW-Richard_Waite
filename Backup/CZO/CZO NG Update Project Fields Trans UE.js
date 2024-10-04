function afterSubmitInvCM(type)
{
	if ((type == 'create') || (type == 'edit'))
    {
		var tranID = nlapiGetRecordId();
      nlapiLogExecution('DEBUG', 'tranID', tranID);
		var tranSearch = nlapiSearchRecord("transaction",null,
		[
		   ["type","anyof","CustInvc","CustCred"], 
		   "AND", 
		   ["mainline","is","F"], 
		   "AND", 
		   ["customer.stage","noneof","CUSTOMER","LEAD","PROSPECT","@NONE@"], 
		   "AND", 
		   ["internalid","anyof",tranID]
		], 
		[
		   new nlobjSearchColumn("entity",null,"GROUP"), 
		   new nlobjSearchColumn("stage","customer","GROUP"), 
		   new nlobjSearchColumn("amount",null,"SUM"), 
		   new nlobjSearchColumn("custentity_invoiced_to_date","customer","MAX"), 
           new nlobjSearchColumn("internalid","customer","GROUP")
		]
		);

		if (tranSearch)
		{
			for (var k = 0; tranSearch != null && k < tranSearch.length; k++)
			{
				try
				{
					var cols = tranSearch[k].getAllColumns();
					var projID = tranSearch[k].getValue(cols[4]);
					var projInv = tranSearch[k].getValue(cols[2]) || 0;
                    nlapiLogExecution('DEBUG', 'projID', projID);

					var projRec = nlapiLoadRecord('job', projID);
					var projValue = projRec.getFieldValue('custentity_czo_project_value') || 0;
					
					if (projValue > 0)
						var projInvPC = (parseFloat(projInv)*100)/parseFloat(projValue);
					else
						var projInvPC = 0;
					
					
					nlapiLogExecution('DEBUG', 'projInv', projInv);
					nlapiLogExecution('DEBUG', 'projInvPC', projInvPC);
					projRec.setFieldValue('custentity_invoiced_to_date', projInv);
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