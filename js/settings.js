var ngApplication;

function initSettings(){
	ngApplication = angular.module('FaxGWiseApp', ['base64', 'ui.bootstrap']);   
        ngApplication.controller('settingsCtrl', function ($scope, $http, $base64, $modal) {

        $scope.numbers = [0,1,2];
        var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetSettings/1');
        var request = $http.post(url);

        request.success(function(data, status, headers, config) {
            console.log(data);
            var data = data.result[0];

            $scope.faxConverter = data[0].Options;
            $scope.faxConverterID = data[0].ID;
            $scope.t38Controller = data[1].Options;
            $scope.t38ControllerID = data[1].ID;
            $scope.gwCommunicator = data[2].Options;
            $scope.gwCommunicatorID = data[2].ID;
            $scope.reporter = data[3].Options;
            $scope.reporterID = data[3].ID;
            $scope.router = data[4].Options;
            $scope.routerID = data[4].ID;
            $scope.loadDialPlan($scope.t38Controller[4].VALUEID);
            
        });
        request.error(function(data, status, headers, config) {
            console.log("sendSQL status: "+status+", message: "+data);
            if(status == 403){
                window.location.replace("../login.html");
            }
            alert("error:"+status);
        });
        
        $scope.loadDialPlan = function(valueId){
            var dataString = '[' + valueId + ']';
            url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetBinarySettings/1');
            request = $http.post(url, dataString);

            request.success(function(data, status, headers, config) {
                var xmlStr = $base64.decode(data.result[0].binaryData);
                var x2js = new X2JS();
                var result = x2js.xml_str2json(xmlStr);
                $scope.dialPlan = result;
            });
            request.error(function(data, status, headers, config) {
                console.log("sendSQL status: "+status+", message: "+data);
                if(status == 403){
                    window.location.replace("../login.html");
                }
                alert("error:"+status);
            });
        }

        $scope.addFormOpen = function (dialPlan, settId, valueId) {
        
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'dialPlanAddForm.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    dialPlan: function () {
                    return dialPlan;
                    },
                    settId: function () {
                    return settId;
                    },
                    valueId: function () {
                    return valueId;
                    }
                }
      
            });
        };

        $scope.deleteFormOpen = function (dialPlan, rule, settId, valueId) {
        
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'dialPlanDeleteForm.html',
                controller: 'ModalInstance2Ctrl',
                resolve: {
                    dialPlan: function () {
                    return dialPlan;
                    },
                    rule: function () {
                    return rule;
                    },
                    settId: function () {
                    return settId;
                    },
                    valueId: function () {
                    return valueId;
                    }
                }
      
            });
        };

        $scope.editFormOpen = function (dialPlan, rule, settId, valueId) {
        
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'dialPlanEditForm.html',
                controller: 'ModalInstance3Ctrl',
                resolve: {
                    dialPlan: function () {
                    return dialPlan;
                    },
                    rule: function () {
                    return rule;
                    },
                    settId: function () {
                    return settId;
                    },
                    valueId: function () {
                    return valueId;
                    }
                }
      
            });
        };

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
            var params = ['filetypes','convEnabled','timeout','compress','format','filesize'];

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
            var params = ['t38enabled','t38runstart','t38retryperiod','t38retrycount', 't38licensedport'];

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
            var params = ['citycode','countrycode','nrlengthfordialprefix','internalfaxrouting', 'deletefaxolder', 'listenmsn','adminemail','ownphonenumber','routerdefaultsendertelephone','routerdefaultsenderfax','routerdefaultsendername','routerdefaultsendercompany','defaultsenderemail'];

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

    ngApplication.controller('ModalInstanceCtrl', function ($scope, $http, $base64, $modalInstance, dialPlan, settId, valueId) {
        $scope.newRule = {
            enabled : "0",
            final : "0"
        };
        console.log(dialPlan);

        $scope.add = function () {
            var rule = {};
            if($scope.newRule.rule == "prefix"){
                rule = {"String":$scope.newRule.string, "_Type":$scope.newRule.rule};
            }
            else if($scope.newRule.rule == "insert"){
                rule = {"String":$scope.newRule.string,"Index":$scope.newRule.index,"_Type":$scope.newRule.rule};
            }
            else if($scope.newRule.rule == "delete"){
                rule = {"Count":$scope.newRule.count,"Index":$scope.newRule.index,"_Type":$scope.newRule.rule};
            }
            else{
                rule = {"String":$scope.newRule.string,"ReplaceTo":$scope.newRule.replaceTo,"_Type":$scope.newRule.rule};
            }

            var jsonObject = {"PatternString":$scope.newRule.pattern, "Rule":rule,"_Enabled":$scope.newRule.enabled, "_Final":$scope.newRule.final};
            console.log(jsonObject);
            var x2js = new X2JS();
            var source = angular.copy(dialPlan);
            source.DialPlan.DialPattern.splice($scope.newRule.position-1,0,jsonObject);
            var result = x2js.json2xml_str(source);
            //console.log(result);

            var encodedXML = $base64.encode(result);
            var dataString = '['+ valueId +','+ settId+','+'"'+encodedXML +'"'+','+'"file.xml"'+']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateBynarySettingValue/1');
            var request = $http.post(url, dataString);

            request.success(function(data) {
                var dataString = '[' + valueId + ']';
                url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetBinarySettings/1');
                request = $http.post(url, dataString);

                request.success(function(data, status, headers, config) {
                    var xmlStr = $base64.decode(data.result[0].binaryData);
                    var x2js = new X2JS();
                    var result = x2js.xml_str2json(xmlStr);
                    dialPlan.DialPlan.DialPattern = result.DialPlan.DialPattern;
                    $modalInstance.dismiss('cancel');
                });
                request.error(function(data, status, headers, config) {
                    console.log("sendSQL status: "+status+", message: "+data);
                    $scope.error = "An error occured while adding new rule";
                    if(status == 403){
                        window.location.replace("../login.html");
                    }
                });
            });
            request.error(function(data, status, headers, config) {
                console.log("status: "+status+", message: "+data.errorText);
                $scope.error = "An error occured while adding template";

            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    ngApplication.controller('ModalInstance2Ctrl', function ($scope, $http, $base64, $modalInstance, dialPlan, rule, settId, valueId) {

        $scope.delete = function () {
            var x2js = new X2JS();
            var source = angular.copy(dialPlan);
            var index = dialPlan.DialPlan.DialPattern.indexOf(rule);
            source.DialPlan.DialPattern.splice(index, 1);     
            //console.log(source);
            var result = x2js.json2xml_str(source);

            var encodedXML = $base64.encode(result);
            var dataString = '['+ valueId +','+ settId+','+'"'+encodedXML +'"'+','+'"file.xml"'+']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateBynarySettingValue/1');
            var request = $http.post(url, dataString);

            request.success(function(data) {
                var dataString = '[' + valueId + ']';
                url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetBinarySettings/1');
                request = $http.post(url, dataString);

                request.success(function(data, status, headers, config) {
                    var xmlStr = $base64.decode(data.result[0].binaryData);
                    var x2js = new X2JS();
                    var result = x2js.xml_str2json(xmlStr);
                    dialPlan.DialPlan.DialPattern = result.DialPlan.DialPattern;
                    $modalInstance.dismiss('cancel');
                });
                request.error(function(data, status, headers, config) {
                    console.log("sendSQL status: "+status+", message: "+data);
                    $scope.error = "An error occured while deleting a dial rule";
                    if(status == 403){
                        window.location.replace("../login.html");
                    }
                });
            });
            request.error(function(data, status, headers, config) {
                console.log("status: "+status+", message: "+data.errorText);
                $scope.error = "An error occured while deleting a dial rule";

            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    ngApplication.controller('ModalInstance3Ctrl', function ($scope, $http, $base64, $modalInstance, dialPlan, rule, settId, valueId) {
        $scope.newRule = {
            enabled : rule._Enabled,
            final : rule._Final,
            index : rule.Rule.Index,
            string : rule.Rule.String,
            count : rule.Rule.Count,
            rule : rule.Rule._Type,
            replaceTo : rule.Rule.ReplaceTo,
            pattern : rule.PatternString,
            currentPos : dialPlan.DialPlan.DialPattern.indexOf(rule)+1,
            position : dialPlan.DialPlan.DialPattern.indexOf(rule)+1
        };
        console.log(dialPlan);
        //console.log($scope.newRule);

        $scope.edit = function () {
            var rule = {};
            if($scope.newRule.rule == "prefix"){
                rule = {"String":$scope.newRule.string, "_Type":$scope.newRule.rule};
            }
            else if($scope.newRule.rule == "insert"){
                rule = {"String":$scope.newRule.string,"Index":$scope.newRule.index,"_Type":$scope.newRule.rule};
            }
            else if($scope.newRule.rule == "delete"){
                rule = {"Count":$scope.newRule.count,"Index":$scope.newRule.index,"_Type":$scope.newRule.rule};
            }
            else{
                rule = {"String":$scope.newRule.string,"ReplaceTo":$scope.newRule.replaceTo,"_Type":$scope.newRule.rule};
            }

            var jsonObject = {"PatternString":$scope.newRule.pattern, "Rule":rule,"_Enabled":$scope.newRule.enabled, "_Final":$scope.newRule.final};
            //console.log(jsonObject);
            var x2js = new X2JS();
            var source = angular.copy(dialPlan);
            source.DialPlan.DialPattern.splice($scope.newRule.currentPos-1,1);
            source.DialPlan.DialPattern.splice($scope.newRule.position-1,0,jsonObject);
            var result = x2js.json2xml_str(source);
            //console.log(result);

            var encodedXML = $base64.encode(result);
            var dataString = '['+ valueId +','+ settId+','+'"'+encodedXML +'"'+','+'"file.xml"'+']';
            var url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.UpdateBynarySettingValue/1');
            var request = $http.post(url, dataString);

            request.success(function(data) {
                var dataString = '[' + valueId + ']';
                url = AddSessionSignatureToURL(MAIN_URL + '/RemoteFax.GetBinarySettings/1');
                request = $http.post(url, dataString);

                request.success(function(data, status, headers, config) {
                    var xmlStr = $base64.decode(data.result[0].binaryData);
                    var x2js = new X2JS();
                    var result = x2js.xml_str2json(xmlStr);
                    dialPlan.DialPlan.DialPattern = result.DialPlan.DialPattern;
                    $scope.success = "Dial rule has been updated";
                });
                request.error(function(data, status, headers, config) {
                    console.log("sendSQL status: "+status+", message: "+data);
                    $scope.error = "An error occured while editing the rule";
                    if(status == 403){
                        window.location.replace("../login.html");
                    }
                });
            });
            request.error(function(data, status, headers, config) {
                console.log("status: "+status+", message: "+data.errorText);
                $scope.error = "An error occured while editing the rule";
                if(status == 403){
                    window.location.replace("../login.html");
                }
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
} 
