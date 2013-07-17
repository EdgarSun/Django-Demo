from django.conf.urls.defaults import *

urlpatterns = patterns('google_dependency.blobstore_handler',

    (r'^$', 'upload_handler'),
    (r'^(?P<pk>\d+)/(?P<entityID>\d+)$', 'upload_handler'),
    (r'^media/(?P<pk>\d+)$', 'retrieve_handler'),
    (r'^media/(?P<pk>\d+)/(?P<size>\d+)/(?P<crop>\d+)$', 'retrieve_handler'),
    (r'^delete/(?P<pk>\d+)/$', 'delete_handler'),
)