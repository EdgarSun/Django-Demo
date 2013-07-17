from django.conf.urls.defaults import *

urlpatterns = patterns('tagging.views',

    #(r'^initialize_all/?$','general.initial_dev.initialize_all')
    (r'^add/?$','create_new_tag'),
    (r'^promote/?$','promote_tag'),
)