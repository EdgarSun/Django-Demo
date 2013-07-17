$(document).ready(function() {
	m_showcase.defaults;
	InitialResourceData();
	InitialTagData();
	InitialLinkData();
	
	RenderResourceThumbnail(m_showcase.resource,false);
	RenderTag(m_showcase.tag_list,false);
	RenderLink(m_showcase.link_list,false);
});

function InitialResourceData(){
	m_showcase.resource = new Array();
	$("#id-image-container  .avatar").each(function(num) {
		m_showcase.resource[num] = $(this).val();
	});
}
function InitialTagData(){
	m_showcase.tag_list = new Array();
	$("#id-tags-list  .tag").each(function(num) {
		m_showcase.tag_list[num] = $(this).val();
	});
}
function InitialLinkData(){
	m_showcase.link_list = new Array();
	$("#id-links-list  .link").each(function(num) {
		m_showcase.link_list[num] = $(this).val();
	});
}
function RenderResourceThumbnail(resource_list,isEditMode){
	ResetImageResourceFields();
	for(var i=0;i<resource_list.length;){
		var avatar = $('<div>', {
			id: 'global-edge-container',
			class: 'avatar ui-draggable',
			style: 'opacity: 0.5;background:' + 'url(' + resource_list[i+2] + ') no-repeat'
		});
		avatar.data('image',resource_list[i+1]);
		avatar.data('imageId',resource_list[i]);
		if(isEditMode){
			var button = $('<div>', {
				id: 'id-close-button',
				text: 'x'
			});
			button.click(function(){
				DeleteResoruceEvent($(this),$(this).parent().data('imageId'));
			});
			avatar.append(button);
		}
		$('#id-image-container').append(avatar);
		BindThumbnailEvent();
		i = i+3;
	}
}
function RemoveTag(tag){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var tag_list = showcaseEntity.get('tag_list');
	var idx = tag_list.indexOf(tag); // Find the index
	if(idx!=-1){
		tag_list.splice(idx, 1); 
	}
	showcaseEntity.set({tag_list:tag_list});
	RenderTag(tag_list,true);
}
function RenderTag(tag_list,isEditMode){
	ResetTagsField();
	for(var i=0;i<tag_list.length;i++){
		var tag = $('<button>', {
			class: 'g2'
		});
		tag.data('tag',tag_list[i]);
		var label = $('<p>',{
			text: tag_list[i]
		});
		tag.append(label);
		if(isEditMode){
			var button = $('<div>', {
				id: 'id-close-button',
				text: 'x'
			});
			button.click(function(){
				RemoveTag($(this).parent().data('tag'));
			});
			tag.append(button);
		}

		
		$('#id-tags-list').append(tag);
	}
}
function RemoveLink(title,url){
	var showcaseEntity=showcaseStack.get($('#id-entity').val());
	var link_list = showcaseEntity.get('link_list');
	var idx = link_list.indexOf(title); // Find the index
	
	if(idx!=-1){
		link_list.splice(idx, 1); //remove title
	}
	var idx2 = link_list.indexOf(url); // Find the index
	if(idx2!=-1){
		link_list.splice(idx2, 1); //remove url
	}
	showcaseEntity.set({link_list:link_list});
	RenderLink(link_list,true);
}
function RenderLink(link_list,isEditMode){
	ResetLinksField();
	for(var i=0;i<link_list.length;){
		var base = $('<div>', {
			id: 'id-link-base',
			class: 'clearfix'
		});
		
		var link = $('<button>', {
			id: 'g5',
			class: 'g5'
		});
		var label = $('<p>',{
			text: link_list[i]
		});
		link.data('title',link_list[i]);
		link.data('url',link_list[i+1]);
		link.append(label);
		
		link.click(function(){
			window.open($(this).data('url'));
			return false;
		});
		
		if(isEditMode){
			var button = $('<div>', {
				id: 'id-close-button1',
				text: 'x'
			});
			button.click(function(){
				RemoveLink($(this).parent().data('title'),$(this).parent().data('url'));
			});
			link.append(button);
		}
		
		base.append(link);
		$('#id-links-list').append(base);
		i=i+2;
	}
}
function BindThumbnailEvent(){
	$("#id-image-container  .avatar").each(function() {
		$(this).bind('click', function() {
			var image = $(this).data('image');
			$('#id-image').css('background','url('+ $(this).data('image') +') no-repeat');
		});
		$(this).bind('mouseover', function() {
			$(this).css({ opacity: 1.0 });
		});
		$(this).bind('mouseout', function() {
			$(this).css({ opacity: 0.5 });
		});
	});
}
function ResetImageResourceFields(){
	$('#id-image-container').empty();
}
function ResetTagsField(){
	$('#id-tags-list').empty();
}
function ResetLinksField(){
	$('#id-links-list').empty();
}