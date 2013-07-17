from django.db import models

# Create your models here.
import datetime
from django.core.cache import cache
from django.contrib.contenttypes import generic
from django.db.models import signals
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _
#Below are list of registered models
from tagging.models import TaggedItem

from settings import MEMCACHE_EVENTS

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

class Event(models.Model):

    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    pub_date = models.DateTimeField(_('date created'), default=datetime.datetime.now)
    object = generic.GenericForeignKey('content_type', 'object_id')
    #the tag of event is unique, doesn't allow to link multiple tags
    tag_id = models.PositiveIntegerField(default=0)
    
    spam = models.BooleanField(default=False)
    comment_count = models.PositiveIntegerField(default = 0)

    class Meta:
        verbose_name = _('Event')
        get_latest_by = "pub_date"
        #ordering = ('-pub_date',)

    def __unicode__(self):

        return self.content_type.name
#signals
@receiver(post_save, sender=Event)
def create_event(sender, instance, created, **kwargs):
    if created:
        logger.debug('Created new event successfully')
        #Detele existing event memcache when appending new event into datastore
        if str(instance) != 'micronote':
            logger.debug(str('Cleaned event memcache (exclude micrnote'))
            cache.delete(MEMCACHE_EVENTS)

