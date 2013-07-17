$(document).ready(function() {
	$('#id-accept-title').click(function() {
		CreateShowcase('new');
	});
	$('#id-create-showcase').click(function() {
		ResetShowcaseFields();
	});
	$('#id-save-button').click(function() {
		UpdateEntity();
	});
	$('#id-tag').bind('keypress', function(e) {
        if(e.keyCode==13){
        	if($(this).val().length <= 50){
        		AddNewTag($(this).val());
        		$(this).val('');
        	}
        	e.preventDefault();
        }
	});
	$('#id-link').bind('keypress', function(e) {
        if(e.keyCode==13){
        	if($(this).val().length > 0){
        		
        		var linkArray = ParseURLDataToArray($(this).val());
        		if(linkArray.length >1){
        			var urlContent = linkArray.pop();
        			AddNewLink(linkArray.join(' ').toString(),urlContent);
    	        	$(this).val('');
        		}
        	}
        	e.preventDefault();
        }
        else if(e.keyCode ==32 ){
			ParseURLData($(this));
        }

	});
	$('#id-category-button').click(function() {

		ChangeCategory();
	});
	$('#id-publish-button').click(function() {

		ChangePublishStates();
		RenderShowcaseContents();
	});
	RetrieveShowcase('Both');
	InitialDragableElements();
});
//Drag and Drop
function InitialDragableElements(){
	$( "#id-image-container" ).sortable({
        placeholder: 'thumbnail-placeholder',
	});

	$( "#id-image-container .avatar" ).disableSelection();
	
	//
	$('#id-image-container').bind('sortupdate', function(event,ui) {
		ResortResourceList();
	});
}

function ResortResourceList(){
	
	//Get original resource url list
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var resource_url_list = showcaseEntity.get('resource_url_list');
	var resource = new Array();
	$("#id-image-container  .avatar").each(function() {
		resource.push($(this).data('imageId'));
	});
	var new_resource_url_list = new Array();
	
	for(var entity in resource){
		for(var i=0;i<resource_url_list.length;){
			if(resource[entity] == resource_url_list[i]){
				new_resource_url_list.push(resource_url_list[i]);
				new_resource_url_list.push(resource_url_list[i+1]);
				new_resource_url_list.push(resource_url_list[i+2]);
				
				//Clear matched entities
				var removed = resource_url_list.splice(i, 3);
				break;
			}
			else{
				i = i+3;
			}
		}
	}
	//Save the last change to showcase entity
	showcaseEntity.set({resource_url_list:new_resource_url_list,resource:resource});

}
//Upload module
function GetUploadForm(){
	var url = '/resource/';
	var data = {
			'test' : 'uploadForm',
	};
	var jqxhr = $.get(url,data, function(response) {

		  $('#id-upload-container').empty().append( response );
		})
		.success(function() {

		})
		.error(function(response) {

		})
		.complete(function() {
			BindUploadEvent();
		});
}
function BindUploadEvent(){

	$('#id-upload-form').submit(function() { 
	    var options = { 
	    	resetForm: true,        // clear all form fields after successful submit
	    	success: UploadSuccess,
	    	data: { entityID: $('#id-entity').val(),dataType: 'image'}
	    }; 
	    $(this).ajaxSubmit(options);

	    return false;
	});

	$('[name=upload]').click(function(){
	    $('#id-upload-form').submit();
	});
}
function UploadSuccess(response,states){
	var upload_url = $(response).attr( 'action' );
	var pk = $(response).attr( 'pk' );
	var resource_url = $(response).attr( 'src' );
	var thumbnail_url = $(response).attr( 'thumbnail' );
	$('#id-upload-form').attr('action',upload_url);
	$('#id-image').css('background','url(' + resource_url +') no-repeat');
	$('#id-image').css('height','300');
	$('#id-image').empty();
	
	//------ Append new thumbnail image
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var resource_url_list = showcaseEntity.get('resource_url_list');
	//Update url_list
	var url_list_count = resource_url_list.length;
	resource_url_list[url_list_count] = pk;
	resource_url_list[url_list_count+1] = resource_url;
	resource_url_list[url_list_count+2] = thumbnail_url;
	//update resource pk
	var resource = showcaseEntity.get('resource');
	var count =  resource.length;
	resource[count] = pk;

	showcaseEntity.set({resource_url_list:resource_url_list,resource:resource});

	RenderResourceThumbnail(resource_url_list,true);
	InitialDragableElements();
	InitialMainResource(resource_url);
		
	UpdateEntity();
}
function DeleteResoruceEvent(owner,pk){

	var url = '/resource/delete/' + pk +'/';

	$.post(url,function(response,textStatus) {
		console.log(response);
		if(response.result == 'sucessed'){
			owner.parent().remove();
			RemoveResource(pk);
			UpdateEntity();
		}
	});
}
function RemoveResource(pk){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var resource_url_list = showcaseEntity.get('resource_url_list');
	var idx = resource_url_list.indexOf(pk); // Find the index
	if(idx!=-1){
		resource_url_list.splice(idx, 3);
	}
	showcaseEntity.set({resource_url_list:resource_url_list});
	
	var resource = showcaseEntity.get('resource');
	idx = resource.indexOf(pk); // Find the index
	if(idx!=-1){
		resource.splice(idx, 1);
	}
	showcaseEntity.set({resource:resource});
	InitialMainResource(resource_url_list[1]);
	RenderResourceThumbnail(resource_url_list,true);
}
// Publish
function ChangePublishStates(){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());

	if(showcaseEntity.get('isPublished') == true){
		showcaseEntity.set({isPublished:false});
		$('#id-publish-button').text('Publish');
	}
	else{
		showcaseEntity.set({isPublished:true});
		$('#id-publish-button').text('Unpublish');
	}
	UpdateEntity();
}
//Category
function ChangeCategory(){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());

	if(showcaseEntity.get('isExternal') == true){
		showcaseEntity.set({isExternal:false});
		$('#id-category-button').text('Indoor Demo');
	}
	else{
		showcaseEntity.set({isExternal:true});
		$('#id-category-button').text('External Demo');
	}
}
//Links
function AddNewLink(title,url){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var link_list = showcaseEntity.get('link_list');
	console.log(link_list);
	link_list.push(title);
	link_list.push(url);
	showcaseEntity.set({link_list:link_list});
	RenderLink(link_list,true); //showcase.js
}
//Tag

