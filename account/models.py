from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete
from django.dispatch import receiver

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

# Create your models here.
class UserProfile(models.Model):
    # This is the only required field
    user = models.ForeignKey(User, unique=True)

    # The rest is completely up to you...
    avatar = models.CharField(max_length=100,default='avatar')
    website = models.URLField(max_length=200, blank=True)
    localtion = models.CharField(max_length=100, blank=True)
    
#    postNum = models.IntegerField(initial=0)
#    favorite_tags = models.CharField(maxlength=100, blank=True)
    def __unicode__(self):  
        return _("%s's profile") % self.user


#signals
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    """Create a matching profile whenever a user object is created."""
    logger.debug('Create new profile:%s',instance.first_name)
    if created: 
        profile, new = UserProfile.objects.get_or_create(user=instance)
#signals
@receiver(pre_delete, sender=User)
def remove_profile(sender, instance,**kwargs):
    """Create a matching profile whenever a user object is created."""
    logger.debug('Delete profile:%s',instance.first_name)
    UserProfile.objects.get(user=instance).delete()