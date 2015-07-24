function d2h(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}

function getLocalStorageParamName(name) {
    return 'FaxGWise_' + name;
}

function getLocalStorageParam(name) {
    return localStorage.getItem(getLocalStorageParamName(name));
}

function getLocalStorageParamAsInt(name) {
    var c = getLocalStorageParam(name);
    return Number(c) ? c : 0;
}

function setLocalStorageParam(name, value) {
    return localStorage.setItem(getLocalStorageParamName(name), value);
}

function InitSession() {
    localStorage.removeItem(getLocalStorageParamName('SESSION_ID'));
    localStorage.removeItem(getLocalStorageParamName('SESSION_PRIVATE_KEY'));
    localStorage.removeItem(getLocalStorageParamName('SESSION_LAST_TICK_COUNT'));
    localStorage.removeItem(getLocalStorageParamName('SESSION_TICK_COUNT_OFFSET'));
    localStorage.removeItem(getLocalStorageParamName('SESSION_USERNAME'));
    return true;
}

function CloseSession() {
    if (!getLocalStorageParamAsInt('SESSION_ID')) return;

    $.ajax({
        type: "GET",
        dataType: "json",
        url: MAIN_URL + '/auth',
        data: {'session': getLocalStorageParamAsInt('SESSION_ID'), 'UserName': getLocalStorageParam('SESSION_USERNAME')},
        timeout: 2000,
        success: InitSession,
        error: InitSession
    });
}

function CheckAndAuthorize() {	
	InitSession();
	
	var username = $('#form-username').val(); 
	if (username == "") {
    	alert("Username can\'t be empty!");
    	return false;
    }
    
    var userpassword =  $('#form-password').val(); 
    if (userpassword == "") {
    	alert("Password can\'t be empty!");
    	return false;
    }
    
    AuthorizeUser(username, userpassword);
  	
} 

function AuthorizeUser(user, pwd) {	
	//CloseSession(); // try close previously opened session
	
	AuthorizeFirstStep(user, pwd);
}

function AuthorizeFirstStep(user, pwd) {    
    var dataString = {'UserName': user};		
	$.ajax({
		type:'GET',
		dataType: "json",
		url:MAIN_URL + '/auth',
		data: dataString,
        timeout:5000,
        /*
        beforeSend: function(jqXHR, settings) {
            $.blockUI({message: '<h1>Wait please...</h1>'});
        },*/
        success: function(data, textStatus, jqXHR) {
        	AuthorizeSecondStep(user, pwd, data.result);			
        }, // end success of first handshake
	
		error: function (jqXHR, textStatus, errorThrown){
			log("Step 1 status: "+textStatus+", message: "+errorThrown);
			log(jqXHR);
			alert("Authorization error. Message: "+errorThrown);
			//$.unblockUI();
		}
	});
}

