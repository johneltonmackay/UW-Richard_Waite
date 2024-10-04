function recordSave()
{
	var project = nlapiGetFieldValue('custbody_czo_project');
		
	if (project)
	{
		var lineCount = nlapiGetLineItemCount('item');
		for (var k = 1; k <= lineCount; k++) 
		{‌
			nlapiSelectLineItem('item', k);
			nlapiSetCurrentLineItemValue('item', 'customer', project, true, true);
			nlapiCommitLineItem('item');
		}
		
	}
	
	return true;
}