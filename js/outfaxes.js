var ngApplication;

function initOutFaxesTable(){
	ngApplication = angular.module('FaxGWiseApp', []);  
    ngApplication.controller('outFaxesCtrl', function ($scope, $http) {

        $scope.isAdmin = false;
       var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetMyUserData/1');
       var request = $http.post(url);
        request.success(function(data) {
            console.log(data);
            if(data.result[0].UserRights == "Admin"){
                $scope.isAdmin = true;          
            }
        });
        request.error(function(data, status, headers, config) {            
            console.log("status: "+status+", message: "+data.errorText);
        });

        $scope.isRowClicked = true;

        $scope.recordsPerPage = 10;
        $scope.pageToLoad = 1;

       $(".sk-circle").show();
        var dataString = '['+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","desc", 0, ""]';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxOutMessages/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {
           // log(data);
           $scope.totalRecords = data.result[0].records;
            //$("#data").append(JSON.stringify(data.result[0].rows));
            $scope.outFaxes = data.result[0].rows;
            console.log($scope.outFaxes);
            $(".sk-circle").hide();

            $('html, body').animate({
                scrollTop: 0
                }, 100);  
            if(localStorage.getItem("scrollpos") != null ){
               // alert(localStorage.getItem("scrollpos"));               
                $('html, body').animate({
                scrollTop: localStorage.getItem("scrollpos")
                }, 3000);  

                localStorage.removeItem("scrollpos");

            }
        });
        request.error(function(data, status, headers, config) {
            if(status == 403){
                window.location.replace("../login.html");
            }
            console.log("sendSQL status: "+status+", message: "+data);
            alert("error:"+status);
        });

        $scope.getscrollpos = function(){
            localStorage.setItem("scrollpos", window.pageYOffset);
        }

        $(window).scroll(function(){
            if($(window).scrollTop() == $(document).height() - $(window).height()){
                if ($scope.totalRecords == $scope.outFaxes.length) {
                    return;
                }
                $(".sk-circle").show();
                $scope.pageToLoad += 1;
                //alert($scope.totalRecords + " " + $scope.inFaxes.length);
                var dataString = '[' + $scope.recordsPerPage + ',' + $scope.pageToLoad + ',"ID","desc", 0, ""]';
                var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxOutMessages/1');
                var request = $http.post(url, dataString);
                request.success(function(data, status, headers, config) {
                    $scope.totalRecords = data.result[0].records;
                    $scope.outFaxes.push.apply($scope.outFaxes, data.result[0].rows);
                    console.log(data.result[0].rows)
                    $(".sk-circle").hide();
                });
                request.error(function(data, status, headers, config) {
                    console.log("sendSQL status: "+status+", message: "+data);
                    alert("error:"+status);
                });
            }   
        });
        
        $scope.openOutJobs = function (index) {
            if($scope.isRowClicked == false){
                return;
            }
                
             console.log($scope.outFaxes[index]);
             if((typeof($scope.outFaxes[index].JOBS) == 'undefined') || $scope.outFaxes[index].JOBS.length < 1)
                return;
             $scope.outFaxes[index].expandRow = !$scope.outFaxes[index].expandRow      
        };  

        $('html').on('show.bs.dropdown', function () {
            $scope.isRowClicked = false;
        });

        $('html').on('hidden.bs.dropdown', function () {
            $scope.isRowClicked = true;
        });

        $scope.showDropdown = function(){
            $scope.isRowClicked = false;
        } 

        $scope.formatDate = function(date){
            var newDate = date.replace("T", " ");
            return newDate;
        }    

        $scope.checkPending = function(date){
            if(date.contains("2050")){
                return "Pending";
            }
            else{
                return "Delay";
            }
        }    

        $scope.sendFaxAgain = function(id){
            var dataString = '[' + 0 + ',' + id + ']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.sendAgainFax/1');
            var request = $http.post(url, dataString);
            request.success(function(data) {
                //console.log(data);

            });
            request.error(function(data, status) {
                console.log("sendSQL status: "+status+", message: "+data);
                alert("error:"+status);
            });
        }

        $scope.CancelFax = function(id){
            var dataString = '[' + 0 + ',' + id + ']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.CancelFax/1');
            var request = $http.post(url, dataString);
            request.success(function(data) {
                console.log(data);

            });
            request.error(function(data, status) {
                console.log("sendSQL status: "+status+", message: "+data);
                alert("error:"+status);
            });
        }

        $scope.sendJobAgain = function(id){
            var dataString = '[' + 1 + ',' + id + ']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.sendAgainFax/1');
            var request = $http.post(url, dataString);
            request.success(function(data) {
                //console.log(data);

            });
            request.error(function(data, status) {
                console.log("sendSQL status: "+status+", message: "+data);
                alert("error:"+status);
            });
        }

        $scope.CancelJob = function(id){
            var dataString = '[' + 1 + ',' + id + ']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.CancelFax/1');
            var request = $http.post(url, dataString);
            request.success(function(data) {
                console.log(data);

            });
            request.error(function(data, status) {
                console.log("sendSQL status: "+status+", message: "+data);
                alert("error:"+status);
            });
        }

            try
            {
            var socket;
            var nickname; 
                        
            socket = new WebSocket(WEBSOCKET_URL,"synopsejson");
            
            console.log('WebSocket - status '+socket.readyState);
            socket.onopen = function(event){ 
                console.log("WebSocket - status " + this.readyState); 
                //getTimeStamp();
                Join();

               /* var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetComponetStatus/1');
           		var request = $http.post(url);

            	request.success(function(data, status, headers, config) {
                	console.log(data);
            	});
            	request.error(function(data, status, headers, config) {
                	console.log("sendSQL status: "+status+", message: "+data);
            	});*/
            };
            socket.onmessage = function(event){ 
                var data = JSON.parse(event.data);
                console.log(event); 
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "OutJob"){
                    var jobToUpdate = data.request[5][1];

                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedJobOutMessage/1');
                     var dataString = '[' + jobToUpdate + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var updatedJob = data.result[0].rows[0];
                        //updatedJob.JOBSTATE = "Error";
                        for (var i=0; i<$scope.outFaxes.length; i++) {
                         for(var j =0; j<$scope.outFaxes[i].JOBS.length; j++){
                            if ($scope.outFaxes[i].JOBS[j].ID === jobToUpdate) {
                                //console.log($scope.outFaxes[i].JOBS[j]);
                                $scope.outFaxes[i].JOBS[j] = updatedJob;
                                return;
                            }   
                        }
                     }
                    });
                    request.error(function(data, status) {
                        log("sendSQL status: "+status+", message: "+data);
                        alert("error:"+status);
                    });                 
                    //alert($("body").find("[jobid='" + 509 + "']").text('Ok'));            
                }
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "OutFaxMessage"){
                     var faxToUpdate = data.request[5][1];

                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedFaxOutMessage/1');
                     var dataString = '[' + faxToUpdate + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var updatedFax = data.result[0].rows[0];

                     for (var i=0; i<$scope.outFaxes.length; i++) {
                        if ($scope.outFaxes[i].ID === faxToUpdate) {
                            //console.log($scope.outFaxes[i].JOBS[j]);
                            $scope.outFaxes[i] = updatedFax;
                            return;
                        }   
                     }
                    });
                    request.error(function(data, status) {
                        console.log("sendSQL status: "+status+", message: "+data);
                        alert("error:"+status);
                    });                        
                }
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "NewOutFaxMessage"){
                     var faxToAdd = data.request[5][1];

                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedFaxOutMessage/1');
                     var dataString = '[' + faxToAdd + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var newFax = data.result[0].rows[0];
                        $scope.outFaxes.unshift(newFax);
                    });
                    request.error(function(data, status) {
                        console.log("sendSQL status: "+status+", message: "+data);
                        alert("error:"+status);
                    });                        
                }
            };
            socket.onerror   = function(event){ 
                console.log(event); 
                //log("onerror - code:" + msg.code + ", reason:" + msg.reason + ", wasClean:" + msg.wasClean + ", status:" + this.readyState); 
            };
            socket.onclose   = function(event){ 
                console.log(event); 
                //log("onclose - code:" + msg.code + ", reason:" + msg.reason + ", wasClean:" + msg.wasClean + ", status:" + this.readyState); 
                };
            }
            catch(ex) {
                console.log(ex);
            } 

            function Join(){
                var msg = JSON.stringify(makerequest("","root/FaxGwiseInfo.Join",[Number(getLocalStorageParam('SESSION_ID')),1]));
                 try{ 
                    socket.send(msg); 
                    console.log('Sent ('+msg.length+" bytes): " + msg.length < 5000 ? msg : (msg.substr(0, 100) + '...')); 
                } catch(ex){ 
                    console.log(ex);
                }
            }

            function makerequest(method,uri,data){
                var req = {
                    request:[method,uri,"",0,"",data]
                };
                 return req;
            }

        $(document).on("click", "#getStatus", function() {
              var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetComponetStatus/1');
        var request = $http.post(url);

        request.success(function(data, status, headers, config) {
          
            console.log(data);
        });
        request.error(function(data, status, headers, config) {
           
            console.log("sendSQL status: "+status+", message: "+data);
            alert("error:"+status);
        });

        });
	});
} 