function AuthorizeSecondStep(user, pwd, servnonce) {
	var d = new Date();
    var clientnonce = d.getTime() / (1000 * 60 * 5); // valid for 5*60*1000 ms = 5 minutes;
    clientnonce = CryptoJS.SHA256("" + clientnonce);
    //log(clientnonce);
    // The Password parameter as sent for the 2nd request will be computed as
    // ! Sha256(ModelRoot+Nonce+ClientNonce+UserName+Sha256('salt'+PassWord))
    var password = CryptoJS.SHA256(SERVER_ROOT + servnonce + clientnonce + user + CryptoJS.SHA256('salt' + pwd));
    //log(password);
    var dataString = {'UserName': user, 'Password': password.toString(), 'ClientNonce': clientnonce.toString()};
    // second handshake
    $.ajax({
        type: "GET",
        dataType: "json",
        url: MAIN_URL + '/auth',
        data: dataString,
        timeout: 5000,

        success: function(data, textStatus, jqXHR) {
            var p = data.result.indexOf('+');
            if (p > -1) {
                setLocalStorageParam('SESSION_ID', data.result.substr(0, p));
                setLocalStorageParam('SESSION_PRIVATE_KEY', data.result + CryptoJS.SHA256('salt' + pwd));
                setLocalStorageParam('SESSION_USERNAME', user);
				log('You are successfully authenticated');
                
                GetRESTServerContract();
                
                //$.unblockUI();                        
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            log("Step 2 status: "+textStatus+", message: "+errorThrown);
            if (jqXHR.status == 404) {
                log('Wrong username or password');
                alert("Wrong username or password.");
            }
            alert("Authorization error. Message: "+errorThrown);
            log(jqXHR);
            //$.unblockUI();
            return
        }
    }); // end of second handshake
}

function GetRESTServerContract() {
	// RemoteFax._contract_
    $.ajax({
        type: "POST",
        dataType: "json",
        url: MAIN_URL + '/RemoteFax._contract_',
        timeout: 5000,
        success: function(data, textStatus, jqXHR) {
            log('Contract received');
            log(data.result);
            ConnectToRESTServer();            
        },
        
        error: function (jqXHR, textStatus, errorThrown){
			log("Step 3 status: "+textStatus+", message: "+errorThrown);
			log(jqXHR);
			alert("Authorization error. Message: "+errorThrown);
		}
    });
}

function ConnectToRESTServer () {
	var user = getLocalStorageParam('SESSION_USERNAME');
	var dataString = {'userName': user, 'sessionID' : getLocalStorageParam('SESSION_ID')};
            
	// RemoteFax.Connect
	$.ajax({
		type: "GET",
		dataType: "json",
		url: MAIN_URL + '/RemoteFax.Connect',
		timeout: 5000,
		data: dataString,
		success: function(data, textStatus, jqXHR) {
			log('Connected');
			//log(data.result);
			
			//----------------------
			//GetFaxMessages();
			//InitJQFaxMessagesTable();
			initWebSocket();
			location.href = LINK_TO_MAIN_PAGE;
			//----------------------																														
		},
		
		error: function (jqXHR, textStatus, errorThrown){
			log("Step 4 status: "+textStatus+", message: "+errorThrown);
			log(jqXHR);
			alert("Authorization error. Message: "+errorThrown);
		}
	});
}

function GetFaxMessages(rowsPerPage, pageNumber, orderByField, orderDirection, controllerScope) {
	var dataString = '[' + rowsPerPage + ','+ pageNumber +',"' + orderByField + '","' + orderDirection + '"]';
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: MAIN_URL + '/RemoteFax.GetFaxOutMessages/1',
		data: dataString,
		processData:false,
		timeout: 2000,

		success: function(data, textStatus, jqXHR) {
			var p = data.result[0];
			//log('Success SQL request');                    
			
			//log(p);
			ShowFaxMessagesTable(p, rowsPerPage, controllerScope);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			//unlock grid
			//$("#jqGrid_outfaxes-table")[0].grid.endReq();
			
			log("sendSQL status: "+textStatus+", message: "+errorThrown);
		}
	});
}

function GetFaxMessagesTotalCountPages(rowsPerPage) {
	var sqlQuery = 'select count (*)' +
					'from FAXQUEUE inner join FAXORDER on FAXQUEUE.ORDERID = FAXORDER.ID ' +
					'where FAXQUEUE.DIRECTION = 0';
	sendSQL_ajax(sqlQuery, ShowFaxMessagesTotalCountPages, rowsPerPage);
} 

function GetFaxJobs(orderId, sender) {
	var sqlQuery = 'select JOBQUEUE.ID as JOBID, JOBQUEUE.ORDERID, CONTACTS.FAX as RECEIVERPHOHE, JOBQUEUE.CREATIONTIME, ' + 
      				'JOBQUEUE.ONLINETIME, JOBQUEUE.JOBSTATE, JOBQUEUE.ERRMESSAGE, JOBQUEUE.PROCESSINGSTAGE ' +   
					'from JOBQUEUE inner join CONTACTS on JOBQUEUE.CONTACTID = CONTACTS.ID '+ 					
					'where JOBQUEUE.ORDERID = ' + orderId + 
					' order by 1 asc';
	sendSQL_ajax(sqlQuery, ShowFaxJobsTable, sender);
}

function GetFaxTasks(jobId, sender) {
	var sqlQuery = 'select ID, JOBID, CONTROLLERNAME, PROCESSINGSTAGE, TASKSTATE, ERRMESSAGE ' +   
					'from JOBTASK '+ 
					'where JOBID = ' + jobId + 
					' order by 1 asc';
	sendSQL_ajax(sqlQuery, ShowFaxTasksTable, sender);
}

function GetFaxJobStatuses(orderId, sender) {
	var sqlQuery = 'select JOBQUEUE.ID as JOBID, JOBQUEUE.PROCESSINGSTAGE ' +   
					'from JOBQUEUE '+ 					
					'where JOBQUEUE.ORDERID = ' + orderId + 
					' order by 1 asc';
	sendSQL_ajax(sqlQuery, ShowFaxJobStatuses, sender);
}

function GetFaxTaskStatuses(jobId, sender) {
	var sqlQuery = 'select ID as TASKID, TASKSTATE ' +   
					'from JOBTASK '+ 					
					'where JOBID = ' + jobId + 
					' order by 1 asc';
	sendSQL_ajax(sqlQuery, ShowFaxTaskStatuses, sender);
}

function GetInJobs(rowsPerPage, pageNumber, orderByField, orderDirection) {
	var dataString = '[' + rowsPerPage + ','+ pageNumber +',"' + orderByField + '","' + orderDirection + '"]';
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: MAIN_URL + '/RemoteFax.GetFaxInMessages/1',
		data: dataString,
		processData:false,
		timeout: 2000,

		success: function(data, textStatus, jqXHR) {
			var p = data.result[0];
			log('Success SQL request');                    
			
			//log(p);
			ShowInJobsTable(p, rowsPerPage);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			//unlock grid
			$("#jqGrid_infaxes-table")[0].grid.endReq();
			
			log("sendSQL status: "+textStatus+", message: "+errorThrown);
		}
	});
}

