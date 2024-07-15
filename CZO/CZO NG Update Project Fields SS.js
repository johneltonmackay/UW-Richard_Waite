function updateProjectField()
{
	var projSalesSearch = nlapiSearchRecord("customrecord_project_sales",null,
	[
	   ["custrecord_project","noneof","@NONE@"], 
	   "AND", 
	   ["sum(formulanumeric: max(nvl({custrecord_project.custentity_czo_project_value},0))-sum(nvl({custrecord_value},0)))","notequalto","0"]
	], 
	[
	   new nlobjSearchColumn("custrecord_project",null,"GROUP"), 
	   new nlobjSearchColumn("custrecord_value",null,"SUM"), 
	   new nlobjSearchColumn("custentity_czo_project_value","CUSTRECORD_PROJECT","MAX")
	]
	);

	if (projSalesSearch)
	{
		for (var k = 0; projSalesSearch != null && k < projSalesSearch.length; k++)
		{
			try
			{
				var cols = projSalesSearch[k].getAllColumns();
				var projID = projSalesSearch[k].getValue(cols[0]);
				var projValue = projSalesSearch[k].getValue(cols[1]) || 0;

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
			
			var usage = nlapiGetContext().getRemainingUsage();
			if (usage < 200) 
			{
				var state = nlapiYieldScript();
				// Throw an error or log the yield results
				if (state.status == 'FAILURE')
					throw "Failed to yield script";
				else if (state.status == 'RESUME')
					nlapiLogExecution('DEBUG','Resuming script');
			}
		}
	}

	var tranSearch = nlapiSearchRecord("transaction",null,
	[
	   ["type","anyof","CustInvc","CustCred"], 
	   "AND", 
	   ["mainline","is","F"], 
	   "AND", 
	   ["customer.stage","noneof","CUSTOMER","LEAD","PROSPECT","@NONE@"], 
	   "AND", 
	   ["sum(formulanumeric: sum({amount})-max(nvl({customer.custentity_invoiced_to_date},0)))","notequalto","0"]
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

				var projRec = nlapiLoadRecord('job', projID);
				var projValue = projRec.getFieldValue('custentity_czo_project_value') || 0;
				
				if (projValue > 0)
					var projInvPC = (parseFloat(projInv)*100)/parseFloat(projValue);
				else
					var projInvPC = 0;
						
				nlapiLogExecution('DEBUG', 'projID', projID);
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
			
			var usage = nlapiGetContext().getRemainingUsage();
			if (usage < 200) 
			{
				var state = nlapiYieldScript();
				// Throw an error or log the yield results
				if (state.status == 'FAILURE')
					throw "Failed to yield script";
				else if (state.status == 'RESUME')
					nlapiLogExecution('DEBUG','Resuming script');
			}
		}
	}
}