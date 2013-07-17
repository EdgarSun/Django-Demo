function AddMicronote(parentID,tag,content){
	url = '/micronote/add';
	data = {
		tag_verbose_name : tag,
		content : content,
		parent_id : parentID,
		parent_type : $("#comment-container-" + parentID).data('parentType')
	};
	var jqxhr = $.post(url, data, function(returnData, textStatus) {

		if(parentID != -1){
			//update comment count
			$('#event-comment-' + parentID).text(returnData.comment_count);
			events.each(function(event){
				if(event.get('id')==parentID){
					event.set({commentCount: returnData.comment_count});
				}
			});
			RetrieveComments(parentID);
		}
		else{
			RetrieveEventsByTag(ParseTagID(tag));
		}
	})
	.success(function(data) {
		$('#opensearch').val("");
		ShrinkSearchTextarea();
    		
    });
}
	
function RetrieveComments(parentID){
	var parent_div = $("#comment-container-" + parentID);
	var url = '/comment/retrieve/entities/';
	var collection = new EventStack($.global_configs.comment_collection[parentID.toString()]);
	var data = {
			'latest_sync_date' : GetLatestSyncDate(),
			'retrieve_page_index' : collection.page,
			'parent_id' : parentID,
			'parent_type' : $("#comment-container-" + parentID).data('parentType')
	};
	//show ajax-loader animation
	ToggleAjaxLoader(parent_div);
	$.getJSON(url,data,function(response) {
		//remove Ajax Loader element
		ToggleAjaxLoader(null);
		//if the response is null, the data will not be prepended to the existing event stack
		if(response.result.length !=0){
			
			//remove the same models in event collection
			collection.remove(response.result);
			var originalData = collection.toJSON();
			
			//Add retrieving data to the top of event collection
			collection = new EventStack(response.result);
			collection.maxDisplayItems = response.maxDisplayItems;
			collection.page = response.page;
			//Add the original data to the end of event collection
			if (originalData != [])
			{
				collection.add(originalData);
			}
			
			$.global_configs.comment_collection[parentID.toString()] = collection.toJSON();
			
			RenderCommentContents(collection,'#comment-container-' + parentID);
		}
	});
}
function RenderCommentContents(comments,parent_div){
	
	var start_index = (comments.page-1) * comments.maxDisplayItems;
	var end_index = comments.page * comments.maxDisplayItems;
	
	ResetCommentView(parent_div);
	comments.each(function(comment,num){
		if(num>=start_index && num<end_index){
			comment_div = WrapCommentWithHTML(comment);
			$(parent_div).append(comment_div);
			comment_div.fadeIn(300);
		}
		
	});
	//RenderCommentFooter();
}
function ResetCommentView(parent_div){

	$(parent_div + " .comment").each(function() {
		$(this).remove();
	});
}
function WrapCommentWithHTML(comment){
	var parentID = comment.get('id').toString();
	var base = $('<div>', {
		id: 'global-edge-container',
		class: 'comment clearfix',
		style: 'display: none;'
	});
	var event_article = $('<article>',{
		id: 'event',
		class: 'clearfix'
	});
	var avatar = $('<div>', {
		id: 'global-edge-container',
		class: 'comment-avatar',
		style: 'background: url(/media/images/users_avatar/' + comment.get('avatar') +'_25.jpg) no-repeat'
		//style: 'background: url(/media/images/users_avatar/' + event.get('avatar') +'_50.jpg) no-repeat'
	});
	var h1 = $('<h1>');
	
	var author = $('<a>', {
		class: 'r1',
		href: '#',
		html: comment.get('authorName')
	});
	
	var content = $('<p>', {
		html: comment.get('content')
	});
	UpdateWrappedUrlElementForContent(content);
	h1.append(author);
	h1.append(content);
	
	var h2 = $('<h2>',{
		html: comment.get('verbosePubDate') + ' via ' + comment.get('platform') 
	});
	
	var h3 = $('<h3>');
	var comment_button = $('<a>', {
		id: 'event-comment-' + parentID,
		class: 'inactive',
		href: '#',
		html: comment.get('commentCount') ==0? '':comment.get('commentCount')
	});
	comment_button.data("eventId", parentID);
	h3.append(comment_button);
	
	var comment_container = $('<article>',{
		id: 'comment-container-' + parentID,
		class: 'clearfix'
	});
	comment_container.data('parentType','micronote');
	
	event_article.append(avatar);
	event_article.append(h1);
	event_article.append(h2);
	event_article.append(h3);
	base.append(event_article);
	base.append(comment_container);
	
	BindCommentButtonEvent(comment_button,parentID); //defined in micronote.js
	
	return base;
}
function RenderCommentFooter(){
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
function BindCommentButtonEvent(comment_button,parentID){
	comment_button.bind('click', function() {

		if ($.global_configs.comment_collection[parentID.toString()] == 'undefined'){
			var collection = new EventStack;
			$.global_configs.comment_collection[parentID.toString()] = collection.toJSON();
			$.global_configs.comment_collection[parentID.toString()].parentID = parentID;
		}
		if ($.exists($('#comment-container-' + parentID + ' .event-comment-field'))) {
			$('#comment-container-' + parentID).html('');
			$.global_configs.comment_collection[parentID] == 'undefined';
		}
		else{
			GenerateCommentInputfield(parentID);//defined in micronote.js
			RetrieveComments(parentID);
		}
	});
}
function GenerateCommentInputfield(parentID){
	var input_field = $('<textarea>',{
		id: 'comment-field-' + parentID,
		class: 'event-comment-field',
		placeholder: 'press enter to submit comment',
	});
	$('#comment-container-' + parentID).append(input_field);
	
	input_field.bind('keypress', function(e) {
        if(e.keyCode==13){
        	AddMicronote(parentID,'comment',$(this).val());
        	$(this).val('');
        	$(this).blur();
        	e.preventDefault();
        }
        else if(event.keyCode ==32 ){
			ParseURLData($(this));
		}
	});
}

