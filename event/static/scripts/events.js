$(document).ready(function() {
	RetrieveEvents();
	BindEventTagButtons();

});



function BindMouseOver(){
	$('#preview-form-tagging-menu').hover(function(){ 
		$.global_configs.preview_form_tagging_menu_mousehover = true;
    }, function(){ 
    	$.global_configs.preview_form_tagging_menu_mousehover = false;
    });
}

function BindEventTagButtons(){
	$("#event-tags button").each(function() {
		$(this).bind('click', function() {
			if($(this).data('tagFilter') == -1){
				ShowTaggingMenu('Retrieve_Micronote',$(this)); //33: the position of popup menu should be under the "more" button
			}
			else{
				RetrieveEventsByTag($(this).data('tagFilter'));
			}
		});
	});
}
function RetrieveEventsByTag(tagFilter){
	
	if(tagFilter==events.tagFilter){
		events.page = 1;
	}
	else{
		events.refresh();
		events.tagFilter = tagFilter;
		
	}
	RetrieveEvents();
}
function RetrieveEvents(){
	var parent_div = $("#event-container-id");
	var url = '/event/retrieve/entities/';
	var data = {
			'latest_sync_date' : GetLatestSyncDate(),
			'retrieve_page_index' : events.page,
			'tag_filter' : events.tagFilter
	};
	//show ajax-loader animation
	ToggleAjaxLoader(parent_div);
	$.getJSON(url,data,function(response) {
		//remove Ajax Loader element
		ToggleAjaxLoader(null);
		//if the response is null, the data will not be prepended to the existing event stack
		if(response.result.length !=0){
			//remove the same models in event collection
			var newData;
			var tagFilter = events.tagFilter;
			if(response.start_index==0){

				events.remove(response.result);
				newData = events.toJSON();
				//Add retrieving data to the top of event collection
				events = new EventStack(response.result);
			}
			else{
				newData = response.result
			}
			
			events.maxDisplayItems = response.maxDisplayItems;
			events.page = response.page;
			
			events.add(newData);
			//reassign event tag filter;
			events.tagFilter = tagFilter;
			
			RenderEventContents();
		}
		else{
			console.log(response.result);
		}
	});
}
function RenderEventContents(){
	var parent_div = $("#event-container-id");
	var start_index = (events.page-1) * events.maxDisplayItems;
	var end_index = events.page * events.maxDisplayItems;
	
	ResetEventView(parent_div);
	events.each(function(event,num){
		if(num>=start_index && num<end_index){
			event_div = WrapEventWithHTML(event);
			parent_div.append(event_div);
			event_div.fadeIn(300);
		}
	});
	RenderEventFooter();
}

function ChangedEventPage(){
	if(events.page<=events.pageTotal){
		RenderEventContents();
	}
	else{
		RetrieveEvents();
	}
}
function NextEventPage(){
	events.page += 1;
	ChangedEventPage();
}
function EventPage(index){
	events.page = index;
	ChangedEventPage();
}

function WrapEventWithHTML(event){

	var parentID = event.get('id').toString();
	var base = $('<div>', {
		id: 'global-edge-container',
		class: 'event clearfix',
		style: 'display: none;'
	});
	var event_article = $('<article>',{
		id: 'event',
		class: 'clearfix'
	});
	var avatar = $('<div>', {
		id: 'global-edge-container',
		class: 'avatar',
		style: 'background: url(/media/images/users_avatar/' + event.get('avatar') +'_50.jpg) no-repeat'
		//style: 'background: url(/media/images/users_avatar/' + event.get('avatar') +'_50.jpg) no-repeat'
	});
	var h1 = $('<h1>');
	
	var author = $('<a>', {
		class: 'r1',
		href: '#',
		html: event.get('authorName')
	});
	
	var content = $('<p>', {
		html: event.get('content')
	});
	UpdateWrappedUrlElementForContent(content);
	h1.append(author);
	h1.append(content);
	
	var h2 = $('<h2>',{
		html: event.get('verbosePubDate') + ' via ' + event.get('platform') 
	});
	
	var h3 = $('<h3>');
	var comment_button = $('<a>', {
		id: 'event-comment-' + parentID,
		class: 'inactive',
		href: '#',
		html: event.get('commentCount') ==0? '':event.get('commentCount')
	});
	comment_button.data("eventId", parentID);
	h3.append(comment_button);
	
	var comment_container = $('<article>',{
		id: 'comment-container-' + parentID,
		class: 'clearfix'
	});
	comment_container.data('parentType','event');
	
	event_article.append(avatar);
	event_article.append(h1);
	event_article.append(h2);
	event_article.append(h3);
	base.append(event_article);
	base.append(comment_container);
	
	//bind events
	BindCommentButtonEvent(comment_button,parentID); //defined in micronote.js

	
	return base;
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
function RenderEventFooter(){
	var pageIndex = $('<nav>', {
		class: 'global-nav'
	});
	for(var i=1;i<=events.pageTotal;i++){
		var status = i==events.page? 'g1' : 'g0';
		var button = $('<button>', {
			id: 'event-page-' + i.toString(),
			class: status,
			href: '#',
			
			html: i.toString()
		});
		button.data('page',i);
		pageIndex.append(button);
		
		button.bind('click', function() {
			EventPage($(this).data('page'));
		});
	}
	$('#event-footer-id').append(pageIndex);
}

function ResetEventView(owner){
	$("#event-container-id").html('');
	$("#event-footer-id").html('');
}
function GetLatestSyncDate(){
	var eventLength = events.length;
	if(eventLength == 0){
		return null;
	}
	else{
		var latestEventItem = events.at(eventLength-1);
		return latestEventItem.get('pubDate');
	}
}
function UpdateViewHeight(container,item,height_offset,maxCount)
{
	//Make proper height of micronote view
	var height = 0;
	item.each(function(num) {
		if(num<maxCount){
			height =height + $(this).height() + height_offset;
		}
	});
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