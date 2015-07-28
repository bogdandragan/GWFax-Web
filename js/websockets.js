var socket;
var nickname;

function initWebSocket(){  
  try
  {
	socket = new WebSocket(WEBSOCKET_URL,"synopsejson");
	console.log('WebSocket - status '+socket.readyState);
	socket.onopen = function(event){ 
		console.log("WebSocket - status " + this.readyState); 
		getTimeStamp();
		Join();
		//quit();
		//getComponent();
		//getTimeStamp();
		//getComponent();		
		//sgetUpdatedFax();
		//log("onopen: Welcome - status "+this.readyState); 
		//getTimeStamp();
		//Join();
	};
	socket.onmessage = function(event){ 
		console.log(event); 
		//log("onmessage: ("+msg.data.length+" bytes): " + (msg.data.length < 5000 ? msg.data : (msg.data.substr(0, 30) + '...'))); 
		//log(msg.data);
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
}


function getTimeStamp() {
	var msg = JSON.stringify(makerequest("GET","root/TimeStamp",""));
	try{ 
		socket.send(msg); 
		console.log('Sent ('+msg.length+" bytes): " + msg.length < 5000 ? msg : (msg.substr(0, 100) + '...')); 
	} 
	catch(ex){ 
		console.log(ex); 
	}
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

function quit(){
  socket.close(1000, 'Bye bye');
  socket=null;
}

function getComponent() {
	var msg = JSON.stringify(makerequest("","root/FaxGwiseCallback.ComponentsNotify",""));
	try{ 
		socket.send(msg); 
		console.log('Sent ('+msg.length+" bytes): " + msg.length < 5000 ? msg : (msg.substr(0, 30) + '...')); 
	} 
	catch(ex){ 
		console.log(ex); 
	}
}



