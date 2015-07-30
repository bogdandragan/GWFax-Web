var globalOutFaxMessagesData; //for keep loaded data 
var globalInJobsData;
var globalUsers;
var ngApplication;

function InitDataTable(_jqGridName, _jqGridPagerName, _columnsModel, _getDataFunction, _sortname, _sortorder, _caption, _subGridRowExpandedFunction) {
	var currGrid = $("#" + _jqGridName)[0].grid;	
	if  (typeof currGrid == 'undefined') {	
		var needSubGrid = $.isFunction(_subGridRowExpandedFunction); 
		
		$("#" + _jqGridName).jqGrid({
                colModel: _columnsModel,
                viewrecords: true, // show the current page, data rang and total records on the toolbar
                width: 900,
                height: '100%',
                rowNum: 10,
                //scroll: 1,
                rowList: [10, 20, 100],
                sortname: _sortname,
    			sortorder: _sortorder,				
				subGrid: needSubGrid, // set the subGrid property to true to show expand buttons for each row
                subGridRowExpanded: _subGridRowExpandedFunction, // javascript function that will take care of showing the child grid               
				datatype: function(postdata) {	
					var myGrid = $("#" + _jqGridName);
					myGrid.clearGridData().setGridParam({page: postdata.page});
															
					$("#" + _jqGridName)[0].grid.beginReq();//lock grid
									        			
        			_getDataFunction(postdata.rows, postdata.page, postdata.sidx, postdata.sord);
        		},
                pager: "#" + _jqGridPagerName,
				caption: _caption
		});
	}
	else {
		var myGrid = $("#" + _jqGridName);
		myGrid.clearGridData().setGridParam({page: 1});
		myGrid.trigger('reloadGrid');
	}
}

function FormatJobsStatuses(cellValue, options, rowObject) {
	var items = [];
	var currValue;
	
	$.each(cellValue, function(index, value) {
		switch(value) {
		    case 0:
		    case 1:
		    case 2:
		    case 3:
		    case 4:
		    case 5:
		    case 6:
		    case 7:
		    case 8:
		    case 9:
		    case 10:
		    case 11:
		    case 12:
		    case 13:
		    case 14:
        		currValue = '<img src="../assets/images/' + value + '.png"/>';
        		break;
    		default: 
    			currValue = '<img src="../assets/images/black.png"/>';        		
		}		
		items.push(currValue);
	});

	var htmlCell = items.join("  ");
	return htmlCell;
}

function unFormatJobsStatuses(cellValue, options, cellObject) {
	return $(cellObject.html()).attr("originalValue");
}

function ShowFaxMessagesTable(data, controllerScope, clearPreviousData) {
	if (data.rows.length > 0) {		
		var currData = data.rows;		
		AdvanceOutFaxMessagesData(currData);
		
		if (clearPreviousData) {
			globalOutFaxMessagesData = currData;
			//controllerScope.outFaxes = globalOutFaxMessagesData;
		} else {
			globalOutFaxMessagesData = globalOutFaxMessagesData.concat(currData);
			//globalOutFaxMessagesData.push(currData);
			//controllerScope.outFaxes.push(currData);
		}
		controllerScope.outFaxes = globalOutFaxMessagesData;
		
		
		//log(JSON.stringify(data));
		
		/*var myGrid = $("#jqGrid_outfaxes-table")[0]; 						
		myGrid.addJSONData(globalOutFaxMessagesData);
		
		//Set pages count
		var lastPage = Math.floor(data.records / rowsPerPage);
		if ((data.records % rowsPerPage) > 0) {
			lastPage++;
		}
		
		myGrid = $("#jqGrid_outfaxes-table");
		myGrid.setGridParam({lastpage: lastPage});
    	myGrid.setGridParam({records: data.records});  
    	myGrid.each(function() {  
    		if (this.grid) this.updatepager();
    	});
		
		//unlock grid
		$("#jqGrid_outfaxes-table")[0].grid.endReq();
		*/

	}
}

function ShowFaxMessageDetails(data, controllerScope) {
	if (data.rows.length > 0) {		
		var currFaxMessage = data.rows[0];
		AdvanceOutFaxMessage(currFaxMessage);				
		controllerScope.outFax = currFaxMessage;						
	}
}

function AdvanceOutFaxMessagesData(data) {
	for (var i = 0 ; i < data.length ; i++)
	{
    	AdvanceOutFaxMessage(data[i]);
	}
}

