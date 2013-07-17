from django.conf.urls.defaults import *

urlpatterns = patterns('showcase.views',

    (r'^editor/?$','create_showcase'),
    (r'^edit/?$','edit_showcase'),
    (r'^retrieve/?$','retrieve_showcase_list'),
    (r'^v/(?P<slug>.*)$','retrieve_showcase'),
    (r'^retrieve/matrix/?$','retrieve_showcase_matrix'),
)