function AddNewTag(tag){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var tag_list = new Array();
	var tag_list = showcaseEntity.get('tag_list');
	
	console.log(tag_list);
	tag_list.push(tag);
	showcaseEntity.set({tag_list:tag_list});
	RenderTag(tag_list,true); //showcase.js
}

function UpdateEntity(){
	var entityID = $('#id-entity').val();
	var content = $('#id-content').val();
	var description = $('#id-description').val();
	
	//Update model to the collection in local
	var showcaseEntity=showcaseStack.get(entityID);

	showcaseEntity.set({content:content,description:description});
	
	UpdateEntityToServer(showcaseEntity);
	
	//update html element
	UpdateNavigatorHTMLContent(entityID,content);
}
function UpdateNavigatorHTMLContent(entityID,content){
	var elementClass = '.showcase' + entityID.toString();
	$(elementClass).children('h1').text(content);
}
function UpdateEntityToServer(showcaseEntity){
	var data = {
			'entityID' : showcaseEntity.id,
			'content' : showcaseEntity.get('content'),
			'description' : showcaseEntity.get('description'),
			'resource' : $.toJSON(showcaseEntity.get('resource')),
			'tag_list' : $.toJSON(showcaseEntity.get('tag_list')),
			'link_list' : $.toJSON(showcaseEntity.get('link_list')),
			'isExternal' : showcaseEntity.get('isExternal'),
			'isPublished' : showcaseEntity.get('isPublished'),
			'spam' : showcaseEntity.get('spam'),
	};

	var url = '/showcase/edit/';

	$.post(url,data,function(response,textStatus) {
		//console.log(response);
	});
}
function CreateShowcase(mode){
	url = '/showcase/editor';
	data = {
		'mode' : mode,
		'content' : $("#id-content").val()
	};
	//show ajax-loader animation
	ToggleAjaxLoader($("#id-accept-title"));
	var jqxhr = $.post(url, data, function(returnData, textStatus) {
		
		showcaseStack.add(returnData.result);
		var showcase = new Showcase(returnData.result);
		AddShowcaseEntityToNavigator(showcase,true);
		InitiaShowcaseEntity(showcase,returnData.entityID);
		GetUploadForm();
		
	})
	.success(function(data) {
		//remove Ajax Loader element
		ToggleAjaxLoader(null);
    });
}
function InitiaShowcaseEntity(showcaseEntity,entityID){
	//store entity id in form
	$('#id-entity').val(entityID);
	$('#id-slug').text('Slug: ' + showcaseEntity.get('slugContent'));
	ExpandShowcaseFields();
}

