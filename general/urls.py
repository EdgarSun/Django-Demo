from django.conf.urls.defaults import *

urlpatterns = patterns('general.initial_dev',

    #(r'^initialize_all/?$','general.initial_dev.initialize_all')
    (r'^initialize_account/?$','initialize_account'),
    (r'^initialize_tag/?$','initialize_tagging'),
    (r'^initialize_promoted_tags/?$','initialize_promoted_taggings'),
    (r'^initialize_events/?$','initialize_events')
)