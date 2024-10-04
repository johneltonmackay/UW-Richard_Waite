function generateInvoice()
{
	var invItem = nlapiGetContext().getSetting('SCRIPT', 'custscript_inv_item');
	var projID = nlapiGetRecordId();
	{
		var pSearch = nlapiSearchRecord("job",null,
		[
		   ["internalid","anyof",projID], 
		   "OR", 
		   ["parent","anyof",projID], 
		   "AND", 
		   ["formulanumeric: nvl({custentity_czo_user_perc_complete},0)-nvl({custentity_czo_invoiced_perc_complete},0)","greaterthan","0"], 
		   "AND", 
		   ["custentity_czo_project_value","greaterthan","0.00"]
		], 
		[
		   new nlobjSearchColumn("internalid").setSort(false),
		   new nlobjSearchColumn("altname"), 
		   new nlobjSearchColumn("customer"), 
		   new nlobjSearchColumn("entitystatus"), 
		   new nlobjSearchColumn("custentity_czo_invoiced_perc_complete"), 
		   new nlobjSearchColumn("custentity_czo_user_perc_complete"), 
		   new nlobjSearchColumn("custentity_czo_project_value"), 
		   new nlobjSearchColumn("formulanumeric").setFormula("nvl({custentity_czo_user_perc_complete},0)-nvl({custentity_czo_invoiced_perc_complete},0)"), 
		   new nlobjSearchColumn("formulacurrency").setFormula("{custentity_czo_project_value}*nvl({custentity_czo_user_perc_complete},0)-nvl({custentity_czo_invoiced_perc_complete},0)")
		]
		);	
		
		var invRec = nlapiCreateRecord('invoice');
		for (var i = 0; pSearch != null && i < pSearch.length; i++)
		{
			var pColumns = pSearch.getAllColumns();
			var invAmt = pSearch.getValue(pColumns[8]);
			var invProj = pSearch.getValue(pColumns[0]);

			nlapiSelectNewLineItem('item');
			nlapiSetCurrentLineItemValue('item', 'job', invProj);
			nlapiSetCurrentLineItemValue('item', 'item', invItem);
			nlapiSetCurrentLineItemValue('item', 'price', -1);
			nlapiSetCurrentLineItemValue('item', 'rate', invAmt);
			nlapiSetCurrentLineItemValue('item', 'quantity', 1);
			nlapiSetCurrentLineItemValue('item', 'amount', invAmt);
			nlapiSetCurrentLineItemValue('item', 'taxcode', 6);
			nlapiSetCurrentLineItemValue('item', 'taxrate1', 15);
					
			nlapiSetCurrentLineItemValue('item', 'tax1amt', invTax);
			nlapiSetCurrentLineItemValue('item', 'grossamt', invGross);
			nlapiCommitLineItem('item');

		}
		var invId = nlapiSubmitRecord(invRec);
	}
}


			
			