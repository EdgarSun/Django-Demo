$.global_configs = { 
	preview_form_micronote_mousehover:false,
	preview_form_tagging_menu_mousehover:false,
	global_input_max_length:140,
	event_filter_id : 0,
	comment_collection : {}
};
$(document).ready(function() {
	
	$('#opensearch').keyup(function(event) {
		if(event.keyCode ==32 ){
			ParseURLData($(this));
			// limit the text length of input field
			SetInputMaxLength($(this));
			ToggleOpenSearchFieldHeight($(this));
		}
	});
	$('#opensearch').focus(function(event) {
		ToggleOpenSearchFieldHeight($(this));
	});
	$('#opensearch').focusout(function(event) {
		ToggleOpenSearchFieldHeight($(this));
	});
	$('#logout_btn').click(function() {
	    window.location.href = '/account/logout/';
	    return false;
	});
	$('#login_btn').click(function() {
	    window.location.href = '/account/login/';
	    return false;
	});
	
	$('#opensearch').focus(function() {
	    $('#searchform').css ('background-color','#e6e6e6');
	    $(this).css ('background-color','#e6e6e6');
	    $(this).css ('color','#333');
	});
	$('#opensearch').blur(function() {
	    $('#searchform').css ('background-color','#555');
	    $(this).css ('background-color','#555');
	    $(this).css ('color','#CCC');
	});
	
	BindAddMicronoteButton();
	BindAccountSettingButton();
	BindTagMenuItemActiveEvents();
	
	//Custom Jquery functions
	jQuery.exists = function(selector) {return ($(selector).length > 0);}

	//preload images
    if (document.images)
    {
      preload_image_object = new Image();
      // set image url
      image_url = new Array();
      image_url[0] = "/media/images/ajax-loader.gif";
      image_url[1] = "/media/images/arrow_grey_001.png";
       var i = 0;
       for(i=0; i<=1; i++){
    	   preload_image_object.src = image_url[i];
       }
    }
});
$(document).mouseup(function(e) {
	if(!$.global_configs.preview_form_tagging_menu_mousehover){
		HideHeaderTaggingMenu();
	}
});
function HideHeaderTaggingMenu() {
	$('#preview-form-tagging-menu').hide('fast');
}
//$(document).mouseup(function() {
//	
//});
function BindTagMenuItemActiveEvents(){
	// open search submission
	$("#preview-form-tagging-menu button").each(function() {
		$(this).bind('click', function() {
			mode = $(this).data('mode');
			tag_id = $(this).data('tagId');
			if(mode == 'add'){
				//SubmitMicronote($(this));
				AddMicronote(-1,$(this).text(),jQuery.trim($('#opensearch').val()));
			}
			else if(mode == 'retrieve'){
				RetrieveEventsByTag($(this).data('tagFilter'));
				console.log('RetrieveEventsByTag();');
			}
			else if(mode == 'account'){
				//nothing
				switch(tag_id){
					case 0:

						break;
					case 1:
						$(location).attr('href','/account/logout/');
						break;
					case 2:
						$(location).attr('href','/showcase/editor/');
					default:
						break;
				}
			}
		});
	});
}
function BindAccountSettingButton(){
	$('#account_btn').click(function() {
		ShowTaggingMenu('Account_menu',$(this));
	});
}
function BindMouseOver(){
	$('#preview-form-tagging-menu').hover(function(){ 
		$.global_configs.preview_form_tagging_menu_mousehover = true;
    }, function(){ 
    	$.global_configs.preview_form_tagging_menu_mousehover = false;
    });
}
function BindAddMicronoteButton(){
	$('#addMicronoteButton').click(function() {

		var micronote_content = jQuery.trim($('#opensearch').val())
		if (micronote_content.length > 0) {
			ShowTaggingMenu('Add_Micronote',$(this));
		}
	});
}
function ParseTagID(tag){
	var tagid = '';
	$("#preview-form-tagging-menu button").each(function() {
		
		if($(this).text() == tag){
			tagid = $(this).data('tagId');
			return false; 
		}
	});
	return tagid;
}
function ShowTaggingMenu(mode,owner) {
	ResetMenuComponents();
	
	var offset = owner.offset();
	
	if(mode=='Add_Micronote'){
		//Position
		$('#preview-form-tagging-menu').css('left',offset.left);
		$('#preview-form-tagging-menu').css('top',offset.top+25);
		$('#post-micronote-id').show();
		
		if(false){
			
			//$('#post-comment-content').text($.global_configs.comments_parameters.shortCut + '...');
			$('#post-comment-id').show()
		}
	}
	else if(mode=='Retrieve_Micronote'){
		//Position
		$('#preview-form-tagging-menu').css('left',offset.left);
		$('#preview-form-tagging-menu').css('top',offset.top+33);
		
		$('#retrieve-micronote-id').show();
	}
	else if(mode=='Account_menu'){
		$('#preview-form-tagging-menu').css('left',offset.left+20);
		$('#preview-form-tagging-menu').css('top',offset.top+25);
		
		$('#account-id').show();
	}
	$('#preview-form-tagging-menu').slideDown('fast');
	
}
function ResetMenuComponents(){
	$('#preview-form-tagging-menu').hide();
	$('#post-micronote-id').hide();
	$('#retrieve-micronote-id').hide();
	$('#post-comment-id').hide();
	$('#account-id').hide();
}
function ToggleAjaxLoader(parent){
	if ($.exists($('#ajax-loader'))) { 
		$('#ajax-loader').remove();
	}
	else{
		var ajax_loader= $('<div>', {
			id: 'ajax-loader'
		});
		ajax_loader.insertBefore(parent);
	}
}
function ParseURLDataToArray(contentStr){
	var contentArray = jQuery.trim(contentStr).split(' ');
	var urlContent = contentArray.pop();
	if (ValidateUrl(urlContent)) {
		// slice "text" prefix, if exists, it will be appended to content array
		var prefixAndUrlArray = CleanAndParseExtraContentPrefixForURL(urlContent);
		if(prefixAndUrlArray.length == 2){
			contentArray.push(prefixAndUrlArray[0]);
			urlContent = prefixAndUrlArray[1];
		}
		else{
			urlContent = prefixAndUrlArray[0];
		}
		contentArray.push(urlContent);
		if(contentArray.length >1){
			return contentArray;
		}
	}
	
	return new Array();
}
function ParseURLData(owner){
	var contentArray = jQuery.trim(owner.val()).split(' ');
	var urlContent = contentArray.pop();
	if (ValidateShortenerUrl(urlContent)) {
		
		owner.attr('readonly','readonly');
		// slice "text" prefix, if exists, it will be appended to content array
		var prefixAndUrlArray = CleanAndParseExtraContentPrefixForURL(urlContent);
		if(prefixAndUrlArray.length == 2){
			contentArray.push(prefixAndUrlArray[0]);
			urlContent = prefixAndUrlArray[1];
		}
		else{
			urlContent = prefixAndUrlArray[0];
		}
		// generate shortenerURL
		// initialize parameter
		url = "/urlshortener/" + urlContent;
		$.post(url, function(returnData, textStatus) {
			if (textStatus == "success") {
				contentArray.push(returnData.shortUrl);
				var _content = contentArray.join(' ').toString() + " ";
				owner.val(_content);
				//reset textarea readonly attr
				
				owner.attr('readonly',false);
				//togglePreviewForm(contentArray);

			}
		})
		.complete(function() {

		});

	}
	
}
function CleanAndParseExtraContentPrefixForURL(url){
	var result=[];
	var urlStartPosition = url.toLowerCase().indexOf('http');
	if(urlStartPosition==0){
		result = [url];
	}
	else{
		var prefix = url.slice(0, urlStartPosition);
		url = url.substr(urlStartPosition, url.length - 1);
		result=[prefix,url];
	}
	return result;
}
function SetInputMaxLength(owner) {
	var len = jQuery.trim(owner.val()).length;

	if (len >= $.global_configs.global_input_max_length) {
		owner.attr('maxlength', $.global_configs.global_input_max_length);
	} else {
		owner.removeAttr("maxlength");
	}
}
function ToggleOpenSearchFieldHeight(owner){
	var nomalizedStr = jQuery.trim(owner.val());
	var contentArray = nomalizedStr.split(' ');
	var _showPreviewFormCriticalPoint = 4;
	var len = contentArray.length;
	if (len > _showPreviewFormCriticalPoint) {
		if($('#opensearch').height() <=16){
			ExpandSearchTextarea();
		}
	} else {
//		HideHeaderPreviewForm();
		if($('#opensearch').height() >16){
			ShrinkSearchTextarea();
		}
	}
}
function ExpandSearchTextarea(){
	$('#opensearch').animate({
	    height:'96px',
	  }, {
	    duration: 300,
	    specialEasing: {
	      height: 'linear'
	    },
	    complete: function() {
	    }
	  });
}
function ShrinkSearchTextarea(){
	$('#opensearch').animate({
	    height:'16px',
	  }, {
	    duration: 300,
	    specialEasing: {
	      height: 'linear'
	    },
	    complete: function() {

	    }
	  });
}
function ValidateUrl(url){
	var reg = new RegExp('[a-zA-z]+://[^\s]*');
	if(reg.test(url)) {
		return true;
	}
	return false; 
}
function ValidateShortenerUrl(url){
	var reg = new RegExp('[a-zA-z]+://[^\s]*');
	if(reg.test(url)) {
		if(url.length >20){
			return true;
		}
		else{
			return false;
		}
	}
	return false; 
}
function countLines(theArea){
	  var theLines = theArea.val().replace((new RegExp(".{"+theArea.cols+"}","g")),"\n").split("\n");
	  if(theLines[theLines.length-1]=="") theLines.length--;
	  console.log(theLines.length);
	  console.log(theLines);
}