function InitOutFaxDetails_ngApplication (faxQueueID) {		
	ngApplication = angular.module('FaxGWiseApp', []);
	ngApplication.controller('outFaxeDetailsCtrl', function($scope, $http) {
        $scope.isAdmin = false;
       var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetMyUserData/1');
       var request = $http.post(url);
        request.success(function(data) {
            console.log(data);
            if(data.result[0].UserRights == "Admin"){
                $scope.isAdmin = true;          
            }
        });
        request.error(function(data, status, headers, config) {            
            console.log("status: "+status+", message: "+data.errorText);
        });

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
    		console.log(data);
        	var p = data.result[0]; 	
			ShowFaxMessageDetails(p, $scope);
    	}).error(function(data, status, headers, config) {
    		if(status == 403){
                window.location.replace("../login.html");
            }
		    console.log("sendSQL status: "+status+", message: "+data);
		    alert("error:"+status);
		});

		$scope.formatDate = function(date){
			if(typeof(date)=='undefined')
                return;
            var newDate = date.replace("T", " ");
            return newDate;
        } 
	});
}

function ShowFaxMessageDetails(data, controllerScope) {
	if (data.rows.length > 0) {		
		var currFaxMessage = data.rows[0];
		AdvanceOutFaxMessage(currFaxMessage);				
		controllerScope.outFax = currFaxMessage;						
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