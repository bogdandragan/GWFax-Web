$(document).ready(function () {
    $('#convertergeneral').validate({
        rules:{
            filetypes:"required",
            timeout:{
                digits:true
            },
            filesize:{
                digits:true
            },
            compress:{
                digits:false
            },
            format:"required"
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#converterheader').validate({
        rules:{
            filetypes:"required",
            headeroffright:{
                digits:true
            },
            headeroffleft:{
                digits:true
            },
            headerofftop:{
                digits:true
            },
            headerborder:{
                digits:true
            },
            headersize:{
                digits:true
            },
            headerlogoX:{
                digits:true
            },
            headerlogoY:{
                digits:true
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#isdn').validate({
        rules:{
            maxmsnlength:{
                digits:true
            },
            retryperiod:{
                digits:true
            },
            retrycount:{
                digits:true
            },
            maxrecipients:{
                digits:true
            },
            maxfaxfilesize:{
                digits:true
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#t38').validate({
        rules:{
            t38retryperiod:{
                digits:true
            },
            t38retrycount:{
                digits:true
            },
            t38licensedport:{
                digits:true
            },
            t38dialplan:{
                digits:false
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#gw').validate({
        rules:{
            processedmessagescount:{
                digits:true
            },
            mailboxscaninterval:{
                digits:true
            },
            login:"required",
            password:"required",
            domain:"required",
            port:{
                digits: true
            },
            workfolder:{
                digits: false
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#second').validate({
        rules:{
            secondprocessedmessagescount:{
                digits:true
            },
            secondmailboxscaninterval:{
                digits:true
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });

    $('#router').validate({
        rules:{
            nrlengthfordialprefix:{
                digits:true
            },
            deletefaxolder:{
                digits:true
            }
        },
        highlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(id_attr).removeClass('glyphicon-ok').addClass('glyphicon-remove');         
        },
        unhighlight: function(element) {
            var id_attr = "#" + $( element ).attr("id") + "1";
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(id_attr).removeClass('glyphicon-remove').addClass('glyphicon-ok');        
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.length) {
                error.insertAfter(element);
            } else {
            error.insertAfter(element);
            }
        } 
    });
}); 
