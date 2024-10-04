function generateInvoice()
{
	var invItem = 20;
	var projID = nlapiGetRecordId();
	var projCustomer = nlapiGetFieldValue('customer');
		
	var projCostSearch = nlapiSearchRecord("customrecord_project_sales", null,
	[
	   ["custrecord_project","anyof",projID]
	], 
	[
	   new nlobjSearchColumn("custrecord_value",null,"SUM")
	]
	);
	
	if (projCostSearch)
	{
		var cols = projCostSearch[0].getAllColumns();
		var projAmt = projCostSearch[0].getValue(cols[0]);
		nlapiLogExecution('DEBUG','Post',"projAmt : "+ projAmt);
		
		if (projAmt > 0)
		{
			var pSearch = nlapiSearchRecord("job",null,
			[
			   ["internalid","anyof",projID], 
			   "OR", 
			   ["parent","anyof",projID], 
			   "AND", 
			   ["status","noneof","1"]   
			], 
			[
			   new nlobjSearchColumn("internalid").setSort(false),
			   new nlobjSearchColumn("altname"), 
			   new nlobjSearchColumn("customer"), 
			   new nlobjSearchColumn("entitystatus"), 
			   new nlobjSearchColumn("custentity_czo_invoiced_perc_complete"), 
			   new nlobjSearchColumn("custentity_czo_user_perc_complete")
			]
			);	
			
			var invRec = nlapiCreateRecord('invoice');
			invRec.setFieldValue('entity', projCustomer);
			nlapiLogExecution('DEBUG','Post',"projCustomer : "+ projCustomer);
			var lineCount = 0;
			
			for (var i = 0; pSearch != null && i < pSearch.length; i++)
			{
				var pColumns = pSearch[i].getAllColumns();
				var invProj = pSearch[i].getValue(pColumns[0]);
				var projCompl = pSearch[i].getValue(pColumns[5]);
				
				nlapiLogExecution('DEBUG','Post',"invProj : "+ invProj);
				nlapiLogExecution('DEBUG','Post',"projAmt : "+ projAmt);
				nlapiLogExecution('DEBUG','Post',"projCompl : "+ projCompl);
				
				var filters = new Array();
				filters.push(new nlobjSearchFilter('name',null,'anyof',invProj));
				var results = nlapiSearchRecord('invoice', 'customsearch_czo_proj_pc_compl', filters, null);
		
				if (results)
				{
					var pcCol = results[0].getAllColumns();
					var pcInv = results[0].getValue(pcCol[0]) || 0;
					nlapiLogExecution('DEBUG','Post',"pcInv 1 : "+ pcInv);
				}
				else 
				{
					var pcInv = 0;
					nlapiLogExecution('DEBUG','Post',"pcInv 2 : "+ pcInv);
				}
				
				var invAmt = parseFloat(projAmt)*(parseFloat(projCompl)-parseFloat(pcInv))/100;
				nlapiLogExecution('DEBUG','Post',"invAmt : "+ invAmt);
				
				if (invAmt > 0)
				{				
					invRec.selectNewLineItem('item');
					invRec.setCurrentLineItemValue('item', 'job', invProj);
					invRec.setCurrentLineItemValue('item', 'item', invItem);
					invRec.setCurrentLineItemValue('item', 'price', -1);
					invRec.setCurrentLineItemValue('item', 'rate', invAmt);
					invRec.setCurrentLineItemValue('item', 'quantity', 1);
					invRec.setCurrentLineItemValue('item', 'amount', invAmt);
					invRec.setCurrentLineItemValue('item', 'taxcode', 6);
					invRec.commitLineItem('item');
					lineCount = 1;
				}
			}
			if (lineCount == 1)
			{
				var invId = nlapiSubmitRecord(invRec);
				nlapiSubmitField('job', projID, 'custentity_czo_last_inv', invId);
			}
			else
				nlapiSubmitField('job', projID, 'custentity_czo_last_inv', 'No Invoice');
		}
	}
}


			
			