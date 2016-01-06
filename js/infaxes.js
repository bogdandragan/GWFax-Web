var ngApplication;

function initInFaxesTable(){
	    ngApplication = angular.module('FaxGWiseApp', []);  
    	ngApplication.controller('inFaxesCtrl', function ($scope, $http) {

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

        var dataString = '['+id+']';
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetUpdatedJobINMessage/1');
        var request = $http.post(url, dataString);

        request.success(function(data, status, headers, config) {

            $scope.inFax = data.result[0].rows[0];
            console.log($scope.inFax);    
        });
        request.error(function(data, status, headers, config) {
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