function RetrieveShowcase(mode){
	var url = '/showcase/retrieve';
	var modeList = new Array();
	switch(mode){
		case 'Both':
			modeList = [1,0];
			break;
		case 'Published':
			modeList = [1];
			break;
		default:
			modeList = [0];
		break;
	}
	
	var data = {
			'retrieve_page_index' : 1,
			'modeList' : $.toJSON(modeList),
	};
	$.getJSON(url,data,function(response) {
		
		if(response.published.length != 0 || response.unpublished.length != 0){
			showcaseStack.add(response.published);
			showcaseStack.add(response.unpublished)
			showcaseStack.maxDisplayItems = response.maxDisplayItems;
			showcaseStack.page = response.page;
		}
		if(response.published.length == 0){
			$('#id-published-section').hide();
		}
		if(response.unpublished.length == 0){
			$('#id-unpublished-section').hide();
		}
//		console.log(showcaseStack);
//		console.log(showcaseStack.pluck("pubDate"));
		RenderShowcaseContents();

	});
}
function RenderShowcaseContents(){
	var unpublished_parent_div = $("#id-unpublished-showcase-container");
	var published_parent_div = $("#id-published-showcase-container");
	
	ResetShowcaseSideView(unpublished_parent_div,published_parent_div);
	
	showcaseStack.each(function(showcase,num){
		AddShowcaseEntityToNavigator(showcase,false);
	});
	$('#id-published-count').text('-(' + published_parent_div.children().length.toString() +')');
	$('#id-unpublished-count').text('-(' + unpublished_parent_div.children().length.toString() +')');
	

}
function AddShowcaseEntityToNavigator(showcase,isPre){ //convert showcase model to html format
	var showcase_div = WrapShowcaseWithHTML(showcase);
	if(showcase.get('isPublished')){
		var publishedContainer = $("#id-published-showcase-container");
		$("#id-published-section").show();
		if(isPre == false){
			publishedContainer.append(showcase_div);
		}
		else{
			publishedContainer.prepend(showcase_div);
		}
		
		
	}
	else{
		var unpublishedContainer = $("#id-unpublished-showcase-container");
		$("#id-unpublished-section").show();
		if(isPre == false){
			unpublishedContainer.append(showcase_div);
		}
		else{
			unpublishedContainer.prepend(showcase_div);
		}
	}
}
function ResetShowcaseSideView(p1,p2){
	p1.html('');
	p2.html('');
}
function WrapShowcaseWithHTML(showcase){
	var parentID = showcase.get('id').toString();
	var base = $('<div>', {
		id: 'id-showcase-entity',
		class: 'showcase'+showcase.id.toString() + ' clearfix'
	});
	base.data('entityID',showcase.id.toString());
	
	var h1 = $('<h1>');
	h1.text(showcase.get('content'));
	var h2 = $('<h2>');
	h2.text('Delete');
	var h2_1 = $('<h2>');
	h2_1.text('Edit');
	var h2_2 = $('<h2>');
	h2_2.text('View');
	h2_2.data('url', showcase.get('slugContent'));
	
	base.append(h1);
	base.append(h2);
	base.append(h2_1);
	base.append(h2_2);

	h2.bind('click', function() {
		alert($(this).parent().data('entityID'));
	});
	h2_1.bind('click', function() {
		EditShowcase($(this).parent().data('entityID'));
	});
	h2_2.bind('click', function() {
		window.open('/showcase/v/' + $(this).data('url'));
		return false;
	});
	return base;
}
function EditShowcase(entityID){

	$('#id-entity').val(entityID);

	var showcaseEntity=showcaseStack.get(entityID); 
	$('#id-content').val(showcaseEntity.get('content'));
	$('#id-slug').text('Slug: ' + showcaseEntity.get('slugContent'));
	$('#id-description').val(showcaseEntity.get('description'));
	//tags
	var tagList = showcaseEntity.get('tag_list');
	RenderTag(tagList,true);
	//resources
	var resource_url_list = showcaseEntity.get('resource_url_list');
	if(resource_url_list.length >0){
		RenderResourceThumbnail(resource_url_list,true);
		InitialMainResource(resource_url_list[1]);
	}

	
	//links
	var linkList = showcaseEntity.get('link_list');
	RenderLink(linkList,true);
	
	//category button
	var isExternal = showcaseEntity.get('isExternal');
	if(isExternal == true){
		$('#id-category-button').text('External Demo')
	}
	else{
		$('#id-category-button').text('Indoor Demo')
	}
	//publish button
	var isPublished = showcaseEntity.get('isPublished');
	if(isPublished == true){
		$('#id-publish-button').text('Unpublish')
	}
	else{
		$('#id-publish-button').text('Publish')
	}
	
	ExpandShowcaseFields();
	GetUploadForm();
}
function InitialMainResource(resourceEntity){
	$('#id-image').css('background','url(' + resourceEntity +') no-repeat');
	$('#id-image').empty();
}
function InitializeImageResource(pk){
	var avatar = $('<div>', {
		id: 'global-edge-container',
		class: 'avatar',
		style: 'opacity: 0.5;background:' + 'url(/resource/media/'+pk +'/50/1) no-repeat'
	});
	avatar.data('image','/resource/media/'+pk);
	avatar.data('imageId',pk);
	$('#id-image-container').append(avatar);
	BindThumbnailEvent();
	
}
function ExpandShowcaseFields(){
	$('#id-accept-title').hide();
	$('#id-main-content').show();
	$('#id-command-container').show();
}
function ResetShowcaseFields(){
	
	$('#id-accept-title').show();
	$('#id-main-content').hide();
	$('#id-command-container').hide();
	//reset data
	$('#id-entity').val('');
	$('#id-content').val('');
	$('#id-description').val('');
	$('#id-slug').text('Slug: null');
	//reset button label
	$('#id-publish-button').text('Publish');
	$('#id-category-button').text('External Demo');
	
	//reset image background
	$('#id-image').css('background','');
	
	ResetImageResourceFields();
	ResetTagsField();
}

