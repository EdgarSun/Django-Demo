$(document).ready(function() {
			// Initialize micronote data
			
			RetrieveEvents();
			// Behaviour
			$('#micronote-earlierNotes').click(function(){
				RetrieveEarlierEvents();
			});
			$('#micronote-getLatest').click(function() {
				RetrieveEvents();
			});
			
			$('#opensearch').keyup(function(event) {
				var nomalizedStr = jQuery.trim($(this).val());
				var contentArray = nomalizedStr.split(' ');

				ParseURLData(contentArray);
				togglePreviewForm(contentArray);
				// calculate content length
			});
			$('#account_btn').click(function() {
				ShowTaggingMenu('Account_menu',$(this));
			});
			// Retrieve micronote by tag
			$("#micronote-tags button").each(function() {
				$(this).bind('click', function() {
					if($(this).data('tag-id') == -1){
						ShowTaggingMenu('Retrieve_Micronote',$(this)); //33: the position of popup menu should be under the "more" button
					}
					else{
					RetrieveEventsByTag($(this).data('tag-id'));
					}
				});
			});
			
			// Submission
			$("#preview-form-tagging-menu button").each(function() {
				$(this).bind('click', function() {
					mode = $(this).data('mode');
					tag_id = $(this).data('tag-id');
					if(mode == 'add'){
						SubmitMicronote($(this));
					}
					else if(mode == 'retrieve'){
						$.global_configs.micronote_fully_load=true;
						RetrieveEventsByTag(tag_id);
					}
					else if(mode == 'account'){
						//nothing
						switch(tag_id){
							case 0:

								break;
							case 1:
								$(location).attr('href','/account/logout/');
								break;
							default:
								break;
						}
					}
				});
			});
			$('#addMicronoteButton').click(function() {

				var micronote_content = jQuery.trim($('#opensearch').val())
				if (micronote_content.length > 0) {
					ShowTaggingMenu('Add_Micronote',$(this));
				}
			});
			$('#searchButton').click(function() {

				alert($('#opensearch').rows);
			});
			//Previewform and tagging menu
			$('#preview-form-micronote').hover(function(){ 
				$.global_configs.preview_form_micronote_mousehover = true;
		    }, function(){ 
		    	$.global_configs.preview_form_micronote_mousehover = false;
		    });
			$('#preview-form-tagging-menu').hover(function(){ 
				$.global_configs.preview_form_tagging_menu_mousehover = true;
		    }, function(){ 
		    	$.global_configs.preview_form_tagging_menu_mousehover = false;
		    });
		});
