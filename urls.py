from django.conf.urls.defaults import *
from django.conf import settings

handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',
    ('^_ah/warmup$', 'djangoappengine.views.warmup'),
#    ('^$', 'django.views.generic.simple.direct_to_template',
#     {'template': 'home.html'}),
    (r'^media/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.MEDIA_ROOT}), # static content
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.STATIC_ROOT}), # static content
    (r'^$', 'general.views.render_generic_page'),
    (r'^urlshortener/(?P<url>.*)$', 'utils.shortenerUrl.generate_shortener_url'),

    (r'^micronote/', include('micronote.urls')),
    (r'^comment/', include('micronote.urls')),
    (r'^account/', include('account.urls')),
    (r'^general/', include('general.urls')),
    (r'^tag/', include('tagging.urls')),
    (r'^event/', include('event.urls')),
    (r'^showcase/', include('showcase.urls')),
    (r'^upload/', include('google_dependency.urls')),
    (r'^resource/', include('google_dependency.urls')),
    (r'^samples/', include('samples.urls')),
    

        
    #(r'^admin/', include(admin.site.urls)),
    #favicon
    (r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/images/favicon.ico'}),
    (r'^favicon\.png$', 'django.views.generic.simple.redirect_to', {'url': '/static/images/favicon.png'}),
)
