var ngApplication;

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
