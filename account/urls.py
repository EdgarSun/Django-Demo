from django.conf.urls.defaults import *

urlpatterns = patterns('account.views',
    #(r'^$', 'list_greetings'),
    #(r'^sign$', 'create_greeting')
    (r'^register/?$', 'create_new_user'),
    (r'^login/(?P<mode>\w+)$', 'login_user'),
    (r'^login/?$', 'login_user'),
    (r'^logout/?$', 'logout_user'),
    (r'^deleteuser/(?P<userID>\w+)$', 'delete_user'),

)