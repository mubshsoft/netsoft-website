/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/

$("#contact_us_form").submit(function(event) {
    event.preventDefault();
    if(_('user_name').value.trim().length < 1){
        _('error_message').innerHTML = "Please write your full name."
        _('error_message').style.display="block"
        return false
    }
    if(_('user_message').value.trim().length < 1){
        _('error_message').innerHTML = "Please write some message."
        _('error_message').style.display="block"
        return false
    }
    if(!validateEmail(_("user_email").value))
    {
        _('error_message').innerHTML = "Enter a valid email."
        _('error_message').style.display="block"
        return false;
    }
    if( $("#captcha").length > 0 && grecaptcha.getResponse().length == 0){
        _('error_message').innerHTML = "Invalid reCAPTCHA. Please try again."
        _('error_message').style.display="block"
        $("#btn_submit_contact").attr("disabled", true);
        return false
    }
    _('btn_submit_contact').value="Please wait..";
    $("#btn_submit_contact").attr("disabled", true);
    $.ajax(
        { 
            data: $(this).serialize(),
            type: $(this).attr('method'),
            url: $(this).attr('action'),
            success: function(data) {
                if(data["success"]){
                    _('message_box').innerHTML = "<img src='/static/img/checked.svg' alt='success' style='width:24px; margin-right: 4px;'> Message sent successfully."
                    _('message_box').style.display="block"
                    _('btn_submit_contact').value="Send";
                    grecaptcha.reset();
                    $("#contact_us_form").get(0).reset();
                }
                else{
                    _('error_message').innerHTML=data["message"];
                    _('error_message').style.display="block"
                    _('btn_submit_contact').value="Send";
                    $("#btn_submit_contact").attr("disabled", false);
                }
            },
            error: function(data) {
                _('error_message').style.display="block"
                _('error_message').innerHTML = data["message"]
                _('btn_submit_contact').value="Send";
                $("#btn_submit_contact").attr("disabled", false);
                $("#contact_us_form").get(0).reset();
            }
        }
    );
});

$('#form_register, #form_login, #modal_login_form').submit(function(event){
    if ($("#captcha").length > 0) {
        if(grecaptcha.getResponse().length == 0){
            event.preventDefault();
            _('captch_message').innerHTML = "Invalid reCAPTCHA. Please try again."
            _('captch_message').style.display="block"
            return false;
        }
    }
})

var verifyCallback = function() {
    $("#btn_submit_contact").attr("disabled", false);
    $("#btn_register").attr("disabled", false);
    $("#btn_login").attr("disabled", false);
    $("#error_message").hide()
    $("#captch_message").hide()
};
var onloadCallback = function() {
    if($("#captcha").length > 0) {
        if($("#btn_login").length > 0){
            $("#btn_login").prop('disabled', true);
        }
        grecaptcha.render('captcha', {
            'sitekey' : '6Le_YsQZAAAAAGImoQYnkZjyf-Yqskzstfxpx-c0',
            'callback' : verifyCallback,
            'theme' : 'light'
        });
    }
};
$('#contact_us_form').click(function(){
    $("#message_box").hide("slow")
})

function hideDisplayNameErrorMsg() {
    $("#display_name_error_section").hide();
}
