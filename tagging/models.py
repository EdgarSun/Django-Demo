from django.db import models

# Create your models here.
import datetime
from django.contrib.auth.models import User
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from tagging.utils import parse_tag_input

class Tag(models.Model):
    name = models.SlugField(max_length=50, unique=True)#db_index=True
    author = models.ForeignKey(User,null=True)
    verbosename = models.SlugField(_('tag name'), max_length=50, null=True,unique=True)#db_index=True
    associated_count = models.PositiveIntegerField(default=0)
    date_created = models.DateTimeField(_('date created'), default=datetime.datetime.now)
#    objects = TagManager()
    class Meta:
        ordering = ('name',)
        verbose_name = _('tag')

    def __unicode__(self):
        return self.name

class TaggedItem(models.Model):
    """
    Holds the relationship between a tag and the item being tagged.
    """
    tag = models.ForeignKey(Tag, verbose_name=_('tag'))# related_name='items'
    content_type = models.ForeignKey(ContentType, verbose_name=_('content type'))
    object_id = models.PositiveIntegerField(_('object id'))#db_index=True
    object = generic.GenericForeignKey('content_type', 'object_id')
    pub_date = models.DateTimeField(_('date created'), default=datetime.datetime.now)
    #objects = TaggedItemManager()

    class Meta:
        # Enforce unique tag association per object
        unique_together = (('tag', 'content_type', 'object_id'),)
        verbose_name = _('tagged item')

    def __unicode__(self):
        return u'%s [%s]' % (self.object, self.tag)
    
class PromotedTag(models.Model):
    tag = models.ForeignKey(Tag, verbose_name=_('tag'), unique=True)
    iscategory = models.BooleanField(default=False)
    orderid = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ('orderid',)
        verbose_name = _('promited tag')
    

