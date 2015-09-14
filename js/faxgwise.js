var globalOutFaxMessagesData; //for keep loaded data 
var globalInJobsData;
var globalUsers;
var ngApplication;

function initUsersTable(){
	ngApplication = angular.module('FaxGWiseApp', ['ui.bootstrap']);   
    ngApplication.controller('usersCtrl', function ($scope, $http,  $modal, $log) {
         $scope.sortType = "ID";
         $scope.sortReverse  = false;
         $scope.searchFilter   = '';

        $scope.recordsPerPage = 10;
        $scope.pageToLoad = 1;

        var dataString = '['+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","asc"]';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUsers/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {
            console.log(data);

            $scope.users = data.result[0].rows;
        });
        request.error(function(data, status, headers, config) {
            log("sendSQL status: "+status+", message: "+data);
            if(status == 403){
                window.location.replace("../login.html");
            }
            alert("error:"+status);
        });
 

        $scope.openUser = function (user, id) {           
            var dataString = '['+id+','+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","asc"]';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUserMSNList/1');
            var request = $http.post(url, dataString);

            request.success(function(data, status, headers, config) {
                console.log(data.result[0].rows);
                $scope.msns = data.result[0].rows;
                var index = $scope.users.indexOf(user);
               
                $scope.users[index].expandRow = !$scope.users[index].expandRow; 

            });
            request.error(function(data, status, headers, config) {
                log("sendSQL status: "+status+", message: "+data);
                if(status == 403){
                    window.location.replace("../login.html");
                }
            	alert("error:"+status);
            });      
        };

    $scope.editFormOpen = function (user) {

    var modalInstance = $modal.open({
    	 animation: true,
      templateUrl: 'userEditForm.html',
      controller: 'ModalInstanceCtrl',
      resolve: {
        	 user: function () {
                return user;
            }
      }
    });
	};

    $scope.addFormOpen = function (users) {
    	
    var modalInstance = $modal.open({
    	 animation: true,
      templateUrl: 'userAddForm.html',
      controller: 'ModalInstance2Ctrl',
      resolve: {
        	 users: function () {
                return $scope;
            }
      }
      
    });
	};

	$scope.deleteFormOpen = function (currUser, users) {

    var modalInstance = $modal.open({
    	 animation: true,
      templateUrl: 'userDeleteForm.html',
      controller: 'ModalInstance3Ctrl',
      resolve: {
        	 users: function () {
                return users;
            },
            currUser: function(){
            	return currUser;
            }
      }
      
    });
	};

	$scope.addMSNFormOpen = function (currUser) {

    var modalInstance = $modal.open({
    	 animation: true,
      templateUrl: 'msnAddForm.html',
      controller: 'ModalInstance4Ctrl',
      resolve: {
            currUser: function(){
            	return currUser;
            }
      }
      
    });
	};


    });

	ngApplication.controller('ModalInstanceCtrl', function ($scope, $http, $modalInstance, user) {

  		$scope.id = user.ID;
  		$scope.username = user.USERNAME;
  		$scope.email = user.EMAIL;
  		$scope.phone = user.USERPHONE;
  		
  		$scope.update = function() {
    		
    	var dataString = [{"ID":$scope.id,"USERNAME":$scope.username,"EMAIL":$scope.email,"USERPHONE":$scope.phone}];
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateUser/1');
        var request = $http.post(url, dataString);

        request.success(function(data) {
        	user.USERNAME = $scope.username;
        	user.EMAIL = $scope.email;
        	user.USERPHONE = $scope.phone;
        	$scope.success = "User updated";

        });
        request.error(function(data, status, headers, config) {
        	//console.log(data);
        	console.log("status: "+status+", message: "+data.errorText);
        	$scope.error = "An error occured while updating user";

        });
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance2Ctrl', function ($scope, $http, $modalInstance, users) {

		$scope.add = function () {
    		var dataString = [{"USERNAME":$scope.username,"EMAIL":$scope.email,"USERPHONE":$scope.phone}];
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.AddUser/1');
        	var request = $http.post(url, dataString);

        	request.success(function(data) {
        		var recordsPerPage = 10;
        		var pageToLoad = 1;
        		var dataString = '['+recordsPerPage+','+pageToLoad+',"ID","asc"]';
        		var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUsers/1');
       			 var request = $http.post(url, dataString);

        		request.success(function(data, status, headers, config) {
        			users.users = data.result[0].rows;
        			$modalInstance.dismiss('cancel');	
        		});
        		request.error(function(data, status, headers, config) {
            		console.log("sendSQL status: "+status+", message: "+data.errorText);
        			$scope.error = "An error occured while adding user";
        		});
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while adding user";

        	});
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance3Ctrl', function ($scope, $http, $modalInstance, users, currUser) {

		$scope.delete = function () {

    		var dataString = '[' + currUser.ID + ']';
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.DeleteUser/1');
        	var request = $http.post(url, dataString);

        	request.success(function(data) {
       			$.each(users, function(index, user) {
      				if(user['ID'] == currUser.ID) {
          				users.splice(index, 1);
          				$modalInstance.dismiss('cancel');
          				 return false;
      				}    
   				});
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while deleting user";

        	});
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance4Ctrl', function ($scope, $http, $modalInstance, currUser) {

		$scope.addMSN = function () {

  		};
  		
  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

}

function initOutFaxesTable(){
	ngApplication = angular.module('FaxGWiseApp', []);  
    ngApplication.controller('outFaxesCtrl', function ($scope, $http) {

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
                var dataString = '[' + $scope.recordsPerPage + ',' + $scope.pageToLoad + ',"ID","desc"]';
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

function initInFaxesTable(){
	    ngApplication = angular.module('FaxGWiseApp', []);  
    	ngApplication.controller('inFaxesCtrl', function ($scope, $http) {

        $scope.recordsPerPage = 10;
        $scope.pageToLoad = 1;
       // $scope.expandTable = false;
       $(".sk-circle").show();
        var dataString = '['+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","desc"]';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxInMessages/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {
            console.log(data);
           $scope.totalRecords = data.result[0].records;
            //$("#data").append(JSON.stringify(data.result[0].rows));
            $scope.inFaxes = data.result[0].rows;
            $(".sk-circle").hide();

            $('html, body').animate({
                scrollTop: 0
                }, 100); 
            if(localStorage.getItem("scrollpos") != null){
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
                if ($scope.totalRecords == $scope.inFaxes.length) {
                    return;
                }
                $(".sk-circle").show();
                $scope.pageToLoad += 1;
                var dataString = '[' + $scope.recordsPerPage + ',' + $scope.pageToLoad + ',"ID","desc"]';
                var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxInMessages/1');
                var request = $http.post(url, dataString);
                request.success(function(data, status, headers, config) {
                    $scope.totalRecords = data.result[0].records;
                    $scope.inFaxes.push.apply($scope.inFaxes, data.result[0].rows);
                    console.log(data.result[0].rows)
                    $(".sk-circle").hide();
                });
                request.error(function(data, status, headers, config) {
                    console.log("sendSQL status: "+status+", message: "+data);
                    alert("error:"+status);
                });
            }   
        });
    
        $scope.openInFaxes = function (index) {
             console.log($scope.inFaxes[index]);
             if((typeof($scope.inFaxes[index].FAXES) == 'undefined') || $scope.inFaxes[index].FAXES.length < 1)
                return;
                $scope.inFaxes[index].expandRow = !$scope.inFaxes[index].expandRow;      
        };  

        $scope.formatDate = function(date){
            var newDate = date.replace("T", " ");
            return newDate;
        }  

         try
            {
            var socket;
            var nickname; 
            if(typeof(socket) == 'undefined'){
                
                socket = new WebSocket(WEBSOCKET_URL,"synopsejson");

            }
            
            console.log('WebSocket - status '+socket.readyState);
            socket.onopen = function(event){ 
                console.log("WebSocket - status " + this.readyState); 
                //getTimeStamp();
                Join();
            };
            socket.onmessage = function(event){ 
                var data = JSON.parse(event.data);
                console.log(event); 
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "InJob"){
                	 var jobToUpdate = data.request[5][1];			
                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedJobINMessage/1');
                     var dataString = '[' + jobToUpdate + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var updatedJob = data.result[0].rows[0];

                        for (var i=0; i<$scope.inFaxes.length; i++) {
                            if($scope.inFaxes[i].ID === jobToUpdate){
                                $scope.inFaxes[i] = updatedJob;
                                return;
                            }
                      }
                    });
                    request.error(function(data, status) {
                        log("sendSQL status: "+status+", message: "+data);
                        alert("error:"+status);
                    });                             
                }
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "InFaxMessage"){
                     var faxToUpdate = data.request[5][1];

                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedFaxINMessage/1');
                     var dataString = '[' + faxToUpdate + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var updatedFax = data.result[0][0];
                        //console.log(updatedFax);                      
                        for(var i = 0; i<$scope.inFaxes.length; i++){
                            for(var j = 0; j<$scope.inFaxes[i].FAXES.length; j++){
                                if($scope.inFaxes[i].FAXES[j].ID === faxToUpdate){
                                    $scope.inFaxes[i].FAXES[j] = updatedFax;
                                    return;
                                }    
                            }
                        }
                    });
                    request.error(function(data, status) {
                        console.log("sendSQL status: "+status+", message: "+data);
                        alert("error:"+status);
                    });                        
                }
                if(typeof(data.request) != 'undefined' && data.request[5][0] == "NewInFaxMessage"){
                     var faxToAdd = data.request[5][1];

                     var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedJobINMessage/1');
                     var dataString = '[' + faxToAdd + ']';
                     var request = $http.post(url, dataString);
                     request.success(function(data) {
                        var newFax = data.result[0].rows[0];
                        $scope.inFaxes.unshift(newFax);
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
    });
}

function initInFaxesDetails(){
	var id = url('?infaxid');

    ngApplication = angular.module('FaxGWiseApp', []);   
    ngApplication.controller('inFaxDetailsCtrl', function ($scope, $http) {

        var dataString = '['+id+']';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedJobINMessage/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {

            $scope.inFax = data.result[0].rows[0];
            log($scope.inFax);    
        });
        request.error(function(data, status, headers, config) {
            if(status == 403){
                window.location.replace("../login.html");
            }
            log("sendSQL status: "+status+", message: "+data);
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

function initSettings(){
	ngApplication = angular.module('FaxGWiseApp', []);   
        ngApplication.controller('settingsCtrl', function ($scope, $http) {

        $scope.numbers = [0,1,2];

        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetSettings/1');
        var request = $http.post(url);

        request.success(function(data, status, headers, config) {
            console.log(data.result[0]);
            var data = data.result[0];
            $scope.faxConverter = data[0].Options;
            $scope.isdnController = data[1].Options;
            $scope.t38Controller = data[2].Options;
            $scope.gwCommunicator = data[3].Options;
            $scope.secondCommunicator = data[4].Options;
            $scope.reporter = data[5].Options;
            $scope.router = data[6].Options;
        });
        request.error(function(data, status, headers, config) {
            console.log("sendSQL status: "+status+", message: "+data);
            if(status == 403){
                window.location.replace("../login.html");
            }
            alert("error:"+status);
        });
        
        function saveSettings(params, showSaving, errorCallback, successCallback){
            showSaving();
            var count = 0;
            for(var i=0; i<params.length; i++){
                var value;
                // check if an element is checkbox
                if($("#"+params[i]).is(':checkbox')){
                    value = $("#"+params[i]).prop('checked');
                    if($("#"+params[i]).prop('checked') == true){
                        value = 1;
                    }
                    else{
                        value = 0;
                    }
                }
                else{
                     value = $("#"+params[i]).val();
                }

                var dataString = '['+ $("#"+params[i]).attr("valueId") +','+ $("#"+params[i]).attr("settId")+','+'"'+value +'"'+']';
                //console.log(dataString);
                var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateSettingValue/1');
                var request = $http.post(url, dataString);

                request.success(function(data){
                    count++;
                    if(count == params.length){
                        successCallback();
                    }
                });
                request.error(function(data, status){
                    console.log("sendSQL status: "+status+", message: "+data);
                    errorCallback();
                    return;
                });
            }
        }

        $("#convertergeneral").submit(function(event){
            event.preventDefault();
            var params = ['filetypes','convEnabled','timeout','compress','format'];

            saveSettings(params, function(){
                $(".saving-conv").show();
            }, function(){
                $(".saving-conv").hide();
                 $("#convertergeneralerror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving-conv").hide();
                 $("#convertergeneralsuccess").show().delay(3000).fadeOut("slow");
            });
        });
        
        $("#converterheader").submit(function(event){
            event.preventDefault();
            var params = ['headertext','headeroffright','headeroffleft','headerofftop','headerborder','headertextright','headertextleft','headerbold','headersize','headerfont','headerlogo','headerlogoX', 'headerlogoY','headerlogoFile'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#converterheadererror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#converterheadersuccess").show().delay(3000).fadeOut("slow");
            });
        });

        $("#isdn").submit(function(event){
            event.preventDefault();
            var params = ['enabled','excludedfiles','channelsreceive','channelssend','presentationmode','maxmsnlength','retryperiod','retrycount','maxrecipients','dialprefix','checkresolution','maxfaxfilesize','ownmsn','owncsid','portname','channelssendreceive','ddi','runstart'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#isdnerror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#isdnsuccess").show().delay(3000).fadeOut("slow");
            });
        });

        $("#t38").submit(function(event){
            event.preventDefault();
            var params = ['t38enabled','t38runstart','t38retryperiod','t38retrycount','t38maxfaxfilesize','defaultsendertelephone','defaultsenderfax','defaultsendername','defaultsendercompany'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#t38error").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#t38success").show().delay(3000).fadeOut("slow");
            });
        });

        $("#gw").submit(function(event){
            event.preventDefault();
            var params = ['gwenabled','gwrunstart','processedmessagescount','emailfaxstarttag','emailfaxendtag','emailtofaxenabled','mailboxscaninterval','password','deletefaxmessage'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#gwerror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#gwsuccess").show().delay(3000).fadeOut("slow");
            });
        });

        $("#second").submit(function(event){
            event.preventDefault();
            var params = ['secondenabled','secondrunstart','secondprocessedmessagescount','secondemailfaxstarttag','secondemailfaxendtag','secondemailtofaxenabled','secondmailboxscaninterval','secondpassword','seconddeletefaxmessage'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#seconderror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#secondsuccess").show().delay(3000).fadeOut("slow");
            });
        });

        $("#report").submit(function(event){
            event.preventDefault();
            var params = ['injobformat','language','journalmonthlydetailed','journalmonthlycompact','messageadditional','messageoutjobsuccesssubject','messageoutjoberrorsubject','messageroutedinjobsubject','messageinjobsubject'];
            
            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#reportererror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#reportersuccess").show().delay(3000).fadeOut("slow");
            });
        });

        $("#router").submit(function(event){
            event.preventDefault();
            var params = ['citycode','countrycode','nrlengthfordialprefix','internalfaxrouting','listenmsn','adminemail','ownphonenumber','routerdefaultsendertelephone','routerdefaultsenderfax','routerdefaultsendername','routerdefaultsendercompany','defaultsenderemail'];

            saveSettings(params, function(){
                $(".saving").show();
            }, function(){
                $(".saving").hide();
                 $("#routererror").show().delay(3000).fadeOut("slow");
            }, function(){
                $(".saving").hide();
                 $("#routersuccess").show().delay(3000).fadeOut("slow");
            });
        });

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

