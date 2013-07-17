from django.conf.urls.defaults import *

urlpatterns = patterns('samples.views',

    (r'^(?P<entity_id>\w+)$', 'render_sample_page'),
)