function AdvanceOutFaxMessage(messageData) {
	var currTasks;
	var currTasksStatuses;
	var currJobStatus;
	var currTaskStatus;
	
	var currJobs = messageData['JOBS'];
	
	var currEmail = messageData['SENDEREMAIL'];
	messageData['SENDEREMAIL'] = currEmail.trim();
	
	var currJobsStatuses = [];
	var currCollectiveStatus = 1;//all OK
	
	if (typeof currJobs != 'undefined') {  	
    	for (var j = 0 ; j < currJobs.length ; j++) {
    		currJobStatus = currJobs[j]['PROCESSINGSTAGE'];
    		currJobsStatuses.push(currJobStatus);    		    		
    		
    		currTasks = currJobs[j]['TASKS'];
    		currTasksStatuses = [];
    		if (typeof currTasks != 'undefined') {
	    		for (var k = 0 ; k < currTasks.length ; k++) {
	    			currTaskStatus = currTasks[k]['TASKSTATE'];
	    			currTasksStatuses.push(currTaskStatus);
	    			
	    			if (currTaskStatus == 2) { // ERROR
		    			currCollectiveStatus = 2; // ERROR
		    		} else if ((currCollectiveStatus != 2) && (currTaskStatus == 0)) {
		    			currCollectiveStatus = 0; // processing
		    		}    			    			
		    	}
	    	}
	    	messageData['JOBS'][j]['TASKSSTATUSES'] = currTasksStatuses;
	    	messageData['JOBS'][j]['childTableExpanded'] = false;
    	}
	}
	messageData['JOBSSTATUSES'] = currJobsStatuses;    	
	messageData['collectiveStatus'] = currCollectiveStatus;
	messageData['childTableExpanded'] = false;
}

function ShowFaxJobsTable (parentRowID, parentRowKey) {
	var childGridID = 'FaxQueue_' + parentRowID + "_ChildTable";
    var childGridPagerID = 'FaxQueue_' + parentRowID + "_pager";    

    // add a table and pager HTML elements to the parent grid row - we will render the child grid here
    $('#' + parentRowID).append('<table id=' + childGridID + '></table>' + '<div id=' + childGridPagerID + ' class=scroll></div>');
    
    var childData = GetFaxJobsTableData(parentRowKey);

    $("#" + childGridID).jqGrid({
        datatype: "local",
        data: childData,
        colModel: [
                    { label: 'Job ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'Receiver\'s fax', name: 'FAX', width: 120 },                    
                    { label: 'Receiver\'s name', name: 'NAME', width: 120 },
                    { label: 'Creation time', name: 'CREATIONTIME', width: 140 },
                    { label: 'Job state', name: 'JOBSTATE', width: 70 },
                    { label: 'Error message', name: 'ERRMESSAGE', width: 140 },
                    { label: 'Tasks statuses', name: 'TASKSSTATUSES', width: 150, formatter: FormatTasksStatuses }
                    
                ],
		loadonce: true,
		viewrecords: true,
		sortname: 'ID',
    	sortorder: "asc",				
		subGrid: true, // set the subGrid property to true to show expand buttons for each row
        subGridRowExpanded: ShowFaxTasksTable, // javascript function that will take care of showing the child grid 
        //width: 500,
        height: '100%',
        pager: "#" + childGridPagerID
    });
}

function FormatTasksStatuses(cellValue, options, rowObject) {
	var currValue;	
	var items = [];
	
	$.each(cellValue, function(index, value) {
		switch(value) {
		    case 0:
		    	currValue = '<img src="../assets/images/yellow.png"></img>';
        		break;
		    case 1:
		    	currValue = '<img src="../assets/images/green.png"></img>';
        		break;
		    case 2:
		    	currValue = '<img src="../assets/images/red.png"></img>';
        		break;
		    case 3:		    
        		currValue = '<img src="../assets/images/silver.png"></img>';
        		break;
    		default: 
    			currValue = '<img src="../assets/images/black.png"></img>';        		
		}
							
		items.push(currValue);				
	});
	return items.join("  ");
}

function unFormatTasksStatuses(cellValue, options, cellObject) {
	return $(cellObject.html()).attr("originalValue");
}

function GetFaxJobsTableData (faxQueueID) {
	for (var i=0 ; i < globalOutFaxMessagesData.length ; i++)
	{
    	if (globalOutFaxMessagesData[i]['ID'] == faxQueueID) {
        	return globalOutFaxMessagesData[i]['JOBS'];
    	}
   }
}