$(document).mouseup(function(e) {
	if(!$.global_configs.preview_form_micronote_mousehover){
		HideHeaderPreviewForm();
	}
	if(!$.global_configs.preview_form_tagging_menu_mousehover){
		HideHeaderTaggingMenu();
	}
});
function togglePreviewForm(contentArray){
	var _showPreviewFormCriticalPoint = 8;
	var len = contentArray.length;
	if (len > _showPreviewFormCriticalPoint) {
//		ShowHeaderPreviewForm();
//		UpdatePreViewFormContent(contentArray);
//		UpdatePreViewLengthNum();
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
function RetrieveEventsByTag(tagID){
	$.global_configs.micronote_retrieve_tag_id = tagID;
	
	ResetMicronoteView();
	RetrieveEvents();
	HideHeaderTaggingMenu();
	HideMicronoteFooter();
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
	    	console.log('expand');
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
function HideHeaderPreviewForm() {
	$('#preview-form-micronote').hide('fast');
}
function ShowHeaderPreviewForm() {
	$('#preview-form-micronote').show('fast');
}
function HideHeaderTaggingMenu() {
	$('#preview-form-tagging-menu').hide('fast');
}
function ShowTaggingMenu(mode,owner) {
	ResetMenuComponents();
	
	var offset = owner.offset();
	
	if(mode=='Add_Micronote'){
		//Position
		$('#preview-form-tagging-menu').css('left',offset.left);
		$('#preview-form-tagging-menu').css('top',offset.top+25);
		$('#post-micronote-id').show();
		
		if($.global_configs.micronote_comments_expanded_id != 0){
			console.log($.global_configs.micronote_comments_expanded_id);
			$('#post-comment-content').text($.global_configs.comments_parameters.shortCut + '...');
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
function RetrieveComments(){ //parent,entity_id,entity_type,mode,shortCut
	// detect if the new event entry is ready for retrieving
	var latest_entity_pub_date_static = $.global_configs.comments_parameters.owner.data('latest-updated-comment-date');
	var comment_field ='#comments-'+$.global_configs.comments_parameters.entity_id;
	url = '/comment/retrieve/'+$.global_configs.comments_parameters.entity_id;
	data = {
			'entity_mode':$.global_configs.comments_parameters.mode,
			'latest_updated_comment_date' : latest_entity_pub_date_static
	};
	
	//Clean the previous comments
	if($.global_configs.comments_parameters.isStartup == true){
		$(comment_field).html('');
		$(comment_field).hide();
	}
	
	//show ajax-loader animation
	ToggleAjaxLoader(comment_field);
	//UpdateMicronoteViewHeight();
	
	$.get(url,data,function(data){
		
		//display "arrow" elements around comment container
		ShowArrowElements($(comment_field),parseInt($.global_configs.comments_parameters.owner.text()));
		
		if($.global_configs.comments_parameters.mode=='event'){
			if($.global_configs.comments_parameters.isStartup == true){
				ResetCommentViewHeight();
			}
			$("#micronote-comments-id").html(data);
			$("#micronote-comments-view-id").prependTo($(comment_field));
		}
		else{
			$(data).prependTo($(comment_field));
		}
		$(comment_field).delay(200).fadeIn("slow",Comments_loaded);
	})
	.complete(function(){
		$('#retrieving-event-states').remove();
	});
	
}
function Comments_loaded(){
	ToggleAjaxLoader(null);
	BindCommentEvent();
}
function BindCommentEvent(){
	$("#micronote-comments-id .micronote-comment").each(function() {
		//Wrap URL elements
		UpdateWrappedUrlElementForContent($(this).children('#micronote').children('h1').children('p'));
		BindCommentClickEvent($(this));
	});
	
	UpdateCommentViewHeight();
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
function ClearnArrowElements(){
	$('#up-arrow').remove();
	$('#down-arrow').remove();
}
function ShowArrowElements(comment_container,comment_count){
	ClearnArrowElements();
	if(comment_count>$.global_configs.max_comment_display_count){
		var upArrow= $('<div>', {
			id: 'up-arrow',
			class : 'arrow'
		});
		var downArrow= $('<div>', {
			id: 'down-arrow',
			class : 'arrow flip-vertical'
		});
		upArrow.insertBefore(comment_container);
		downArrow.insertAfter(comment_container);
	}
}

function ResetCommentView(){
	$.global_configs.micronote_comments_expanded_id = 0;
	$('#micronote-comments-id ').html('');
	$('#micronote-comments-view-id').insertAfter('#micronote-container-id');
	$('#micronote-comments-view-id').height(0);
}
function ResetMicronoteView(){
	$.global_configs.micronote_page_index = 1;
	ResetCommentView();
	//reset position of  micronote view 
	$("#micronote-container-id").scrollview("scrollTo", 0,0, 0);
	$('#micronote-content-id').html('');
	$('#micronote-page-id').data('latest-updated-entity-date',$.global_configs.latest_event_updated_date);
}
function RetrieveEarlierEvents(){
	$.global_configs.micronote_page_index = $.global_configs.micronote_page_index +1;
	console.log($.global_configs.micronote_page_index);
	url = '/event/retrieve/entries/';
	data = {
			'retrieve_page_index' : $.global_configs.micronote_page_index,
			'tag_filter' : $.global_configs.micronote_retrieve_tag_id
	};
	//show ajax-loader animation
	ToggleAjaxLoader($("#micronote-container-id"));
	$.get(url,data,function(data) {
		//remove Ajax Loader element
		ToggleAjaxLoader(null);
		//if the response is null, the data will not be prepended to the existing event stack
		if(data!='null'){
			//Append new event items to micronote page
			$(data).appendTo("#micronote-content-id");
			
			var is_null_response = $('#retrieving-event-states').data('is-null');
			if(is_null_response ==false){
				//bind event handler to new items
				$("#micronote-content-id .micronote").each(function() {
					var mode = $(this).children('#micronote').children('h3').children('a').data('mode');
					if( mode == 'event'){
						
						//Wrap URL elements
						UpdateWrappedUrlElementForContent($(this).children('#micronote').children('h1').children('p'));
						
						//show micronote message without slideDown animation when retrieving earlier records
						$(this).show(0,Events_loaded);
						
						//bind comment events 
						BindCommentClickEvent($(this));
						//End - bind events
					}
				});
			}
		}
	})
	.complete(function(){
		var newScrollPostion = $('#micronote-content-id').height()-$('#micronote-container-id').height();
		$("#micronote-container-id").scrollview("scrollTo", 0,newScrollPostion, 1000);
	});
}
function RetrieveEvents() {
	// detect if the new event entry is ready for retrieving
	var latest_entity_pub_date_static = $('#micronote-page-id').data('latest-updated-entity-date');
	//var retrieve_page_index = $('#micronote-page-id').data('retrieve-page-index');
	url = '/event/retrieve/entries/';
	data = {
			'latest_updated_entity_date' : latest_entity_pub_date_static,
			'retrieve_page_index' : 1,
			'tag_filter' : $.global_configs.micronote_retrieve_tag_id
	};
	
	//show ajax-loader animation
	ToggleAjaxLoader($("#micronote-container-id"));
	
	$.get(url,data,function(data) {
		//remove Ajax Loader element
		ToggleAjaxLoader(null);
		//if the response is null, the data will not be prepended to the existing event stack
		if(data!='null'){
			//Append new event items to micronote page
			$(data).prependTo("#micronote-content-id");
			
			var is_null_response = $('#retrieving-event-states').data('is-null');
			if(is_null_response ==false){
				//Save the latest updated date to micronote page element
				var latest_updated_event_date = $('#retrieving-event-states').data('latest-updated-entity-date');
				$('#micronote-page-id').data('latest-updated-entity-date',latest_updated_event_date);
	
				//bind event handler to new items
				$("#micronote-content-id .micronote").each(function() {
					var mode = $(this).children('#micronote').children('h3').children('a').data('mode');
					if( mode == 'event'){
						
						//Wrap URL elements
						UpdateWrappedUrlElementForContent($(this).children('#micronote').children('h1').children('p'));
						
						//show micronote message without slideDown animation when initializing content first time.
						if($.global_configs.micronote_fully_load==true){
							$(this).show(0,Events_loaded);
						}
						else{
							CleanNullResponseElement($(this).next());
							$(this).slideDown(150,Events_loaded);
						}
						
						//bind comment events 
						BindCommentClickEvent($(this));
						//End - bind events
					}
				});
			}
			//immediately update micronote view height when getting new content
			UpdateMicronoteViewHeight();
		}
	})
	.complete(function(){
		if ($.exists($('#retrieving-event-states'))) { 
			$('#retrieving-event-states').remove();
		}
	});
}
function Events_loaded(){
	ToggleAjaxLoader(null);
	UpdateMicronoteViewHeight();
}
function CleanNullResponseElement(owner){
	if(owner.data('is-null') == true){
		owner.remove();
	}
}
function BindCommentClickEvent(root){
		//root.children('#micronote').children('h3').children('a').unbind('click'); //Remove all existing "click" event of comment item
		root.children('#micronote').children('h3').children('a').bind('click', function() {
			if(detectExpandedEntity($(this))){
				
				$.global_configs.comments_parameters = {
						isStartup: true,
						owner : $(this),
						entity_id : $(this).data("entity-id"),
						entity_type : $(this).data("entity-type"),
						mode : $(this).data('mode'),
						parent : $(this).parent().parent(),
						shortCut : GetShortCutOfExpandedPost($(this).parent().parent().children('h1').children('p').text())
				};
				RetrieveComments();
			}
		});
}
function detectExpandedEntity(owner){
	if($.global_configs.micronote_comments_expanded_id == owner.data('entity-id')){
		return false;
	}
	else{
		$.global_configs.micronote_comments_expanded_id = owner.data('entity-id');
		return true;
	}
}
function UpdateMicronoteViewHeight(){
	//Make proper height of micronote view
	var maxDisplayedItem = 8;
	UpdateViewHeight($(".micronote-view-v"),$("#micronote-content-id .micronote"),9,maxDisplayedItem);
	ShowMicronoteFooter();
}
function ShowMicronoteFooter(){
	$('#micronote-footer').slideDown(200);
}
function HideMicronoteFooter(){
	$('#micronote-footer').hide();
}
function ResetCommentViewHeight(){
	$(".micronote-comments-view-v").height(0);
}
function UpdateCommentViewHeight(){
	//Make proper height of comment view
	var maxDisplayedItem = $.global_configs.max_comment_display_count;
	UpdateViewHeight($(".micronote-comments-view-v"),$("#micronote-comments-id .micronote-comment"),11,maxDisplayedItem); //micronote-comment-weight: The comment item will be used to calculate comment view height
	UpdateMicronoteViewHeight();
}
function UpdateViewHeight(container,item,height_offset,maxCount)
{
	//Make proper height of micronote view
	var count = 0;
	var height = 0;
	item.each(function() {
		if(count<maxCount){
			if($(this).data('ignore-height') != 'True'){ //the elements with "ignore-height" data will not be used to calculate micronote view height
				height =height + $(this).height() + height_offset;
				count++;
			}
			
		}
	});
	container.height(height);
	//end
}
function GetShortCutOfExpandedPost(content){
	var limitedLength = 50;
	if(content.length > limitedLength){
		return content.substring(0,limitedLength);
	}
	else{
		return content;
	}
}

function SubmitMicronote(tagItem) {
	var micronote_content = jQuery.trim($('#opensearch').val());
	var tagContext = '';
	var tagID = tagItem.data('tag-id');
	if(tagID==-1){ //" -1 " : comment submission
		tagContext = 'comment'; //Post a new Comment to the specified event
	}
	else{
		tagContext = tagItem.text(); //Post a new Micronote
	}
	
	url = '/micronote/add';
	data = {
		tag_verbose_name : tagContext,
		content : micronote_content,
		entity_id : $.global_configs.micronote_comments_expanded_id //Only available for comment item
	};
	
	var jqxhr = $.post(url, data, function(returnData, textStatus) {
		// Clear the value of the global search field
		$('#opensearch').val("");
		// Reset search textarea size
		ShrinkSearchTextarea();
		
		// if new comment was added, the comment count of parent will be updated
		if(tagID==-1){
			if(returnData.comment_count !=0){
				var expandedItem = '#micronote-viewcomment-' + $.global_configs.micronote_comments_expanded_id;
				$(expandedItem).text(returnData.comment_count);
			}
		}
		
    })
    .success(function(data) {
    	if(tagID==-1){
    		$.global_configs.comments_parameters.isStartup = false;
    		RetrieveComments();
    	}
    	else{
    		
    		if(tagID != $.global_configs.micronote_retrieve_tag_id){
    			$.global_configs.micronote_fully_load=true; // fully retrieve the specified tag without
    			RetrieveEventsByTag(tagID);
    		}
    		else{
    			$.global_configs.micronote_fully_load=false;
    			RetrieveEvents(); 
    		}
    	}
    })
    .error(function() {
    	console.log('Failed to create micronote ')
    })
    .complete(function() {
    	
    });
	
	HideHeaderTaggingMenu();
}
function ParseURLData(contentArray){
	var urlContent = contentArray.pop();
	if (ValidateUrl(urlContent) && !VerifyShortenerUrl(urlContent)) {
		// Check Fetching URLShortener status
		if($('#preview-form-micronote').data('isProcessing') == false){
			// Locked fetching URLShortener status
			$('#preview-form-micronote').data('isProcessing',true);
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
					$('#opensearch').val(_content);
					togglePreviewForm(contentArray);
					//Finished fetching urlShortener
					$('#preview-form-micronote').data('isProcessing',false);
				}
			});
		}
	}
	else{
		contentArray.push(urlContent);
	}
	// limit the text length of input field
	SetInputMaxLength();
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
function ValidateUrl(url){
	var reg = new RegExp('[a-zA-z]+://[^\s]*');
	if(reg.test(url)) {
		return true;
	}
	return false; 
}
function VerifyShortenerUrl(url){
	if(url.length <=20){
		return true;
	}
	return false;
}
function UpdateWrappedUrlElementForContent(owner){
	//Wrap URL elements
	var content = owner.html();
	if(content!=null){
		var contentArray = jQuery.trim(content).split(' ');
		contentArray = WrapUrlElement(contentArray);
		var wrappedContent = contentArray.join(' ').toString() + " ";
		owner.html(wrappedContent);
	}
}
function WrapUrlElement(contentArray){
	var newContentArray = new Array()
	$.each(contentArray, function(key, value) {
		var index = value.toLowerCase().indexOf('http');
		if (index == 0) {
			value = "<a class=r2 href=\"" + value + "\" >" + value + "</a>"
		}
		newContentArray[key] = value;
	});
	return newContentArray;
}
function UpdatePreViewLengthNum() {
	$('.length').text(jQuery.trim($('#opensearch').val()).length.toString());
}
function UpdatePreViewFormContent(contentArray) {
	var previewContentArray = WrapUrlElement(contentArray);
	if ($.exists($('#preview-content'))) {
		$('#preview-content').html(previewContentArray.join(' ').toString());
	} else {
		var previewContent = $('<p>', {
			id : 'preview-content',
			html : previewContentArray.join(' ').toString()
		});
		$('#preview-form-micronote').append(previewContent);
	}
}
function SetInputMaxLength() {
	var len = jQuery.trim($('#opensearch').val()).length;

	if (len >= $.global_configs.global_input_max_length) {
		$('#opensearch').attr('maxlength', $.global_configs.global_input_max_length);
	} else {
		$('#opensearch').removeAttr("maxlength");
	}
}