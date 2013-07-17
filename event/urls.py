from django.conf.urls.defaults import *

urlpatterns = patterns('event.views',
    (r'^retrieve/entities/$', 'retrieve_event_list_with_JSON'),
)