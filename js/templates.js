var ngApplication;

function initTemplates(){
	ngApplication = angular.module('FaxGWiseApp', ['ui.bootstrap', 'naif.base64']);   
    ngApplication.controller('templatesCtrl', function ($scope, $http, $modal, $log) {

    $scope.recordsPerPage = 30;
    $scope.pageToLoad = 1;

///////////////////////////////////// Test GetFaxTemplateBase64
    var dataString = '['+14+']';
    var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetFaxTemplateBase64/1');
    var request = $http.post(url, dataString);

    request.success(function(data, status, headers, config) {
    	console.log(data);
    });
    request.error(function(data, status, headers, config) {
        console.log("sendSQL status: "+status+", message: "+data);
        if(status == 403){
            window.location.replace("../login.html");
        }
        alert("error:"+status);
    });
///////////////////////////////////////////

    var dataString = '['+$scope.recordsPerPage+','+$scope.pageToLoad+',"ID","desc"]';
    var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetTemplates/1');
    var request = $http.post(url, dataString);

    request.success(function(data, status, headers, config) {
       	$scope.templates = data.result[0].rows;
       	console.log($scope.templates);
    });
    request.error(function(data, status, headers, config) {
        console.log("sendSQL status: "+status+", message: "+data);
        if(status == 403){
            window.location.replace("../login.html");
        }
        alert("error:"+status);
    });

    $scope.addFormOpen = function (templates) {
    	
    var modalInstance = $modal.open({
   	  	animation: true,
      	templateUrl: 'templateAddForm.html',
      	controller: 'ModalInstanceCtrl',
      	resolve: {
        	templates: function () {
               return $scope;
        }
    }
      
    });
	};

	$scope.deleteFormOpen = function (template, templates) {

    var modalInstance = $modal.open({
    	animation: true,
      	templateUrl: 'templateDeleteForm.html',
      	controller: 'ModalInstance2Ctrl',
      	resolve: {
        	 templates: function () {
                return templates;
            },
            template: function(){
            	return template;
            }
      }
      
    });
	};

	$scope.editFormOpen = function (template) {

    var modalInstance = $modal.open({
    	animation: true,
      	templateUrl: 'templateEditForm.html',
      	controller: 'ModalInstance3Ctrl',
      	resolve: {
        	 template: function () {
                return template;
            }
      }
    });
	};
});

	ngApplication.controller('ModalInstanceCtrl', function ($scope, $http, $modalInstance, templates) {
		$scope.enclosure = 0;
		$scope.standard = 0;
		$scope.add = function () {
    		var dataString = [{"TEMPLATENAME":$scope.name,"DESCRIPTION":$scope.description,"ENCLOSURE":$scope.enclosure, "STANDARD":$scope.standard}];
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.AddTemplate/1');
        	console.log(dataString);
        	var request = $http.post(url, dataString);

        	request.success(function(data) {
        		var recordsPerPage = 30;
        		var pageToLoad = 1;
        		var dataString = '['+recordsPerPage+','+pageToLoad+',"ID","desc"]';
        		var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetTemplates/1');
       			var request = $http.post(url, dataString);

        		request.success(function(data, status, headers, config) {
        			templates.templates = data.result[0].rows;
        			$modalInstance.dismiss('cancel');	
        		});
        		request.error(function(data, status, headers, config) {
            		console.log("sendSQL status: "+status+", message: "+data.errorText);
        			$scope.error = "An error occured while adding template";
        		});
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while adding template";

        	});
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance2Ctrl', function ($scope, $http, $modalInstance, templates, template) {

		$scope.delete = function () {

    		var dataString = '[' + template.ID + ']';
        	var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.DeleteTemplate/1');
        	var request = $http.post(url, dataString);

        	request.success(function(data) {
       			$.each(templates, function(index, item) {
      				if(item['ID'] == template.ID) {
          				templates.splice(index, 1);
          				$modalInstance.dismiss('cancel');
          				 return false;
      				}    
   				});
        	});
        	request.error(function(data, status, headers, config) {
        		//console.log(data);
        		console.log("status: "+status+", message: "+data.errorText);
        		$scope.error = "An error occured while deleting template";

        	});
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

	ngApplication.controller('ModalInstance3Ctrl', function ($scope, $http, $modalInstance, template) {

  		$scope.id = template.ID;
  		$scope.name = template.TEMPLATENAME;
  		$scope.description = template.DESCRIPTION;
  		$scope.enclosure = template.ENCLOSURE;
  		$scope.standard = template.STANDARD;

  		$scope.update = function() {
    		
    	var dataString = [{"ID":$scope.id,"TEMPLATENAME":$scope.name,"DESCRIPTION":$scope.description,"ENCLOSURE":$scope.enclosure, "STANDARD":$scope.standard}];
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateTemplate/1');
        var request = $http.post(url, dataString);

        request.success(function(data) {

        	if($scope.file != null){
        		var base64 = $scope.file.base64;
        		console.log(base64);
				var dataString = '['+$scope.id+','+'"'+base64+'"'+']';
        		var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateFaxTemplateBase64/1');
        		var request = $http.post(url, dataString);

        		request.success(function(data) {
        			template.TEMPLATENAME = $scope.name;
        			template.EMAIL = $scope.email;
        			template.DESCRIPTION = $scope.description;
        			template.ENCLOSURE = $scope.enclosure;
        			template.STANDARD = $scope.standard
        			$scope.success = "Template updated";
        		});
        		request.error(function(data, status, headers, config) {
        			//console.log(data);
        			console.log("status: "+status+", message: "+data.errorText);
        			$scope.error = "An error occured while updating template";
        		});
        	}
        	else{
        		template.TEMPLATENAME = $scope.name;
        		template.EMAIL = $scope.email;
        		template.DESCRIPTION = $scope.description;
        		template.ENCLOSURE = $scope.enclosure;
        		template.STANDARD = $scope.standard
        		$scope.success = "Template has been updated";
        	}
        });
        request.error(function(data, status, headers, config) {
        	//console.log(data);
        	console.log("status: "+status+", message: "+data.errorText);
        	$scope.error = "An error occured while updating template";

        });
  		};

  		$scope.cancel = function () {
    		$modalInstance.dismiss('cancel');
  		};
	});

}