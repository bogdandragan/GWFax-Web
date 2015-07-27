var slideShow = {
 index: 0,
count: 0,
ID: 0,
display:function (photo) {
 if (this.ID > 0){
   var dataString = '[' + this.ID + ','+ photo + ']';
    $.ajax({
		type: "POST",
		url: MAIN_URL + '/RemoteFax.GetFaxImagePNGBase64/1',
		dataType: "json",
		contentType: "application/json",
		data: dataString,
		timeout: 2000,
		success: function(data, textStatus, jqXHR) {
		   $('#display-img')
		    .attr('src', 'data:image/png;base64,' + data.result[0])
		     .hide()
		    .load(function(){
		     $(this).fadeIn();
		    }) 
		},
		error: function (jqXHR, textStatus, errorThrown) {
			
			log("send query status: "+textStatus+", message: "+errorThrown);
		}
	}); 
  } 
},
  nextPage: function () {
  var _slideShow = this;
   index++;
   if (index < count) {
    _slideShow.display(index);
   }
  },
  prevPage: function () {
   if (index > 0) {
     index--;
     _slideShow.display(index);
   }
 }
 
}
