# Initialize App Engine and import the default settings (DB backend, etc.).
# If you want to use a different backend you have to remove all occurences
# of "djangoappengine" from this file.
from djangoappengine.settings_base import *

import datetime
import os

# Activate django-dbindexer for the default database
DATABASES['native'] = DATABASES['default']
DATABASES['default'] = {'ENGINE': 'dbindexer', 'TARGET': 'native'}
AUTOLOAD_SITECONF = 'indexes'

SECRET_KEY = 'T?F,YWcQ%+y[=`ZO>t$|bn[#!>@b~X2yt9BR6fYRH!gu*W]q6m'

INSTALLED_APPS = (
#    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'djangotoolbox',
    'autoload',
    'dbindexer',

    #-------OpenWebGL---------
    'django.contrib.staticfiles',
    'filetransfers',
    'google_dependency',
    'micronote',
    'showcase',
    'general',
    'account',
    'tagging',
    'event',
    'utils',
    'samples',
    #-------End----------
    
    # djangoappengine should come last, so it can override a few manage.py commands
    'djangoappengine',
)

MIDDLEWARE_CLASSES = (
    # This loads the index definitions, so it has to come first
    'autoload.middleware.AutoloadMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
)

#--------OpenWebGL
AUTHENTICATION_BACKENDS = (
    'account.backends.EmailAuthBackEnd',
    'django.contrib.auth.backends.ModelBackend',
)
#----------End-------

# This test runner captures stdout and associates tracebacks with their
# corresponding output. Helps a lot with print-debugging.
TEST_RUNNER = 'djangotoolbox.test.CapturingTestSuiteRunner'

ADMIN_MEDIA_PREFIX = '/media/admin/'
TEMPLATE_DIRS = (os.path.join(os.path.dirname(__file__), 'templates'),)

ROOT_URLCONF = 'urls'

#---------OpenWebGL--------
LOGIN_URL = '/account/login/'

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(os.path.dirname(__file__),'global_static')
STATICFILES_DIRS = (os.path.join(os.path.dirname(__file__),'static'),)

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(os.path.dirname(__file__),'media')

#Default Value
NO_RECORD_PUB_DATE = datetime.date(2011, 1, 12)
#Event Module
MEMCACHE_EVENTS = 'events'
MEMCACHE_COMMENTS = 'comments_'
GENERAL_RETRIEVE_COUNT = 8
COMMENT_RETRIEVE_COUNT = 5
SHOWCASE_RETRIEVE_COUNT = 10
#Choice
PLATFORM_CHOICES = (
    ('PC', 'pc'),
    ('LIN','linux'),
    ('MAC','mac'),
    ('IPA', 'ipad'),
    ('IPH', 'iphone'),
    ('AND', 'android'),
    ('DEF','the earth')
)

hostName = os.environ.get('HTTP_HOST','localhost')

if hostName.find('openwebgl') != -1:
    DEBUG = False 
else: 
    DEBUG = True 
    
AUTH_PROFILE_MODULE = "account.UserProfile"
#Upload file
APPEND_SLASH=False
#---------End---------
