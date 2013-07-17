import cgi
from google.appengine.api import blobstore
from django.template.defaultfilters import slugify
from django.views.generic.simple import direct_to_template
from django.http import HttpResponse
from django.http import HttpResponseNotFound 
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from showcase.models import Showcase
from tagging.views import create as CreateTag
from tagging.models import TaggedItem
from google.appengine.ext import db
from settings import SHOWCASE_RETRIEVE_COUNT
from utils.dateTime import pretty_date
from utils.views import ParseBool
from google_dependency.blobstore_handler import generate_resource_URL
import simplejson
import logging
import matrix
# Get an instance of a logger
logger = logging.getLogger(__name__)


def create_showcase(request):
    
    param = {}
    if request.method == 'POST':
        mode = request.POST['mode']
        if mode == "new":
            content_text = cgi.escape(request.POST['content'])
            showcaseItem = Showcase.objects.create(author=request.user,
                                                                    content=content_text,slugContent = slugify(content_text))
            showcase_dict = convert_showcase_to_dict(request,showcaseItem)
            param = {
                     'result' : showcase_dict,
                     'entityID' : showcaseItem.id
                     }
        return HttpResponse(simplejson.dumps(param), mimetype="application/json")
    elif request.method == 'GET':
        param["upload_url"] = blobstore.create_upload_url('/upload')

        return direct_to_template(request, 'showcase_editor.html',param)

def edit_showcase(request):
    if request.method=='POST':
        param = {}

        entity_id = request.POST.get('entityID','0')
        content = cgi.escape(request.POST.get('content','undefined'))
        description = cgi.escape(request.POST.get('description','undefined'))
        resource = simplejson.loads(request.POST.get('resource',{}))
        tag_list = simplejson.loads(request.POST.get('tag_list',{}))
        link_list = simplejson.loads(request.POST.get('link_list',{}))
        isExternal = ParseBool(request.POST.get('isExternal',False))
        isPublished = ParseBool(request.POST.get('isPublished',False))
        isShader = ParseBool(request.POST.get('isShader',False))
        spam = ParseBool(request.POST.get('spam',False))
        logger.debug(link_list)
        try:
            showcase_obj = Showcase.objects.get(id=entity_id)
        except Showcase.DoesNotExist:
            showcase_obj = None
        if showcase_obj != None:

            showcase_obj.content = content
            showcase_obj.slugContent = slugify(content)
            showcase_obj.description = description
            showcase_obj.spam = spam
            showcase_obj.isShader = isShader
            showcase_obj.isExternal = isExternal
            showcase_obj.isPublished = isPublished
            if len(link_list) !=0 and link_list != 'None':
                showcase_obj.link_list = link_list
            if len(resource) != 0 and resource != 'None':
                showcase_obj.resource = resource
            if len(tag_list) != 0 and tag_list != 'None':
                showcase_obj.tag_list = tag_list
                for tag in tag_list:
                    tag_obj,created = CreateTag(request,tag)
                    #Relate new showcase and tag, 
                    ctype = ContentType.objects.get_for_model(showcase_obj)
                    taggedItem_obj, created = TaggedItem.objects.get_or_create(content_type=ctype,object_id =showcase_obj.id ,tag= tag_obj)
            showcase_obj.save()
            
            param['result'] = 'saved successfully'
        else:
            param['result'] = 'matching query does not exist';
        
        return HttpResponse(simplejson.dumps(param), mimetype="application/json")

def retrieve_showcase_list(request):
    if request.method=='GET':
        page_index = int(request.GET.get('retrieve_page_index',1))
        showcase_retrieve_count = int(request.GET.get('retrieve_count',SHOWCASE_RETRIEVE_COUNT))
        isLimitedAuthor = bool(int(request.GET.get('isLimitedAuthor',1)))
        #mode_list: [1,0] -> retrieving both published and unpublished showcase items
        mode_list = request.GET.get('modeList',[])
        logger.debug(mode_list)
        if len(mode_list) != 0:
            mode_list = simplejson.loads(mode_list)
        else:
            mode_list = [1]

        publishedShowcaseEntities = []
        unpublishedShowcaseEntities = []
        for mode in mode_list:
            isPublished = bool(mode)
            logger.debug(bool(isLimitedAuthor))
            if isLimitedAuthor:
                showcase_list = Showcase.objects.filter(author=request.user,isPublished=isPublished).order_by('-pub_date')[0:showcase_retrieve_count]
            else:
                showcase_list = Showcase.objects.filter(isPublished=isPublished).order_by('-pub_date')[0:showcase_retrieve_count]
            
            for showcaseItem in showcase_list:
                showcase_dict = convert_showcase_to_dict(request,showcaseItem)
                if isPublished:
                    publishedShowcaseEntities.append(showcase_dict)
                else:
                    unpublishedShowcaseEntities.append(showcase_dict)

        param={
               'published' : publishedShowcaseEntities,
               'unpublished' : unpublishedShowcaseEntities,
               'maxDisplayItems' : SHOWCASE_RETRIEVE_COUNT,
               'page' : page_index
               }
        return HttpResponse(simplejson.dumps(param), mimetype="application/json")
def convert_showcase_to_dict(request,showcaseItem):
        showcase_dict = {
                  'id' : showcaseItem.id,
                  'author' : showcaseItem.author.get_full_name(),
                  'authorID' : showcaseItem.author.id,
                  'content' : showcaseItem.content,
                  'slugContent' : showcaseItem.slugContent,
                  'description' : showcaseItem.description,
                  'resource' : showcaseItem.resource,
                  'resource_url_list' : generate_resource_url_list(request,showcaseItem.resource),
                  'isPublished' : showcaseItem.isPublished,
                  'isExternal' : showcaseItem.isExternal,
                  'spam' : showcaseItem.spam,
                  'isShader' : showcaseItem.isShader,
                  'tag_list' : showcaseItem.tag_list,
                  'link_list' : showcaseItem.link_list,
                  'verbosePubDate' : pretty_date(showcaseItem.pub_date),
                  'pub_date' : str(showcaseItem.pub_date)
                  }
        return showcase_dict
def retrieve_showcase_matrix(request): #the matrix will be used by the showcase canvas on general page
    if request.method=='GET':
        param={
               'result' : matrix.list[2]
               }
        return HttpResponse(simplejson.dumps(param), mimetype="application/json")
def retrieve_showcase(request,slug):
    if request.method=='GET':
        showcase_list = Showcase.objects.filter(slugContent=slug)
        if showcase_list != None and len(showcase_list) != 0:
            showcase_list[0].resource = generate_resource_url_list(request,showcase_list[0].resource)
            param = {
                     'showcase' : showcase_list[0]
                     }
            return direct_to_template(request, 'showcase.html',param)
        else:
            return direct_to_template(request, '404.html',{})
def generate_resource_url_list(request,resource):
    resource_list = []
    for pk in resource:
        resource_list.append(pk)
        resource_list.append(generate_resource_URL(request,pk,'440','0'))
        resource_list.append(generate_resource_URL(request,pk,'50','1'))
    return resource_list