function ShowFaxTasksTable (parentRowID, parentRowKey) {
	var childGridID = 'FaxJob_' + parentRowID + "_ChildTable";
    var childGridPagerID = 'FaxJob_' + parentRowID + "_pager";    

    // add a table and pager HTML elements to the parent grid row - we will render the child grid here
    $('#' + parentRowID).append('<table id=' + childGridID + '></table>' + '<div id=' + childGridPagerID + ' class=scroll></div>');
    
    var childData = GetFaxTasksTableData(parentRowKey);

    $("#" + childGridID).jqGrid({
        datatype: "local",
        data: childData,
        colModel: [
                    { label: 'Task ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'Controller name', name: 'CONTROLLERNAME', width: 150 },                    
                    { label: 'Online time', name: 'ONLINETIME', width: 150 },
                    { label: 'State', name: 'TASKSTATE', width: 100 },
                    { label: 'Error message', name: 'ERRMESSAGE', width: 300 }
                    
                ],
		loadonce: true,
		viewrecords: true,
		sortname: 'ID',
    	sortorder: "asc",				
        //width: 500,
        height: '100%',
        pager: "#" + childGridPagerID
    });
}

function GetFaxTasksTableData (faxJobID) {
	var currJobs;
	for (var i = 0 ; i < globalOutFaxMessagesData.length ; i++)
	{
    	currJobs = globalOutFaxMessagesData[i]['JOBS'];
    	for (var j = 0 ; j < currJobs.length ; j++) {
    		if (currJobs[j]['ID'] == faxJobID) {
        		return currJobs[j]['TASKS'];
    		}	
    	}
   }
}

function ShowFaxJobStatuses(data, sender) {
	if (data.length > 0) {
		var renderedJobStatuses = renderJobStatuses(data);
		if (renderedJobStatuses.length != 0) {						
			$(sender).append(renderedJobStatuses);			
			renderedJobStatuses.fadeIn();
		}
	}
}

function ShowFaxTaskStatuses(data, sender) {
	if (data.length > 0) {
		var renderedTaskStatuses = renderTaskStatuses(data);
		if (renderedTaskStatuses.length != 0) {						
			$(sender).append(renderedTaskStatuses);			
			renderedTaskStatuses.fadeIn();
		}
	}
}

//-----------------------------------------------------------------------------------

function ShowInJobsTable(data, rowsPerPage) {
	if (data.rows.length > 0) {		
		globalInJobsData = data.rows;
		//log(JSON.stringify(data));
		
		var myGrid = $("#jqGrid_infaxes-table")[0]; 						
		myGrid.addJSONData(globalInJobsData);
		
		//Set pages count
		var lastPage = Math.floor(data.records / rowsPerPage);
		if ((data.records % rowsPerPage) > 0) {
			lastPage++;
		}
		
		myGrid = $("#jqGrid_infaxes-table");
		myGrid.setGridParam({lastpage: lastPage});
    	myGrid.setGridParam({records: data.records});  
    	myGrid.each(function() {  
    		if (this.grid) this.updatepager();
    	});
		
		//unlock grid
		$("#jqGrid_infaxes-table")[0].grid.endReq();

	}
}

function ShowInFaxQueueTable (parentRowID, parentRowKey) {
	var childGridID = 'InJobQueue_' + parentRowID + "_ChildTable";
    var childGridPagerID = 'InJobQueue_' + parentRowID + "_pager";    

    // add a table and pager HTML elements to the parent grid row - we will render the child grid here
    $('#' + parentRowID).append('<table id=' + childGridID + '></table>' + '<div id=' + childGridPagerID + ' class=scroll></div>');
    
    var childData = GetInFaxQueueTableData(parentRowKey);

    $("#" + childGridID).jqGrid({
        datatype: "local",
        data: childData,
        colModel: [
                    { label: 'Queue ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'Receiver\'s email', name: 'EMAIL', width: 220 },                    
                    { label: 'Receiver\'s name', name: 'NAME', width: 120 },
                    { label: 'Creation time', name: 'CREATIONTIME', width: 140 },
                    { label: 'Fax state', name: 'FAXSTATE', width: 70 },
                    { label: 'Error message', name: 'ERRMESSAGE', width: 140 }
                    
                ],
		loadonce: true,
		viewrecords: true,
		sortname: 'ID',
    	sortorder: "asc",				
		//subGrid: true, // set the subGrid property to true to show expand buttons for each row
        //subGridRowExpanded: ShowFaxTasksTable, // javascript function that will take care of showing the child grid 
        //width: 500,
        height: '100%',
        pager: "#" + childGridPagerID
    });
}

function GetInFaxQueueTableData (jobQueueID) {
	for (var i=0 ; i < globalInJobsData.length ; i++)
	{
    	if (globalInJobsData[i]['ID'] == jobQueueID) {
        	return globalInJobsData[i]['FAXES'];
    	}
   }
}

//----------------------------------------------------------------------------------------

function InitUsersTable() {
	var currGrid = $("#jqGrid_users-table")[0].grid;	
	if  (typeof currGrid == 'undefined') {	
		$("#jqGrid_users-table").jqGrid({
                colModel: [
                    { label: 'ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'User\'s name', name: 'USERNAME', width: 220 },
                    { label: 'User\'s email', name: 'COUNTOFPAGES', width: 50 },                    
                    { label: 'User\'s phone number', name: 'USERPHONE', width: 220},                    
                    { label: 'Route group', name: 'ROUTENAME', width: 80 }
                    
                ],
                viewrecords: true, // show the current page, data rang and total records on the toolbar
                //autowidth: '100%',
                width: 800,
                height: '100%',
                rowNum: 10,
                //scroll: 1,
                rowList: [10, 20, 100],
                sortname: 'ID',
    			sortorder: "desc",				
				subGrid: true, // set the subGrid property to true to show expand buttons for each row
                subGridRowExpanded: ShowMSNTable, // javascript function that will take care of showing the child grid               
				datatype: function(postdata) {	
					var myGrid = $("#jqGrid_users-table");
					myGrid.clearGridData().setGridParam({page: postdata.page});
					
					//lock grid					
					$("#jqGrid_users-table")[0].grid.beginReq();
									        			
        			GetUsers(postdata.rows, postdata.page, postdata.sidx, postdata.sord);
        		},
                pager: "#jqGridPager_users-table",
				caption: "Users"
		});
	}
	else {
		var myGrid = $("#jqGrid_users-table");
		myGrid.clearGridData().setGridParam({page: 1});
		myGrid.trigger('reloadGrid');
	}
}

function ShowMSNTable (parentRowID, parentRowKey) {
	var childGridID = 'MSN_' + parentRowID + "_ChildTable";
    var childGridPagerID = 'MSN_' + parentRowID + "_pager";    

    // add a table and pager HTML elements to the parent grid row - we will render the child grid here
    $('#' + parentRowID).append('<table id=' + childGridID + '></table>' + '<div id=' + childGridPagerID + ' class=scroll></div>');
    
    var childData = GetMSNTableData(parentRowKey);

    $("#" + childGridID).jqGrid({
        datatype: "local",
        data: childData,
        colModel: [
                    { label: 'MSN ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'Controller name', name: 'CONTROLLERNAME', width: 220 },                    
                    { label: 'MSN', name: 'MSN', width: 120 }                    
                ],
		loadonce: true,
		viewrecords: true,
		sortname: 'ID',
    	sortorder: "asc",				
        //width: 500,
        height: '100%',
        pager: "#" + childGridPagerID
    });
}

function GetMSNTableData (userID) {
	for (var i=0 ; i < globalUsers.length ; i++)
	{
    	if (globalUsers[i]['ID'] == userID) {
        	return globalUsers[i]['MSNS'];
    	}
   }
}

//----------------------------------------------------------------------------------------

function init() {
	console.log('init...');
	/*
	if ($.parseJSON(outJobs).length > 0) {
		var res = renderOutJobsTable($.parseJSON(outJobs));
		$("#faxes-table-body").append(res);
		$('.doubleScroll').doubleScroll({
			resetOnWindowResize : true
		});
	}
	*/
	//parseMainTabEvents();	

	//InitSession();
	
	//AuthorizeUser("User", "synopse");
	//initWebSocket();
	
	//InitOutFaxMessagesTable();
	
	/*var columnsModel = [
                    { label: 'ID', name: 'ID', key: true, width: 30, hidden: true },
                    { label: 'Sender email', name: 'SENDEREMAIL', width: 220 },                    
                    { label: 'Subject', name: 'SUBJECT', width: 150 },
                    { label: 'Creation time', name: 'CREATIONTIME', width: 140},
                    { label: 'Pages', name: 'COUNTOFPAGES', width: 50 },
                    { label: 'Fax state', name: 'FAXSTATE', width: 80 },
                    { label: 'Error message', name: 'ERRMESSAGE', width: 100 },
                    { label: 'Jobs statuses', name: 'JOBSSTATUSES', width: 150, formatter: FormatJobsStatuses }
                    
                ];
	
	InitDataTable("jqGrid_outfaxes-table", "jqGridPager_outfaxes-table", columnsModel, GetFaxMessages, "ID", "DESC", "Outgoing Fax Messages", ShowFaxJobsTable);
	*/		
	//Join();
}
/*
function parseMainTabEvents(){
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		var tabToggle = $(e.target).attr('aria-controls');
  		console.log(tabToggle); // newly activated tab
  		//console.log($(e.relatedTarget).attr('aria-controls')); // previous active tab
  		switch(tabToggle) {
  			case "faxes": 
  			//$('div[role="tabpanel"][id="faxes"]').empty().html("Faxes bla bla bla")
  				//$('#faxes-table-body').empty();  			
  				//init();  			
  				break;
  			case "outfaxes": 
  				//$('#outfaxes-table-body').empty();
  				//InitOutFaxMessagesTable();
  				var columnsModel = [
				                { label: 'ID', name: 'ID', key: true, width: 30, hidden: true },
				                { label: 'Sender email', name: 'SENDEREMAIL', width: 220 },                    
				                { label: 'Subject', name: 'SUBJECT', width: 150 },
				                { label: 'Creation time', name: 'CREATIONTIME', width: 140},
				                { label: 'Pages', name: 'COUNTOFPAGES', width: 50 },
				                { label: 'Fax state', name: 'FAXSTATE', width: 80 },
				                { label: 'Error message', name: 'ERRMESSAGE', width: 100 },
				                { label: 'Jobs statuses', name: 'JOBSSTATUSES', width: 150, formatter: FormatJobsStatuses }
				                
				            ];
				
				InitDataTable("jqGrid_outfaxes-table", "jqGridPager_outfaxes-table", columnsModel, GetFaxMessages, "ID", "DESC", "Outgoing Fax Messages", ShowFaxJobsTable);  					
  				break;  				
  			case "infaxes": 
  				//$('#infaxes-table-body').empty(); 
  				//InitInFaxMessagesTable(); 
  				var columnsModel = [
					                    { label: 'ID', name: 'ID', key: true, width: 30, hidden: true },
					                    { label: 'Sender fax', name: 'SENDERFAX', width: 220 },                    
					                    { label: 'Creation time', name: 'CREATIONTIME', width: 140},
					                    { label: 'Pages', name: 'COUNTOFPAGES', width: 50 },
					                    { label: 'Fax state', name: 'FAXSTATE', width: 80 }
					                    
					                ];
				
				InitDataTable("jqGrid_infaxes-table", "jqGridPager_infaxes-table", columnsModel, GetInJobs, "ID", "DESC", "Incoming jobs", ShowInFaxQueueTable);  					  									
  				break;
  			case "users":
  				$('div[role="tabpanel"][id="users"]').empty().html("Users bla bla bla")
  				break;
  			case "templates":
  				$('div[role="tabpanel"][id="templates"]').empty().html("Templates bla bla bla")
  				break;
  			case "settings":
  				$('div[role="tabpanel"][id="settings"]').empty().html("Settings bla bla bla")
  				break;
  			default:
  				console.log("Unknown id: " + tabToggle);
  		}
	})
}
*/
function InitOutFaxes_ngTable() {
	
	ngApplication = angular.module('FaxGWiseApp', []);
	ngApplication.controller('outFaxesCtrl', function($scope, $http) {		
	
		$scope.recordsPerPage = 10;

		var dataString = '[' + $scope.recordsPerPage + ',1,"ID","desc"]';
		var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxOutMessages/1');
		var request = $http.post(url, dataString);

    	request.success(function(data, status) {
    		//$("#data").append(JSON.stringify(data));
        	var p = data.result[0];
        	$scope.outFaxes = data.result[0].rows;
        	//log($scope.totalRecords);
       		$scope.totalRecords = p.records; 	
       		//log($scope.totalRecords);
			ShowFaxMessagesTable(p, $scope, true);
			$(".sk-circle").hide();
    	});
    	request.error(function(data, status, headers, config) {
		    log("sendSQL status: "+status+", message: "+data);
		});	

    	$scope.openOutJobs = function (index) {
	    	var dataToCheck = $scope.outFaxes[index]['JOBS'];
	    	if ((typeof dataToCheck != 'undefined') && (dataToCheck.length > 0)) {	    		        
	        	$scope.outFaxes[index]['childTableExpanded'] = !$scope.outFaxes[index]['childTableExpanded'];
	        }         
	    }

	    $scope.loadMoreFaxes = function (index) {	        
	    	if ($scope.totalRecords == $scope.outFaxes.length) {
	    		return;
	    	}
	    	
	    	var pageNumberToLoad = Math.floor($scope.outFaxes.length / $scope.recordsPerPage) + 1;
	    	var dataString = '[' + $scope.recordsPerPage + ',' + pageNumberToLoad + ',"ID","desc"]';
			var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxOutMessages/1');
			var httpRequest = $http({
	        	method: 'POST',
	        	url: url,
				data: dataString
	
	    	}).success(function(data, status) {
	        	var p = data.result[0];
	       		$scope.totalRecords = p.records; 	
				ShowFaxMessagesTable(p, $scope, false);
	    	}).error(function(data, status, headers, config) {
			    log("sendSQL status: "+status+", message: "+data);
			});
	    		    		    		    	
	    }



	/*		try
  		{
		 socket = new WebSocket(WEBSOCKET_URL,"synopsejson");
		 console.log('WebSocket - status '+socket.readyState);
		 socket.onopen    = function(msg){ 
			console.log("status " + this.readyState); 
			//sgetUpdatedFax();
			//log("onopen: Welcome - status "+this.readyState); 
			//getTimeStamp();
			//Join();
		};
		socket.onmessage = function(msg){ 
			console.log(msg); 
			//log("onmessage: ("+msg.data.length+" bytes): " + (msg.data.length < 5000 ? msg.data : (msg.data.substr(0, 30) + '...'))); 
			//log(msg.data);
		};
		socket.onerror   = function(msg){ 
			console.log(msg); 
			//log("onerror - code:" + msg.code + ", reason:" + msg.reason + ", wasClean:" + msg.wasClean + ", status:" + this.readyState); 
		};
		socket.onclose   = function(msg){ 
			console.log(msg); 
			//log("onclose - code:" + msg.code + ", reason:" + msg.reason + ", wasClean:" + msg.wasClean + ", status:" + this.readyState); 
	    };
		}
		catch(ex) {
	    	console.log(ex);
		} 

		
		$scope.recordsPerPage = 10;
		
	    
	    /*$scope.loadMoreFaxes = function (index) {	        
	    	if ($scope.totalRecords == $scope.outFaxes.length) {
	    		return;
	    	}
	    	
	    	var pageNumberToLoad = Math.floor($scope.outFaxes.length / $scope.recordsPerPage) + 1;
	    	var dataString = '[' + $scope.recordsPerPage + ',' + pageNumberToLoad + ',"ID","desc"]';
			var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxOutMessages/1');
			var httpRequest = $http({
	        	method: 'POST',
	        	url: url,
				data: dataString
	
	    	}).success(function(data, status) {
	        	var p = data.result[0];
	       		$scope.totalRecords = p.records; 	
				ShowFaxMessagesTable(p, $scope, false);
	    	}).error(function(data, status, headers, config) {
			    log("sendSQL status: "+status+", message: "+data);
			});
	    		    		    		    	
	    };*/

	    /* $(window).scroll(function(){
            if($(window).scrollTop() == $(document).height() - $(window).height()){
            	 log($scope.totalRecords );
                if ($scope.totalRecords == $scope.outFaxes.length) {
                    return;
                }

                $(".sk-circle").show();
                $scope.pageToLoad += 1;
               // alert($scope.totalRecords + " " + $scope.outFaxes.length);
               var pageNumberToLoad = Math.floor($scope.outFaxes.length / $scope.recordsPerPage) + 1;
                var dataString = '[' + $scope.recordsPerPage + ',' + pageNumberToLoad + ',"ID","desc"]';
                var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxInMessages/1');
                var request = $http.post(url, dataString);
                request.success(function(data, status, headers, config) {
                	var p = data.result[0];
	       			$scope.totalRecords = p.records; 	
					ShowFaxMessagesTable(p, $scope, false);
                    log(data.result[0].rows)
                    $(".sk-circle").hide();
                });
                request.error(function(data, status, headers, config) {
                    log("sendSQL status: "+status+", message: "+data);
                });
            }   
        });*/




});

}		


function InitOutFaxDetails_ngApplication (faxQueueID) {		
	ngApplication = angular.module('FaxGWiseApp', []);
	ngApplication.controller('outFaxeDetailsCtrl', function($scope, $http) {
		if (faxQueueID == '') { return }
		
		$scope.GetResolutionAsText = function (resolutionNumber) {
	    	switch (resolutionNumber) {
				case 0:
					return "Low";
					break;
				case 1:
					return "High";
					break;
				default: return "";
			}        
	    };
	    
	    $scope.GetSendReportAsText = function (sendReportNumber) {
	    	switch (sendReportNumber) {
				case 0:
					return "Disable";
					break;
				case 1:
					return "Send report";
					break;
				case 2:
					return "Send report with faxCopy in PDF";
					break;
				default: return "";
			}      
	    };	    
	    
	    $scope.openTasks = function (index) {
	    	var dataToCheck = $scope.outFax['JOBS'][index]['TASKS'];
	    	if ((typeof dataToCheck != 'undefined') && (dataToCheck.length > 0)) {	    		        
	        	$scope.outFax['JOBS'][index]['childTableExpanded'] = !$scope.outFax['JOBS'][index]['childTableExpanded'];
	        }         
	    }; 
									   	   		
		var dataString = '[' + faxQueueID + ']';
		var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedFaxOutMessage/1');
		var httpRequest = $http({
        	method: 'POST',
        	url: url,
			data: dataString

    	}).success(function(data, status) {
    		log(data);
        	var p = data.result[0]; 	
			ShowFaxMessageDetails(p, $scope);
    	}).error(function(data, status, headers, config) {
    		if(status == 403){
                window.location.replace("../login.html");
            }
		    log("sendSQL status: "+status+", message: "+data);
		});

		$scope.formatDate = function(date){
			if(typeof(date)=='undefined')
                return;
            var newDate = date.replace("T", " ");
            return newDate;
        } 
	});
}

/*function renderOutJobsTable(json) {
	var tableObj = $('<table class="table table-bordered" id="data-table"></table>');
	var tableHeadObj = $('<thead></thead>');
	var tableHeadRowObj = $('<tr class="active" id="table-head"></tr>');
	var tableBodyObj = $('<tbody class="table-striped" id="table-body"></tbody>')
	var headerObj = json[0];
	var tableHead = [];
	var statusCell;
	
	$.each(headerObj, function(name, value) {
		tableHead.push('<th class="tableHeader">' + name + '</th>')
	});
	
	tableHead.push('<th class="tableHeader">Job Statuses</th>'); //for children statuses 
	
	tableHeadRowObj.append(tableHead.join(""));
	tableHeadObj.append(tableHeadRowObj)
	$.each(json, function(it, object) {
		var items = [];
		$.each(object, function(key, value) {
			items.push('<td>' + value + '</td>')
		})
		 
		statusCell = $('<td class="stat_cell"></td>');		
		
		var row = $('<tr class="cursor-pointer">' + items.join("") + '</tr>').click(function() {
			OnFaxRowClick(object['ORDERID'], this)
		});
		row.append(statusCell);
		row.appendTo(tableBodyObj);
		
		GetFaxJobs(object['ORDERID'], row);
		//GetFaxJobStatuses(object['ORDERID'], statusCell);		
	});
	tableObj.append(tableHeadObj);
	tableObj.append(tableBodyObj);

	return tableObj;
}*/

/*function renderJob(json) {
	var divObj = $('<div><h3>Fax jobs</h3></div>');
	var tableObj = $('<table class="table table-bordered table-jobs" id="data-table"></table>');
	var tableHeadObj = $('<thead></thead>');
	var tableHeadRowObj = $('<tr class="active" id="table-head"></tr>');
	var tableBodyObj = $('<tbody class="table-striped" id="table-body"></tbody>')
	var headerObjArray = json[0];
	var tableHead = [];
	var statusCell;
	
	$.each(headerObjArray, function(name, value) {
		tableHead.push('<th class="tableHeader">' + name + '</th>');
	});
	
	tableHead.push('<th class="tableHeader">Task Statuses</th>'); //for children statuses 

	tableHeadRowObj.append(tableHead.join(""));
	tableHeadObj.append(tableHeadRowObj)
	$.each(json, function(it, object) {
		var items = [];
		$.each(object, function(key, value) {
			items.push('<td>' + value + '</td>')
		})
		
		statusCell = $('<td class="stat_cell"></td>');
		
		var row = $('<tr class="cursor-pointer faxjob_record">' + items.join("") + '</tr>').click(function() {
			OnFaxJobRowClick(object['JOBID'], this)
		});
		row.append(statusCell);
		row.appendTo(tableBodyObj);
		
		GetFaxTasks(object['JOBID'], row);
		//GetFaxTaskStatuses(object['JOBID'], statusCell);
	});
	tableObj.append(tableHeadObj)
	tableObj.append(tableBodyObj);
	
	divObj.append(tableObj);
	return divObj;
}*/
/*
function renderTask (json) {
	var divObj = $('<div><h3>Fax tasks</h3></div>');
	var tableObj = $('<table class="table table-bordered table-jobs" id="data-table"></table>');
	var tableHeadObj = $('<thead></thead>');
	var tableHeadRowObj = $('<tr class="active" id="table-head"></tr>');
	var tableBodyObj = $('<tbody class="table-striped" id="table-body"></tbody>');
	var headerObj = json[0];
	var tableHead = [];
	
	$.each(headerObj, function(name, value) {
		tableHead.push('<th class="tableHeader">' + name + '</th>');
	});

	tableHeadRowObj.append(tableHead.join(""));
	tableHeadObj.append(tableHeadRowObj)
	$.each(json, function(it, object) {
		var items = [];
		$.each(object, function(key, value) {
			items.push('<td>' + value + '</td>')
		})
		var row = $('<tr class="cursor-pointer faxtask_record">' + items.join("") + '</tr>');
		row.appendTo(tableBodyObj);
	});
	tableObj.append(tableHeadObj)
	tableObj.append(tableBodyObj);
	
	divObj.append(tableObj);
	return divObj;
}*/

/*function renderJobStatuses (json) {
	var divObj = $('<div></div>');
	
	var tableObj = $('<table class="table table-borderless"></table>');
	var tableBodyObj = $('<tbody class="table-striped"></tbody>');	
	
	var items = [];
	
	var currJobStatus;
	
	$.each(json, function(it, object) {
		currJobStatus = object['PROCESSINGSTAGE'];

		switch(currJobStatus) {
		    case 0:
		    case 1:
		    case 2:
		    case 3:
		    case 4:
		    case 5:
		    case 6:
		    case 7:
		    case 8:
		    case 9:
		    case 10:
		    case 11:
		    case 12:
		    case 13:
		    case 14:
        		value = '<img src="images/' + currJobStatus + '.png"></img>';
        		break;
    		default: 
    			value = '<img src="images/black.png"></img>';        		
		}
							
		items.push('<td>' + value + '</td>')				
	});
	
	var row = $('<tr class="cursor-pointer">' + items.join("") + '</tr>');
	row.appendTo(tableBodyObj);
	
	tableObj.append(tableBodyObj);
	divObj.append(tableObj);
	return divObj;
}*/

/*function renderTaskStatuses (json) {
	var divObj = $('<div></div>');
	
	var tableObj = $('<table class="table table-borderless"></table>');
	var tableBodyObj = $('<tbody class="table-striped"></tbody>');	
	
	var items = [];
	
	var currJobStatus;
	
	$.each(json, function(it, object) {
		currJobStatus = object['TASKSTATE'];

		switch(currJobStatus) {
		    case 0:
		    	value = '<img src="images/yellow.png"></img>';
        		break;
		    case 1:
		    	value = '<img src="images/green.png"></img>';
        		break;
		    case 2:
		    	value = '<img src="images/red.png"></img>';
        		break;
		    case 3:		    
        		value = '<img src="images/silver.png"></img>';
        		break;
    		default: 
    			value = '<img src="images/black.png"></img>';        		
		}
							
		items.push('<td>' + value + '</td>')				
	});
	
	var row = $('<tr class="cursor-pointer">' + items.join("") + '</tr>');
	row.appendTo(tableBodyObj);
	
	tableObj.append(tableBodyObj);
	divObj.append(tableObj);
	return divObj;
}*/

/*
function OnFaxRowClick(orderId, sender) {
	var item = $('#job-orderId-'+orderId);
	/*if (item.length == 0){		
		GetFaxJobs(orderId, sender);
	} else {
		item.remove();
	}*/
	/*if (item.length > 0){		
		item.toggle();
	} 
}*/
/*
function OnFaxJobRowClick(jobId, sender) {
	var item = $('#job-jobId-'+jobId);
	/*if (item.length == 0){	
		GetFaxTasks(jobId, sender);
	} else {
		item.remove();
	}*/
	/*if (item.length > 0){	
		item.toggle();
	}
}*/
