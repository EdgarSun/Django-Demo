from django.conf.urls.defaults import *

urlpatterns = patterns('micronote.views',

    #(r'^initialize_all/?$','general.initial_dev.initialize_all')
    (r'^add/?$','create_new_micronote'),
    #(r'^retrieve/(?P<entity_id>\w+)$', 'retrieve_comment_list_JSON'),
    (r'^retrieve/entities/$', 'retrieve_comment_list_JSON'),
)