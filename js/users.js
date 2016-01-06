var ngApplication;

function initUsersTable(){
	ngApplication = angular.module('FaxGWiseApp', ['ui.bootstrap']);   
    ngApplication.controller('usersCtrl', function ($scope, $http,  $modal, $log) {
        

         $scope.sortType = "ID";
         $scope.sortReverse  = false;
         $scope.searchFilter   = '';

        $scope.recordsPerPage = 30;
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
 
        $scope.msns = {};
        
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
      console.log("editopen");
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

	$scope.addMsnFormOpen = function (msns, currUser) {

    var modalInstance = $modal.open({
    	animation: true,
      	templateUrl: 'msnAddForm.html',
      	controller: 'ModalInstance4Ctrl',
      	resolve: {
            msns: function(){
            	return $scope;
            },
            currUser: function(){
            	return currUser;
            }
      }
      
    });
	};

	$scope.deleteMsnFormOpen = function (currUser, msn, msns) {
	
    var modalInstance = $modal.open({
    	animation: true,
      	templateUrl: 'msnDeleteForm.html',
      	controller: 'ModalInstance5Ctrl',
      	resolve: {
            currUser: function(){
            	return currUser;
            },
            msn: function(){
            	return msn;
            },
            msns: function(){
            	return msns;
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

	ngApplication.controller('ModalInstance4Ctrl', function ($scope, $http, $modalInstance, msns, currUser) {

		$scope.selectedRow = null;
        var msnId = null;

		$scope.recordsPerPage = 30;
        $scope.pageToLoad = 1;
        $scope.userMsns;

        var dataString = '['+currUser.ID+','+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","asc"]';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUserMSNList/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {
            $scope.userMsns = data.result[0].rows;
        });
        request.error(function(data, status, headers, config) {
            $scope.error = "An error occured while adding MSN";
            if(status == 403){
                window.location.replace("../login.html");
            }
            alert("error:"+status);
        });	


        dataString = '['+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","asc"]';
        url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetAllMSNList/1');
        request = $http.post(url, dataString);


        request.success(function(data, status, headers, config) {
            console.log(data.result[0].rows);

            $scope.msns = data.result[0].rows;

            if(typeof($scope.userMsns) != 'undefined'){
            	$.each($scope.userMsns, function(index, item){
            		$.each($scope.msns, function(index2, item2) {
            			if(item['ID'] == item2['ID']) {
            				$scope.msns.splice(index2, 1);
          					return false;
      					}  					
            		});
   				});
            }
        });
        request.error(function(data, status, headers, config) {
            $scope.error = "An error occured while loading MSNs";
            if(status == 403){
                window.location.replace("../login.html");
            }
            alert("error:"+status);
        });

        $scope.setClickedRow = function(index, msn){
        	$scope.selectedRow = index;
        	msnId = msn.ID;
        }

		$scope.add = function () {

			var userId = currUser.ID;
			var dataString = '['+userId+','+msnId+']';
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.AddUserMsn/1'); 

        	var request = $http.post(url, dataString);

        	request.success(function(data) {
       			var dataString = '['+currUser.ID+','+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","asc"]';
            	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUserMSNList/1');
            	var request = $http.post(url, dataString);

            	request.success(function(data, status, headers, config) {
                	msns.msns = data.result[0].rows;
                	$modalInstance.dismiss('cancel');

            	});
            	request.error(function(data, status, headers, config) {
                	$scope.error = "An error occured while adding MSN";
                	if(status == 403){
                    	window.location.replace("../login.html");
                	}
            		alert("error:"+status);
            	});																	      
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while adding MSN";

        	});
  		};
  		
  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance5Ctrl', function ($scope, $http, $modalInstance, currUser, msn, msns) {

		$scope.delete = function () {
			var msnId = msn.ID;
			var userId = currUser.ID;

			var dataString = '['+userId+','+msnId+']';
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.DeleteUserMsn/1');
        	var request = $http.post(url, dataString);

        	request.success(function(data) {
       			$.each(msns, function(index, item) {
      				if(item['ID'] == msn.ID) {
          				msns.splice(index, 1);
          				$modalInstance.dismiss('cancel');
          				 return false;
      				}    
   				});
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while deleting msn";

        	});
  		};
  		
  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

} 
