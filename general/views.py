# Create your views here.
import os
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from tagging.models import PromotedTag

from django.views.generic.simple import direct_to_template
from event.views import retrieve_event_list
from settings import NO_RECORD_PUB_DATE
#import os
#os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'
#
#from google.appengine.dist import use_library
#use_library('django', '1.2')


import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

MEMCACHE_MICRONOTE = 'micronote'

@login_required
def render_generic_page(request):
    #greetings = cache.get(MEMCACHE_GREETINGS)
    #if greetings is None:
        #greetings = Greeting.objects.all().order_by('-date')[:10]
        #cache.add(MEMCACHE_GREETINGS, greetings)
    #logger.error('Something went wrong!')
    #promotedTags_count = len(PromotedTag.objects.filter(iscategory=False).all())
    #retrieve promoted tags
    promotedStarTags = PromotedTag.objects.filter(iscategory=False).order_by('orderid')[:3]
    promotedTags = PromotedTag.objects.filter(iscategory=False).order_by('orderid')[3:20]
    promotedCategoryTags = PromotedTag.objects.filter(iscategory=True).order_by('orderid')[:3]
    entirePromotedTags = PromotedTag.objects.filter(iscategory=False).order_by('orderid')
    
    #retrieve events
    #event_list,latest_event_pub_date = retrieve_event_list(request)
    #logger.debug(event_list.count())
    #logger.debug(latest_event_pub_date)

    return direct_to_template(request, 'generalPage.html',{
                                                       'promotedStarTags':promotedStarTags,
                                                       'promotedTags':promotedTags,
                                                       'promotedCategoryTags':promotedCategoryTags,
                                                       'entirePromotedTags':entirePromotedTags,
                                                       'isMicronoteValid':'true',
                                                       'latest_updated_entity_date':str(NO_RECORD_PUB_DATE),
                                                       'host_name':os.environ.get('HTTP_HOST','localhost')})