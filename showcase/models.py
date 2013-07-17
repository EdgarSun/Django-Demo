import datetime
from djangotoolbox.fields import ListField
from django.db import models
from google.appengine.ext.blobstore import blobstore
from django.contrib.auth.models import User
from utils.dateTime import pretty_date
from django.utils.translation import ugettext_lazy as _
import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

# Create your models here.
class Showcase(models.Model):
    # This is the only required field
    author = models.ForeignKey(User)
    spam = models.BooleanField(default=False)
    isPublished = models.BooleanField(default=False)
    isShader = models.BooleanField(default=False)
    isExternal = models.BooleanField(default=False) #content is provided by external channel
    content = models.CharField(max_length=100, blank=True)
    slugContent = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    resource = ListField(models.CharField(max_length=200),blank=True)
    #allow to assign multiple tags and custom tags
    tag_list = ListField(models.CharField(max_length=200),blank=True)
    link_list = ListField(models.CharField(max_length=200),blank=True)
    pub_date = models.DateTimeField(_('date created'), default=datetime.datetime.now)
    #blobstore.BlobReferenceProperty(verbose_name=_('image'), default=None)
#    def to_dict(self):
#        mainDict = dict([(p,unicode(getattr(self,p))) for p in self.])
#        dict2 = {'key' : unicode(self.key())}
#        dict3 = {'verbosePubDate' : pretty_date(self.pub_date)}
#        mainDict.update(dict2)
#        mainDict.update(dict3)
#        return mainDict
        