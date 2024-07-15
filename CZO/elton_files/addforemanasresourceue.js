/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/url', 'N/http'],
    
    (record, search, runtime, url, http) => {
        const afterSubmit = (scriptContext) => {
            log.debug("CONTEXT: ", scriptContext.type);
            try {
                let arrProjectResources = []
                let newRecord = scriptContext.newRecord;
                let recType = newRecord.type
                let strId = newRecord.id
                let objRecord = record.load({
                        type: recType,
                        id: strId,
                        isDynamic: true,
                });
                log.debug("objRecord", objRecord)
                if (objRecord){

                    let intForemanID = objRecord.getValue({
                        fieldId: 'custentity_czo_foreman'
                    });
                    
                    let arrAddForemanID = objRecord.getValue({
                        fieldId: 'custentity_czo_add_foreman'
                    });
                    
                    arrAddForemanID.forEach(id => {
                        if (!arrProjectResources.includes(id)) {
                            arrProjectResources.push(id);
                        }
                    });
                    
                    if (intForemanID && !arrProjectResources.includes(intForemanID)) {
                        arrProjectResources.push(intForemanID);
                    }
                    
                    log.debug("afterSubmit arrProjectResources", arrProjectResources);
                    

                    if (arrProjectResources.length > 0) {
                        let numLines = objRecord.getLineCount({ sublistId: 'jobresources' });
                        log.debug("numLines", numLines);

                        let arrExistingResource = []; // Initialize the array to store values

                        for (let i = 0; i < numLines; i++) {
                            let intExistingResource = objRecord.getSublistValue({
                                sublistId: 'jobresources',
                                fieldId: 'jobresource',
                                line: i
                            });
                            if (intExistingResource) {
                                arrExistingResource.push(intExistingResource);
                            }
                        }

                        log.debug("arrExistingResource", arrExistingResource);

                        let objAdditionalResource = searchForeman(arrProjectResources);

                        objAdditionalResource = objAdditionalResource.filter(item => !arrExistingResource.includes(item.internalId));

                        log.debug("objAdditionalResource after removal", objAdditionalResource);

                        for (let x = numLines; x < numLines + objAdditionalResource.length; x++) {
                            objRecord.selectNewLine({ sublistId: 'jobresources' });
                            objRecord.setCurrentSublistValue({
                                sublistId: 'jobresources',
                                fieldId: 'jobresource',
                                value: objAdditionalResource[x - numLines].internalId
                            });

                            if (objAdditionalResource[x - numLines].email){
                                objRecord.setCurrentSublistValue({
                                    sublistId: 'jobresources',
                                    fieldId: 'email',
                                    value: objAdditionalResource[x - numLines].email
                                });
                            }

                            objRecord.setCurrentSublistValue({
                                sublistId: 'jobresources',
                                fieldId: 'overridencost',
                                value: 100
                            });
                            objRecord.commitLine({ sublistId: 'jobresources' });
                        }
                        var recordId = objRecord.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        log.debug("recordId" + recType, recordId);
                    }
                }
            } catch (err) {
                log.error('afterSubmit', err.message);
            }
        }

        function searchForeman(intForemanID){
            let arrForeman = [];
              try {
                  let objEntitySearch = search.create({
                      type: 'entity',
                      filters:  ['internalid', 'anyof', intForemanID],
                      columns: [
                          search.createColumn({ name: 'internalid' }),
                          search.createColumn({ name: 'entityid', sort: search.Sort.ASC }),
                          search.createColumn({ name: 'altname' }),
                          search.createColumn({ name: 'email' }),
                      ]
                  });
                  
                  var searchResultCount = objEntitySearch.runPaged().count;
                  if (searchResultCount != 0) {
                      var pagedData = objEntitySearch.runPaged({pageSize: 1000});
                      for (var i = 0; i < pagedData.pageRanges.length; i++) {
                          var currentPage = pagedData.fetch(i);
                          var pageData = currentPage.data;
                          if (pageData.length > 0) {
                              for (var pageResultIndex = 0; pageResultIndex < pageData.length; pageResultIndex++) {
                                arrForeman.push({
                                      internalId: pageData[pageResultIndex].getValue({name: 'internalid'}),
                                      entityId: pageData[pageResultIndex].getValue({name: 'entityid'}),
                                      name: pageData[pageResultIndex].getValue({name: 'altname'}),
                                      email: pageData[pageResultIndex].getValue({name: 'email'}),
                                  });
                              }
                          }
                      }
                  }
              } catch (err) {
                  log.error('searchForeman', err.message);
              }
              log.debug("searchForeman arrForeman", arrForeman)
              return arrForeman;
          }

        return {afterSubmit}
    });
