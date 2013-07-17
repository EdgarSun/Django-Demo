# Create your views here.
import datetime
import simplejson

from event.models import Event
from django.http import HttpResponse
from django.core.cache import cache
from django.contrib.contenttypes.models import ContentType
from django.views.generic.simple import direct_to_template
from settings import NO_RECORD_PUB_DATE
from settings import MEMCACHE_EVENTS
from settings import GENERAL_RETRIEVE_COUNT
from utils.models import DUMPS
from utils.dateTime import pretty_date

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

#INITIAL_RETRIEVE_COUNT = 16


def create_micronote_event(request,instance,tag):
   # if created: # and instance.parent==None: #instance.parent=None : micronote is not a comment type
    ctype = ContentType.objects.get_for_model(instance)
    event, created = Event.objects.get_or_create(content_type=ctype,object_id =instance.id,tag_id=tag.id)
    cache.delete(MEMCACHE_EVENTS +'_' + str(tag.id))
    
    if  cache.get(MEMCACHE_EVENTS) != None:
        cache.delete(MEMCACHE_EVENTS)
    if  cache.get(MEMCACHE_EVENTS + '_0') != None:
        cache.delete(MEMCACHE_EVENTS + '_0')
        
    logger.debug(str('Cleaned micrnote memcache'))
        
def retrieve_event_list(request):
    
    page_index = int(request.GET.get('retrieve_page_index',1))
    tag_id = request.GET.get('tag_filter','0')
    latest_sync_date = request.GET.get('latest_sync_date',str(NO_RECORD_PUB_DATE))

    #Initialize data
    event_list=[]
    
    # Retrieve event list from memcache
    memcache_list_name = MEMCACHE_EVENTS +'_' + tag_id
    
    #calculate record indexes
    endRecordIndex = page_index * GENERAL_RETRIEVE_COUNT
    startRecordIndex = endRecordIndex - GENERAL_RETRIEVE_COUNT
    
    if page_index==1:
        if latest_sync_date == str(NO_RECORD_PUB_DATE): 
            cache.delete(memcache_list_name)
            event_list = cache.get(memcache_list_name)
    # if event memcache is null, retrieve event list from datastore and update list to memcache
    if event_list == None or len(event_list) == 0:
        logger.debug('Reload from datastore')
        if tag_id == '0':
            event_list = Event.objects.filter(spam=False).order_by('-pub_date')[startRecordIndex:endRecordIndex]
            #logger.debug(event_list[0].object.content)
            logger.debug('retrieve without tag filter')
        else:
            event_list = Event.objects.filter(tag_id=tag_id,spam=False).order_by('-pub_date')[startRecordIndex:endRecordIndex]

        #keep a copy of queries in memcache to enhance retrieving performance
        if event_list != None and len(event_list) != 0:
            cache.add(memcache_list_name, event_list)
    else:
        logger.debug('Reload from memcache')
    return event_list,startRecordIndex,endRecordIndex,page_index

def retrieve_event_list_with_JSON(request):
    if request.method == "GET":
        
        event_list,start_index,end_index,page_index = retrieve_event_list(request)

        if event_list == None or len(event_list) == 0:
            response_data = {
                 'result' : []
                 };
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")

        else:
            events = []
            for eventItem in event_list:
                event_dict = {
                                'index': 0,
                                'id': eventItem.id,
                                'authorName': eventItem.object.author.get_full_name(),
                                'avatar': eventItem.object.author.get_profile().avatar,
                                'authorID': eventItem.object.author.id,
                                'content': eventItem.object.content,
                                'pubDate': str(eventItem.object.pub_date),
                                'verbosePubDate':  pretty_date(eventItem.object.pub_date),
                                'tagID': eventItem.tag_id,
                                'commentCount': eventItem.comment_count,
                                'platform' : "the earth"
                             }
                events.append(event_dict)
            response_data = {
                 'result' : events,
                 'start_index' : start_index,
                 'end_index' : end_index,
                 'maxDisplayItems' : GENERAL_RETRIEVE_COUNT,
                 'page' : page_index
                 };
            return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")
            #return HttpResponse(DUMPS(events), mimetype="application/json")
#            return direct_to_template(request, 'event_json.html',{
#                                                         'entity_list':event_list,
#                                                         'latest_updated_entity_date':str(latest_entity_pub_date),
#                                                         'atest_updated_comment_date':str(NO_RECORD_PUB_DATE),
#                                                         'is_null':'false'
#                                                         })

