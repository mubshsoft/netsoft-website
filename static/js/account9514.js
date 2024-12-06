/*eslint-disable no-undef*/

$(document).ready(function(){
    if($("input[name='password2']").val() != undefined)
        passwordStrengthMeter($("input[name='password2']").val())
    $("input[name='password2']").keyup(function(){
        passwordStrengthMeter($("input[name='password2']").val())
    })
    $("#copy_totp_key").click(function(){
        var text = document.getElementById("totp_key").getAttribute("data-original-title")
        copyToClipboard(text)
        $("#copy_totp_key").attr('src','/static/img/check-mark.png')
    })

    $("#btn_user_detail").click(function(){
        if($('#first_name').val() == "" || $('#last_name').val() == "" || $('#country').val() == '0' || $('#state').val() == '0'){
            $('#user_detail_error_error_msg').html('Please fill required fields.')
            $('#user_detail_error').show()
        }
        else{
            verifyUserDetails()
        }
    })

    $(".toggle-password").click(function() {
        $(this).toggleClass("eye-slash eye");
        var input = $($('.toggle-password-field')[0])
        if (input.attr("type") == "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });

    const inputs = document.querySelectorAll('#otp > *[id]');
    for (let i = 0; i < inputs.length; i++) {
        $("#otp_"+(i+1)).keydown(function(event){
            if (event.key === "Backspace") {
                inputs[i].value = '';
                $("#btn_submit").prop('disabled', true)
                if (i !== 0)
                  inputs[i - 1].focus();
              }
            if (event.keyCode > 47 && event.keyCode < 58) {
                inputs[i].value = event.key;
                if (i == inputs.length - 1){
                    $("#btn_submit").prop('disabled', false)
                    $("#btn_submit").focus()
                }
                else
                    inputs[i + 1].focus();
                event.preventDefault();
            } else {
                event.preventDefault();
            }
        })
    }

    $(".backup-input").keyup(function () {
        var totalLength = $('#backup_1').val().length + $('#backup_2').val().length + $('#backup_3').val().length + $('#backup_4').val().length
        $("#btn_submit").prop('disabled', true)
        if (this.value.length == this.maxLength) {
          var $next = $(this).next('.backup-input');
          if ($next.length){
            $(this).next('.backup-input').focus();
          }
          else{
            $("#btn_submit").prop('disabled', false)
            $("#btn_submit").focus()
          }
        }
        if( totalLength == 16){
            $("#btn_submit").prop('disabled', false)
            $("#btn_submit").focus()
        }
    });

})

function passwordStrengthMeter(passValue){
    var strength = 0
        if (passValue.length > 7){
            strength += 2
            $('#pass_length').css('color', '#E8E8E8')
        }
        else{
            $('#pass_length').css('color', '#6F389F')
        }
        // If password contains both lower and uppercase characters, increase strength value.
        if (passValue.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){
            strength += 2
            $('#pass_cases').css('color', '#E8E8E8')
        }
        else{
            $('#pass_cases').css('color', '#6F389F')
        }
        // If it has numbers increase strength value.
        if (passValue.match(/([0-9])/)){
            strength += 2
            $('#pass_num').css('color', '#E8E8E8')
        }
        else{
            $('#pass_num').css('color', '#6F389F')
        }
        // If it has one special character, increase strength value.
        if (passValue.match(/([!,%,&,@,#,$,^,*,?,_,~])/)){
            strength += 2
            $('#pass_spcl').css('color', '#E8E8E8')
        }
        else{
            $('#pass_spcl').css('color', '#6F389F')
        }

        fillPasswordStrength(strength)
        $("input[name='password1']").val($("input[name='password2']").val())
}

function fillPasswordStrength(Strength){
    $(".password-strength-item").removeClass('fill-password-strength')
    for(let i=0; i<Strength; i++){
        $(".password-strength-item")[i].classList.add('fill-password-strength')
    }
}

function verifyUserDetails(){
    $.ajax({
        url: "/verify_user_json",
        type: "POST",
        data: {
            csrfmiddlewaretoken:$('input[name="csrfmiddlewaretoken"]').val(),
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            country: $('#country').val(),
            state: $('#state').val()
        },
        success: function(data){
            if(data['status']){
                $('#user_detail_container').hide()
                $('#enable_authenticator_container').show()
            }
            else{
                $('#user_detail_error_error_msg').html(data['error_msg'])
                $('#user_detail_error').show();
            }
        },
        error: function(){
            notify("Unable to verify user details.", "warning")
        }
    })
}
