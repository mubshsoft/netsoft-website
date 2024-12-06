/*eslint-disable no-unused-vars*/
/*eslint-disable no-useless-escape*/
/*eslint-disable no-undef*/

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const EVALUATOR_FILE_SIZE_LIMIT = 20 * 1024 * 1024;
var MB_SIZE = 1048576
var KB_SIZE = 1024
var COMPANY_LOGO_SIZE = 1024 * 1024
const DEFAULT_EVALUATOR = 0
const CUSTOM_EVALUATOR = 1
const SIZE_NAME = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const MAX_LINKED_COMPETITIONS = 5;
var LINKED_COMPETITIONS = [];
var ORIGINAL_LINKED_COMPETITIONS =[];
const COMPETITION_RESOURCE_FILE_LIMIT =  20 * 1024 * 1024;  // 20 MB
const RESUME_FILE_LIMIT = 10 * 1024 * 1024  // 10MB
const SUBMISSIONS_LIMIT = {
    infinite: "-1",
    competitionEnds: "0",
    perDay: "1",
    combined: "2"
};

var DATASET_AJAX_UPLOAD = new XMLHttpRequest();

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip()

    if(_('alert-message') && _('alert-message').innerHTML.trim().length > 0){
        if(_('level_tag'))
            notify(_('alert-message').innerHTML, _('level_tag').innerHTML);
    }
    $(".close-alert, .account-close-alert").on('click', function(){
        $("#alert-box").hide();
    })

    $(".enforce-login").on('click', function(e){
        e.preventDefault();
        var link = $(this).attr('href');
        $.ajax({
            url: '/user_profile/get_user_login_status',
            type: "GET",
            success: function(data){
                if(data['login_required'])
                {
                    $("input[name=return_url]").val(link);
                    $("#login-modal").modal('show');
                }
                else{
                    document.location.href = link;
                }
            },
            error: function(){
                notify("Unable get user login status")
                location.reload();
            }
        })
    });
    $('input[type=text], textarea').blur(function() {
        $(this).val($(this).val().trim());
    });

    /* disable double click of submit button */
     $('input[type="submit"]').on("dblclick", function(event){
        $(this).prop('disabled', true);
     })

     /* disable submit buttons aftre form submission */
     $('form').submit(function(){
        $("input[type='submit']", this).attr('disabled', 'disabled');
        return true;
     })
});

function clearLinkedCompetitions() {
    LINKED_COMPETITIONS = [];
}

function getFileSizeInfoText(sizeBytes=0, decimalPlaces=2){
    var sizeInInt = parseInt(sizeBytes);
    if (sizeInInt == 0){
        return "0 B";
    }
    const logBase = (n, base) => Math.log(n) / Math.log(base);
    var i = parseInt(Math.floor(logBase(sizeInInt, 1024)));
    var p = Math.pow(1024, i);
    var s = (sizeInInt / p).toFixed(decimalPlaces);
    if (i < SIZE_NAME.length){
        return s.toString() + ' ' + SIZE_NAME[i];
    }
    return sizeBytes + ' ' + "B";
}

function notify(message, type, displayTime=8000) {
    var cls = 'alert alert-' + type + ' alert-dismissable page-alert'
    $('#alert-box').attr("class",cls);
    $('#alert-message').html(message)
    $('#alert-box').show();
    setTimeout('$("#alert-box").hide();',displayTime);
}
function _(el) {
    return document.getElementById(el);
}
function isValidDate(newDate){
    var d = new Date(newDate);
    return !isNaN(Date.parse(d))
}
function filterString(linkStr){
    // Removing all special characters to be used as id of an element
    var outString = linkStr.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> ]/gi, '');
    return outString;
}
function copyToClipboard(text) {
    var copyTest = document.queryCommandSupported('copy');
    if (copyTest === true) {
      var copyTextArea = document.createElement("textarea");
      copyTextArea.value = text;
      document.body.appendChild(copyTextArea);
      copyTextArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        notify("Oops, unable to copy", "warning");
      }
      document.body.removeChild(copyTextArea);
    } else {
      // Fallback if browser doesn't support .execCommand('copy')
      notify("Copy to clipboard: Ctrl+C or Command+C, Enter", "warning");
    }
}

