/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/

$("#subscribe_newsletter").submit(function(event){
    event.preventDefault();
    _('btn_subscribe_newsletter').value="Please wait..";
    $("#btn_subscribe_newsletter").attr("disabled", true);
    var subs_error_message = _('subs_error_message')
    subs_error_message.className = "footer-alert-danger hidden"
    $.ajax(
        { 
            data: $(this).serialize(),
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            success: function(data) {
                if(data["success"]){
                    subs_error_message.innerHTML = "<img src='/static/img/checked.svg' alt='success' style='width:24px; height: 50px;'> " + data["message"]
                    subs_error_message.className = ""
                    subs_error_message.setAttribute("style", "display:block; font-size:14px");
                }
                else{
                    subs_error_message.innerHTML=data["message"];
                    subs_error_message.setAttribute("style", "display:block; font-size:14px");
                }
                $("#btn_subscribe_newsletter").attr("disabled", false);
                _('btn_subscribe_newsletter').value="Subscribe";
                $("#subscribe_newsletter").get(0).reset();
            },
            error: function() {
                _('btn_subscribe_newsletter').value="Subscribe";
                $("#btn_subscribe_newsletter").attr("disabled", false);
                $("#subscribe_newsletter").get(0).reset();
            }
        }
    );
})
$('#email, #name').click(function(){
    _('subs_error_message').style.display="none"
})