function GetUsers(rowsPerPage, pageNumber, orderByField, orderDirection) {
	var dataString = '[' + rowsPerPage + ','+ pageNumber +',"' + orderByField + '","' + orderDirection + '"]';
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: MAIN_URL + '/RemoteFax.GetUsers/1',
		data: dataString,
		processData:false,
		timeout: 2000,

		success: function(data, textStatus, jqXHR) {
			var p = data.result[0];
			log('Success SQL request');                    
			
			//log(p);
			ShowInJobsTable(p, rowsPerPage);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			//unlock grid
			$("#jqGrid_infaxes-table")[0].grid.endReq();
			
			log("sendSQL status: "+textStatus+", message: "+errorThrown);
		}
	});
}

function sendSQL_ajax(query, showFunction, sender){
	//var msg = "select id, name, email, phone, fax, company, csid from contacts";
	
	//var dataString = {'aSQL': msg, 'aExpectResults' : true, 'aExpanded' : true};
	//var dataString = '["'+msg+'",true,true]';
	var dataString = '["' + query + '",true,true]';
	
	$.ajax({
		type: "POST",
		dataType: "json",
		url: MAIN_URL + '/RemoteFax.Execute/1',
		data: dataString,
		processData:false,
		timeout: 2000,

		success: function(data, textStatus, jqXHR) {
			var p = data.result[0];
			log('Success SQL request');                    
			
			//log(p);
			showFunction(p, sender);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			log("sendSQL status: "+textStatus+", message: "+errorThrown);
		}
	});
    
}

function log(msg) { 
	console.log(msg); 
}

function parseQueryString(strQuery) {
    var strSearch   = strQuery.substr(1);
    var strPattern  = /([^=]+)=([^&]+)&?/ig;
	var arrMatch    = strPattern.exec(strSearch);
    var objRes      = {};
    while (arrMatch != null) {
        objRes[arrMatch[1]] = arrMatch[2];
        arrMatch = strPattern.exec(strSearch);
    }
    return objRes;
};

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

// converted from TSQLRestClientURI.SessionSign function
function GetSessionSignature(url) {
    // expected format is 'session_signature='Hexa8(SessionID)+Hexa8(TimeStamp)+
    // Hexa8(crc32('SessionID+HexaSessionPrivateKey'+Sha256('salt'+PassWord)+
    // Hexa8(TimeStamp)+url))
    var d = new Date();
    var Tix = d.getTime();
    if (Tix < getLocalStorageParamAsInt('SESSION_LAST_TICK_COUNT')) // wrap around 0 after 49.7 days
        setLocalStorageParam('SESSION_TICK_COUNT_OFFSET', getLocalStorageParamAsInt('SESSION_TICK_COUNT_OFFSET') + 1 << (32 - 8)); // allows 35 years timing
    setLocalStorageParam('SESSION_LAST_TICK_COUNT', Tix);

    var Nonce = d2h(Tix >>> 8 + getLocalStorageParamAsInt('SESSION_TICK_COUNT_OFFSET'), 8);
    var sign = d2h(getLocalStorageParamAsInt('SESSION_ID'), 8) + Nonce + d2h(crc32(getLocalStorageParam('SESSION_PRIVATE_KEY') + Nonce + url), 8);
    var prf = '?';
    if (url.indexOf('?') > -1) prf = '&';
    return  prf + 'session_signature=' + sign;
}

$.ajaxPrefilter(function(options, _, jqXHR) {
    // signing all sended URLs
    if (getLocalStorageParamAsInt('SESSION_ID') > 0 && options.url.indexOf(MAIN_URL) > -1) { // if user authenticated
        var new_url = options.url;
        if (options.data && options.type == "GET")
        {
            new_url += '?' + options.data;
            options.data = null; // or options.data will be added to url by JQuery
        }
        options.url = new_url + GetSessionSignature(new_url.substr(SERVER_URL.length + 1));
        options.cache = true; // we don't want anti-cache "_" JQuery-parameter
    }
});

function AddSessionSignatureToURL(url) {
	// signing all sended URLs
	var new_url = url;
    if (getLocalStorageParamAsInt('SESSION_ID') > 0 && url.indexOf(MAIN_URL) > -1) { // if user authenticated
        new_url += GetSessionSignature(url.substr(SERVER_URL.length + 1));        
    }
    return new_url;
}

$(function() {
    if (typeof(localStorage) == 'undefined')
        alert('You do not have HTML5 localStorage support in your browser. Please update or application cannot work as expected');
});