function validateEmail(inputText)
{
    var mailFormat = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    return mailFormat.test(inputText.trim());
}

function validateURL(inputText, siteType)
{
    var pattern = "";
    if(siteType == "website"){
        pattern = /^http(?:s)?:\/\/(?:www\.)?[A-Z0-9.-]+\.[A-Z]{2,4}([A-Z0-9=/._?%-]+)?/i;
    }
    if(siteType == "facebook"){
        pattern = /^http(?:s)?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9_]+)?/i;
    }
    if(siteType == "twitter"){
        pattern = /^http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)?/i;
    }
    if(siteType == "linkedin"){
        pattern = /^((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))?/i;
    }
    return pattern.test(inputText.trim());
}

function loadJson(file, callback){
    $.ajax({
        url: file,
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function(){
            notify("Can't fetch data!", "warning");
        }
    });
}
function dateDiffInDays(a, b) {
    a = new Date(a);
    b = new Date(b);
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / MILLISECONDS_PER_DAY);
}

function dateDiffInMilliSeconds(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours(), date2.getMinutes());
    return (utc2 - utc1);
}

function cleanData(data, isNda=false){    
    var regex = /['|&;$%@"<>()+]/g;
    if(regex.test(data)){
      if (isNda){
        return data.replace(/"/g, "\\'");
      }  
      return data.replace(/['|&;$%@"<>()+]/gi, '').replace(/[\n|\r]/gi, '<br/>');
    }
    return data;
}

function maxLength(data, strLength){
    if(data && data.length > strLength){
      return data.substring(0,strLength) + " ...";
    }
    return data;
}
 
function bindMonths(elem){
    var monthArray = new Array();
    monthArray[1] = "Jan"
    monthArray[2] = "Feb"
    monthArray[3] = "Mar"
    monthArray[4] = "Apr"
    monthArray[5] = "May"
    monthArray[6] = "Jun"
    monthArray[7] = "Jul"
    monthArray[8] = "Aug"
    monthArray[9] = "Sep"
    monthArray[10] = "Oct"
    monthArray[11] = "Nov"
    monthArray[12] = "Dec"

    for(var monthIndex = 1; monthIndex < monthArray.length; monthIndex++){
        bindList(elem, monthArray[monthIndex], monthIndex)
    }
}

function bindYears(elem){
    var date = new Date()
    var currentYear = date.getFullYear()
    for(var year = currentYear; year > (currentYear - 100); year--){
        bindList(elem, year, year)
    }

}

function bindList(targetElem, text, value){
    var option = document.createElement("option")
    option.text = text
    option.value = value
    document.getElementById(targetElem).options.add(option)
}

function makeAjaxCall(context, postCallback=null, preCallback=null, errorCallback=null){
    if (preCallback && (typeof preCallback == "function"))
        preCallback();

    let formData = new FormData(context);
    $.ajax({
        data: formData,
        type: $(context).attr('method'),
        url: $(context).attr('action'),
        success: function(response) {
            if(response["success"]){
                if (postCallback && (typeof postCallback == "function"))
                    postCallback();
                 
                notify(response['message'], 'success');
            }
            else{
                if (errorCallback && (typeof errorCallback == "function"))
                    errorCallback();

                notify(response['message'], 'warning');
            }
        },
        error: function (response) {
            notify(response, "warning")
        },
        cache: false,
        contentType: false,
        processData: false
    }); 
}

function validateFileTypeAndSize(file, allowed_type, allowed_size){
    var fileSize = file.size;
    var fileType = file.name.split(".").pop().toLowerCase();
    var file_size_in_mb = allowed_size/(1024 * 1024);
    if (fileType != allowed_type){
        notify(`Selected file is not a ${allowed_type} (*.${allowed_type}) file`, "warning");
        return false;
    }
    if (fileSize > allowed_size){
        notify(`File Size is greater than ${file_size_in_mb} Mb`, "warning");
        return false;
    } 
    return true;
}

// format date like Sep. 23, 2020 - 10:00am
function formatDate(inputDate, inputTime="0"){
    var months = new Array()
    months[0] = "Jan"
    months[1] = "Feb"
    months[2] = "Mar"
    months[3] = "Apr"
    months[4] = "May"
    months[5] = "Jun"
    months[6] = "Jul"
    months[7] = "Aug"
    months[8] = "Sep"
    months[9] = "Oct"
    months[10] = "Nov"
    months[11] = "Dec"

    var date
    var formatedDate
    if(inputTime != "0"){
        date = new Date(inputDate + " " + inputTime)
        formatedDate = date.getDate() + " "  + months[date.getMonth()] + " " + date.getFullYear() + " - " + inputTime
    }
    else{
        date = new Date(inputDate)
        formatedDate = date.getDate() + " "  + months[date.getMonth()] + " " + date.getFullYear()
    }
    return formatedDate
}

function deleteIdbElement(idbTable, index, callback) {
    if (index < 0) {
        return;
    }
    idb.select(idbTable, function (isSelected, responseData) {
        if (isSelected) { 
            idb.delete(idbTable, responseData[index].ID, function() { return; });
            idb.select(idbTable, function (isSelected2, responseData2) {
                if (isSelected2) {
                    callback(responseData2)
                }
            });
        }
    }); 
}

function getEditElementIndex(id){
    var index = -1;
    var splits = id.split('-');
    if (splits.length > 1){
        index = parseInt(splits[1]);
    }
    return index;
}

$(document).ready(function () {
    var input_elements = $(".float-placeholder");
    for (var i = 0; i < input_elements.length; i++) {
        var placeholder_text = input_elements[i].placeholder;
        $(input_elements[i]).removeAttr('placeholder');
        $('<div class="input-label-focus">' + placeholder_text + '</div>').insertAfter(input_elements[i]);
    }
    $(".input-label").click(function () {
        $(this).prev().focus();
    });
});

function load_create_steps(STEPS_ARRAY, steps_id_str, container_id){
    var element_content = '<ul class="timeline">'
    for(var heading_index=0; heading_index < STEPS_ARRAY.length; heading_index++){
        if(heading_index == 0){
            element_content = element_content + '<li class="active">'
        }
        else{
            element_content = element_content + '<li>'
        }
        element_content = element_content + STEPS_ARRAY[heading_index].heading
        var action_points = STEPS_ARRAY[heading_index]["action-points"]
        for(var step_index=0; step_index < action_points.length; step_index++){
            if(heading_index == 0 && step_index == 0){
                element_content = element_content + '<span id="' + steps_id_str + action_points[step_index]["step"] + '" class="action-item-current">'+ action_points[step_index]["action-item-name"] +'</span>'
            }
            else{
                element_content = element_content + '<span id="' + steps_id_str + action_points[step_index]["step"] + '" class="action-item">'+ action_points[step_index]["action-item-name"] +'</span>'
            }
        }
        element_content = element_content + '</br></li>'
    }
    element_content = element_content + '</ul>'
    _(container_id).innerHTML = element_content
}

function generateTimeList(idStr){
    var timeStr = "";
    for(var ihour=0; ihour<24; ihour++){
        var time = "";
        if(ihour<10){
            time = "0"+ihour;
        }
        else{
            time = ihour;
        }
        timeStr += "<option value="+ time + ":00>" + time + ":00</option>";
        timeStr += "<option value="+ time + ":30>" + time + ":30</option>";
    }
    _(idStr).innerHTML = timeStr;
}

function GetFilename(url){
   if (url)
   {
      var m = url.toString().match(/.*\/(.+?)\./);
      if (m && m.length > 1)
      {
        var filename = m[1]
        var extStr = url.split(m[0])[1];
        var ext = extStr.split('?')[0];
        filename = filename + '.' + ext;
        if(filename.length > 9){
            filename = filename.substring(0,9) + "..."
        }
         return filename;
      }
   }
   return "";
}

function getFullFileName(fileUrl){
    if (typeof fileUrl == 'string'){
        return fileUrl.replace(/^.*(\\|\/|:)/, '');
    }
    return fileUrl;
}

function removeLogo(){
    var company_id = _("company_id").value
    if(company_id){
        $("#logo_file_size").html("Deleting...")
        $.ajax({
            url: '/company/' + company_id + '/delete_logo',
            type: "POST",
            data: {
                csrfmiddlewaretoken:$('input[name="csrfmiddlewaretoken"]').val(),
                company_id: company_id,
                competition_id: $("#competition_id").val()
            },
            success: function(data){
                if(data['success'])
                {
                    $("#remove_company_logo").hide();
                    _("company_logo_file").value="";
                    _("company_logo").src = "/static/img/Upload_Image.png";
                    _("logo_file_detail").innerHTML = "Upload Logo";
                    _("logo_file_size").innerHTML = "PNG/JPG/JPEG formats only";
                }
                else{
                    notify("Issue while deleting company logo", "warning")
                }
            },
            error: function(){
                notify("Unable to delete company logo, please try again", "warning")
            }
        })
    }
}

function convertUtcToLocalTime(utcDate, timeZone){
    var newLocalDate = new Date(utcDate);
    var timeOffset = timeZone.slice(1).split(':');
    var hours = 0;
    var mins = 0;
    if (timeOffset.length >= 2){
        hours = parseInt(timeOffset[0]);
        mins = parseInt(timeOffset[1]);
    }

    if (timeZone){
        if (timeZone[0] === '+'){
            newLocalDate.setHours(newLocalDate.getHours() + hours);
            newLocalDate.setMinutes(newLocalDate.getMinutes() + mins);
        }
        else if(timeZone[0] === '-'){
            newLocalDate.setHours(newLocalDate.getHours() - hours);
            newLocalDate.setMinutes(newLocalDate.getMinutes() - mins);
        }
        else{
            return false;
        }
    }
    return newLocalDate;
}

function refreshDatasetCache(){
    $.ajax({ 
      data: {},
      type: 'GET',
      url: '/dataset/refresh_dataset_cache',
      success: function() {
        // Do Nothing
      },
      error: function(data) {
        notify("Dataset cache could not be refreshed", "warning");
      }
    });
  }

function makeConfirmationRequest(context, redirectLocation, type=null, tempBtnText=null){
    var btnText = $("#confirmation_modal_submit_btn").val();
    $("#confirmation_modal_submit_btn").val(tempBtnText + "...");
    $("#confirmation_modal_error_text").hide();

    let formData = new FormData(context);
    $.ajax({
        url: $(context).attr('action'),
        data: formData,
        type: $(context).attr('method'),
        success: function(data){
            if(data.indexOf != undefined && data.indexOf('Error 404') !== -1){
                notify("Invalid request", "warning");
                location.href = '/login'
            }
            if(data['success'])
            {
                notify(data["message"], "success");
                $("#confirmation_modal_submit_btn").val(btnText);
                $("#confirmation_modal_error_text").hide();
                $("#confirmation_modal").modal('hide');
                window.location = redirectLocation;
            }
            else{
                $("#confirmation_modal_submit_btn").val(btnText);
                $("#confirmation_modal_error_text").html("<br/><li>" + data["message"] + " Try Again.</li>");
                $("#confirmation_modal_error_text").show();
            }
            },
            error: function(){
            $("#confirmation_modal").modal('hide');
            notify("Could not delete " + type, "warning")
            },
            cache: false,
            contentType: false,
            processData: false
    });
}

function checkforDatasetNDA(context, ndaId, datasetFilename, ndaTitle, ndaDescription){
    var urlStr = '';
    if (ndaId > 0){
        urlStr = '/dataset/check_for_nda';
        $.ajax({
        url: urlStr,
        type: "POST",
        data: {
            csrfmiddlewaretoken:$('input[name="csrfmiddlewaretoken"]').val(),
            nda_id: ndaId
        },
        success: function(data){
            if(data.indexOf != undefined && data.indexOf('Login | bitgrit') !== -1){
                notify("Invalid request", "warning");
                location.href = '/login'
            }
            if(data['success'])
            {   
                if(data['signed']){
                    urlStr = "/dataset/download_with_nda?dataset_filename="+ datasetFilename + "&nda=yes";
                    window.open(urlStr)
                }
                else{
                    _('nda_description_text').innerHTML = ndaDescription;
                    _('nda_title_text').innerHTML = ndaTitle;
                    $("#competition_dataset_nda_id").val(ndaId);
                    $("#competition_dataset_file_name").val(datasetFilename);
                    $("#dataset_nda_modal").modal('show');
                }
            }
            else{
                notify("Cannot download dataset.", "warning")
            }
        },
        error: function(){
            $("#dataset_nda_modal").modal('hide');
            notify("Could not get the NDA signed status", "warning")
        }
        })
    }
    else{
        urlStr = "/dataset/download_with_nda?dataset_filename="+ datasetFilename + "&nda=no";
        window.open(urlStr)
    }
}

function sanitize(inputString){
    if (typeof(inputString) === 'string'){
        return inputString.trim();
    }
    return inputString;
}

function deleteDataset(datasetFilename) {
    var url = "/dataset/delete";
    $.ajax({
      url: url,
      type: "POST",
      data: {
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
        file_name: datasetFilename
      },
      success: function (data) {
        onDeleteSuccess(data);
      },
      error: function () {
        notify("Unable to delete Dataset.", "warning");
      }
    });
}

function onDeleteSuccess(data) {
    if (data['success']) {
      notify(data['message'], "success");
      //Refresh the dataset redis cache
      refreshDatasetCache();
    }
    else {
      notify(data['message'], "warning");
    }
}

function setDatasetNdaText() {
    var ndaTitle = $("#dataset_nda_title").val();
    var ndaDescription = $("#dataset_nda_text").val();

    if (ndaDescription || ndaTitle) {
        $("#nda_text").html('This dataset has an NDA associated with it.<br/>Would you like to edit it?');
    }
    else {
        if (isDraftOrEdit()){
            $("#nda_text").html('No NDA used in this dataset.<br/>Do users need to sign an NDA in order to be able to use this dataset?');
        }
        else {
            $("#nda_text").html('Do users need to sign an NDA in order to be<br/>able to use this dataset?');
        }        
    }
}

function setDatasetCompetitionLinkText() {
    if ($("#linked_competitions li").length) {
        $("#link_competition_text").html('This dataset already has competition(s) linked to it.<br/>Would you like to edit them?');
    }
    else{
        if (isDraftOrEdit()) {
            $("#link_competition_text").html('No competition is linked to this dataset.<br/>Would you like to link it to a competition?');
        }
        else {
            $("#link_competition_text").html('Would you like to link this dataset<br/>to a competition?');
        }
    }
}

function setDatasetPrivacyText() {
    var privacyValue = $("#dataset_privacy_value").val();
    if (privacyValue === "public-read") {
      $("#privacy_text").html('<br/>This dataset is available for download on our<br/>datasets page, would you like to change it?');
    }
    else if (privacyValue === "private") {
      $("#privacy_text").html('<br/>This dataset is not available for download on our<br/>datasets page, would you like to change it?');
    }
    else {
      $("#privacy_text").html('<br/>Would you like to make this dataset downloadable<br/>on our datasets downloads page?');
    }
}

function datasetPrivacyNoBtnHandling(privacyValue) {
    if (privacyValue === "public-read") {
        $("#publish_privacy").html("Shared on our downloads page");
    }
    else if (privacyValue === "private") {
        $("#publish_privacy").html("Not shared on our downloads page");
    }
    else {
        $("#dataset_privacy_value").val("private");
        $("#publish_privacy").html("Not shared on our downloads page");
    }
}

function datasetPrivacyYesBtnHandling(privacyValue) {
    if (privacyValue === "public-read") {
        $("#dataset_privacy_value").val("private");
        $("#publish_privacy").html("Not shared on our downloads page");
    }
    else {
        $("#dataset_privacy_value").val("public-read");
        $("#publish_privacy").html("Shared on our downloads page");
    }
}

function removeDatasetEventListners(successHandler, progressHandler, errorHandler, abortHandler) {
    DATASET_AJAX_UPLOAD.upload.removeEventListener("progress", progressHandler, false);
    DATASET_AJAX_UPLOAD.removeEventListener("load", successHandler, false);
    DATASET_AJAX_UPLOAD.removeEventListener("error", errorHandler, false);
    DATASET_AJAX_UPLOAD.removeEventListener("abort", abortHandler, false);
}

function isDatasetDraftKeyPresent() {
    return $("#drafted_dataset_key").val() ? true : false;
}

function isDraftOrEdit() {
    var draftKey = location.href.split("draft/edit/")[1];
    var filename = location.href.split("filename=")[1];

    if (typeof draftKey !== 'undefined' || typeof filename !== 'undefined')
        return true;

    return false;
}

function changeCompanyLogo(){
    var currentImgSrc = document.getElementById('company_logo').src;
    var stringTokens = currentImgSrc.split('/');
    var imgName = stringTokens.slice(-1)[0];
    if (checkForDefaultLogoURL(currentImgSrc) || imgName == "Upload_Image.png"){
        // change the company logo
        var category = $("#company_industry").val();
        getCompanyLogoUrl(category);
    }
    
}

function getCompanyLogoUrl(category){
    var url = '/company/get_logo_url';
    $.ajax({
        url: url,
        type: "GET",
        data: {category: category},
        success: function(data){
            if(data['success'])
            {   
                $("#company_logo").attr('src', data['logo_url']);
                var filename = data['logo_filename'];
                if(filename.length > 9){
                    filename = filename.substring(0,9) + "..."
                }
                _("logo_file_detail").innerHTML = filename;
                formatCompanyLogoFileName(_("company_logo").src);
                $("#logo_file_size").hide();
                $("#company_logo_preview").attr('src', data['logo_url']);
            }
            else{
                notify("No Logo URL", "warning");
            }
        },
        error: function(){
            notify("Could not fetch company industry logo", "warning");
        }
    })
}

function checkForDefaultLogoURL(logoUrl) {
    var stringTokens = logoUrl.split('/');
    return (stringTokens.indexOf('industry_logo') > -1) && (stringTokens.indexOf('storage.googleapis.com') > -1);
}

function formatCompanyLogoFileName(logoUrl) {
    if (checkForDefaultLogoURL(logoUrl)) {
        $("#logo_file_detail").addClass('default-logo-filename');
    }
    else {
        $("#logo_file_detail").removeClass('default-logo-filename');
    }
}

function showCompanyLogoDeleteBtnForDrafts(logoUrl) {
    if (checkForDefaultLogoURL(logoUrl)) {
        $("#remove_company_logo").hide();
        $("#logo_file_size").hide();
    }
    else {
        $("#remove_company_logo").show(); 
    }
}

function validateERC20Address(walletAddress) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(walletAddress));
}

function storeWalletModalDisplayChoice() {
    $.ajax({
        url: '/user_profile/set_wallet_modal_display_choice',
        type: "POST",
        data: {
            csrfmiddlewaretoken:$('input[name="csrfmiddlewaretoken"]').val(),
        },
        success: function(data){
            if(data['success'])
            { 
                return true;
            }
            else{
                notify(data['message'], "warning")
            }
        },
        error: function(){
            notify("Error while updating session", "warning")
        }
    });
}

function uploadResume(form, successCallback, errorCallback){
    var formData = new FormData(form);
    $.ajax(
        {
            data: formData,
            type: $(form).attr('method'),
            url: $(form).attr('action'),
            success: function(response) {
                successCallback(response)
             },
            error: function (response) {
                errorCallback(response)
            },
            cache: false,       // required for file uploading
            contentType: false, // required for file uploading
            processData: false  // required for file uploading
        }
    );
}

function gotoStep(stepNumber){
    var previous = stepNumber - 1
    var next = stepNumber + 1
    if($("#list_item_" + previous).length != 0){
        $("#list_item_" + previous).removeAttr('class')
        $("#list_item_" + previous).addClass('visited')
    }
    if($("#list_item_" + next).length != 0){
        $("#list_item_" + next).removeAttr('class')
    }
    $("#list_item_" + stepNumber).removeAttr('class')
    $("#list_item_" + stepNumber).addClass('active')
}

function handleSubmissionLimitType(submissionLimitType){
    switch(submissionLimitType) {
        case SUBMISSIONS_LIMIT.infinite:
            $(".submission-perday-limit").hide();
            $(".submission-total-limit").hide();
            $('#submission_perday_limit').val('');
            $('#submission_total_limit').val('');
            break;

        case SUBMISSIONS_LIMIT.competitionEnds:
            $(".submission-perday-limit").hide();
            $(".submission-total-limit").show();
            $('#submission_perday_limit').val('');
            break;

        case SUBMISSIONS_LIMIT.perDay:
            $(".submission-total-limit").hide();
            $(".submission-perday-limit").show();
            $('#submission_total_limit').val('');
            break;

        case SUBMISSIONS_LIMIT.combined:
            $(".submission-perday-limit").show();
            $(".submission-total-limit").show();
            break;

        default:
            break;
    }
}
