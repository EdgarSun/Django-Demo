import datetime
from django.db import models
from django.contrib.auth.models import User
from tagging.models import TaggedItem
from django.contrib.contenttypes.models import ContentType
from event.models import Event
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _
from django.core.cache import cache
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from settings import MEMCACHE_COMMENTS
from settings import MEMCACHE_EVENTS
from settings import PLATFORM_CHOICES

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

# Create your models here.
class Micronote(models.Model):
    # This is the only required field
    author = models.ForeignKey(User)
    spam = models.BooleanField(default=False)
    content = models.CharField(default='live for fun',max_length = 240)
    platform = models.CharField(default='via web',max_length = 3, choices=PLATFORM_CHOICES)
    pub_date = models.DateTimeField(_('date created'), default=datetime.datetime.now)
    
    parent_type = models.ForeignKey(ContentType,null=True)
    parent_id = models.PositiveIntegerField(default=0)
    parent = generic.GenericForeignKey('parent_type', 'parent_id')
    
    #it's no longer to use
    comment_count = models.PositiveIntegerField(default = 0)
    
    def __unicode__(self):
        if self.parent != None:
            return "comment"
        else:
            return _("%s's micronote") % self.author

#signals
#@receiver(post_save, sender=Micronote)
#def create_micronote_event(sender, instance, created, **kwargs):
#    if created and instance.parent==None: #instance.parent=None : micronote is comment type
#        ctype = ContentType.objects.get_for_model(instance)
#        event, created = Event.objects.get_or_create(content_type=ctype,object_id =instance.id)
#        logger.debug(str('Cleaned micrnote memcache'))
#        cache.delete(MEMCACHE_EVENTS)