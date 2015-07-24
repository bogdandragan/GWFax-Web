var logIn="../../logIn";
var logOut="../../logOut";

$("#buttonLogIn").click(function(e){
	var uform=$("#formLogIn");
	uform.find('.rfield').addClass('empty_field');
	checkInput(uform);
	var sizeEmpty = uform.find('.empty_field').size();
    if(sizeEmpty>0){
    	lightEmpty(uform);	
    }
    else{
    	var serUForm=uform.serialize();
    	var urla=logIn;
    	$.ajax({
   			type: "POST",
   			url: urla,
   			data: serUForm,  
   			
   			success: function(json) {
   				console.log(json)
				if(json["result"]==true){
				if((typeof json["role"] !== undefined) && (json["role"] == "admin")){
					console.log("admin")
					window.location.href="index.html"
				} else {
					console.log("simple")
					window.location.href="index.html"
				}
				}else{$("#errorMessLogIn").remove();
					$.each(json,function(i,item){
						$("#divLogIn").append('<p class="bg-danger" id="errorMessLogIn">'+item+'</p>');
					});
				}
   			}
		}).error(function(xhr) {getPostErrorParser(xhr)});
    }
});

function getPostErrorParser(xhr) {
	switch (xhr.status) {
            			case 400: alert("400 Error please contact Administrator"); break;
            			case 401: window.location.href="logIn.html"; break;
            			case 404: alert("404 Error please contact Administrator"); break;
            			case 500: alert("500 Error please contact Administrator"); break;
            			case 503: alert("503 Error please contact Administrator"); break;
            			default: alert("Unknown Error please contact Administrator))"); break;
            		}
}

function checkInput(uform){
	uform.find('.rfield').each(function(){
		if($(this).val() != ''){
			$(this).removeClass('empty_field');
		} 
    });
}

function lightEmpty(uform){
	uform.find('.empty_field').css({'border-color':'#d8512d'});
    setTimeout(function(){uform.find('.empty_field').removeAttr('style');},500);
}

