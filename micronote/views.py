# Create your views here.
import cgi
from django.contrib.auth.models import User
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from tagging.models import Tag
from tagging.models import TaggedItem
from tagging.views import create as CreateTag
from event.models import Event
from event.views import create_micronote_event as CREATE_M_EVENT
from micronote.models import Micronote
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from settings import NO_RECORD_PUB_DATE
from settings import MEMCACHE_COMMENTS
from settings import MEMCACHE_EVENTS
from settings import PLATFORM_CHOICES
from settings import COMMENT_RETRIEVE_COUNT
from utils.dateTime import pretty_date

import simplejson
import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

def create_new_micronote(request):
    if request.method == 'POST':
        micronote_content = cgi.escape(request.POST['content'])
        tag_verbost_name = request.POST['tag_verbose_name']
        parent_id = request.POST['parent_id']
        
        if parent_id != '-1': #Post a new comment to the specified micronote
            parent_type = request.POST['parent_type']
            if parent_type == 'event':
                parent_obj = Event.objects.get(id=parent_id)
            elif parent_type == 'micronote':
                parent_obj = Micronote.objects.get(id=parent_id)
            
            ctype = ContentType.objects.get_for_model(parent_obj)#Get parent content_type  content_type=ctype,object_id =instance.id
            
            micronote_obj = Micronote.objects.create(author=request.user,
                                                                    content=micronote_content,
                                                                    platform='DEF',
                                                                    parent_type=ctype,
                                                                    parent_id=parent_id)
            #Update comment count of parent object
            parent_obj.comment_count +=1
            parent_obj.save()
            
#            memcache_list_general_event_name = MEMCACHE_EVENTS +'_0'
#            memcache_list_name = MEMCACHE_EVENTS +'_' + str(parent_obj.tag_id)
#            cache.delete(memcache_list_general_event_name)
#            cache.delete(memcache_list_name)
            
            
            response_data = {
                 'id' : micronote_obj.id,
                 'comment_count' : parent_obj.comment_count
                 };
            logger.debug(str(parent_obj.comment_count) + '   new comment is created')
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")
            
        else: #Post a new micronote
            tag_obj,created = CreateTag(request,tag_verbost_name)
            #Create micronote entry
            micronote_obj,created = Micronote.objects.get_or_create(author=request.user,content=micronote_content,platform='DEF')
            
            #Relate new micronote and tag, 
            ctype = ContentType.objects.get_for_model(micronote_obj)
            taggedItem_obj, created = TaggedItem.objects.get_or_create(content_type=ctype,object_id =micronote_obj.id ,tag= tag_obj)
            
            CREATE_M_EVENT(request,micronote_obj,tag_obj)
            
            #Create event entry
            #event entry wil be created by signal mechanism
            response_data = None;
            response_data = {
                             'new_Micronote_id' : micronote_obj.id
                             };
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")

def retrieve_comment_list(request):
    parentID = int(request.GET['parent_id'],0)

    latest_sync_date = request.GET['latest_sync_date']
    page_index = int(request.GET['retrieve_page_index'])

    comment_list=[]
    #calculate record indexes
    endRecordIndex = page_index * COMMENT_RETRIEVE_COUNT
    startRecordIndex = endRecordIndex - COMMENT_RETRIEVE_COUNT
    
#    if latest_sync_date == str(NO_RECORD_PUB_DATE):

    comment_list = Micronote.objects.filter(parent_id=parentID).order_by('-pub_date')[startRecordIndex:endRecordIndex]
  
        
    return comment_list,startRecordIndex,endRecordIndex,page_index
    
def retrieve_comment_list_JSON(request):
    if request.method == "GET":

        comment_list,startRecordIndex,endRecordIndex,page_index = retrieve_comment_list(request)
        
        if comment_list == None or len(comment_list) == 0:
            response_data = {
                 'result' : []
                 };
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")
        else:
            comments = []
            for commentItem in comment_list:
                comment_dict = {
                                'index': 0,
                                'id': commentItem.id,
                                'authorName': commentItem.author.get_full_name(),
                                'avatar': commentItem.author.get_profile().avatar,
                                'authorID': commentItem.author.id,
                                'content': commentItem.content,
                                'pubDate': str(commentItem.pub_date),
                                'verbosePubDate':  pretty_date(commentItem.pub_date),
                                'tagID': 0,
                                'commentCount': commentItem.comment_count,
                                'platform' : "the earth"
                             };
                comments.append(comment_dict)
            response_data = {
                 'result' : comments,
                 'start_index' : startRecordIndex,
                 'end_index' : endRecordIndex,
                 'maxDisplayItems' : COMMENT_RETRIEVE_COUNT,
                 'page' : page_index
                 };
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")
#            return direct_to_template(request, 'event.html',{
#                                                         'entity_list':comment_list,
#                                                         'parent_id':entity_id,
#                                                         'latest_updated_comment_date':str(NO_RECORD_PUB_DATE),
#                                                         'latest_updated_entity_date':str(latest_entity_pub_date),
#                                                         'ignore_height':ignore_height,
#                                                         'is_initialization':isInitialization,
#                                                         'isComment':'True'})