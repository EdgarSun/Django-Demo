"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from django.contrib.auth.models import User
from tagging.forms import CreateTagForm as TaggingCreationForm
from account.forms import ExtendedUserCreationForm as AccountCreationForm
from django.test import TestCase
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from tagging.models import Tag
from tagging.models import TaggedItem
from tagging.models import PromotedTag
from micronote.models import Micronote
from event.models import Event
from django.contrib.contenttypes.models import ContentType
from event.views import create_micronote_event as CREATE_M_EVENT

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)

def initialize_account(request):
    user01 = {'password1': '123', 'first_name': 'Edgar', 'last_name': 'Sun', 'email': 'test01@gmail.com', 'password2': '123'}
    user02 = {'password1': '123', 'first_name': 'Kar', 'last_name': 'Kar', 'email': 'test02@gmail.com', 'password2': '123'}
    user03 = {'password1': '123', 'first_name': 'Kang', 'last_name': 'Chen', 'email': 'test03@gmail.com', 'password2': '123'}
    
    userGroup = [user01,user02,user03]
    for idx,user_obj in enumerate(userGroup):
        form = AccountCreationForm(user_obj)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = True
            user.save()
            #Auto login new account
            if idx==0:
                user = authenticate(username=user.email,password=None,nopass=True)
                login(request, user)
                
    logger.info('Initialized accounts successfully')
    return HttpResponseRedirect("/")
@login_required
def initialize_tagging(request):

    tag02 = {'verbosename':'WebGL'}
    tag03 = {'verbosename':'Html5'}
    tag04 = {'verbosename':'NativeClient'}
    tag05 = {'verbosename':'Chrome'}
    tag06 = {'verbosename':'Chromium'}
    tag07 = {'verbosename':'Canvas'}
    tag08 = {'verbosename':'Demo'}
    tag09 = {'verbosename':'Shaders'}
    tag10 = {'verbosename':'Engine'}
    
    tagGroup = [tag02,tag03,tag04,tag05,tag06,tag07,tag08,tag09,tag10]
    for idx,tag_obj in enumerate(tagGroup):
        tag, created = Tag.objects.get_or_create(name=tag_obj['verbosename'].lower(),verbosename=tag_obj['verbosename'],author=request.user)
            
    logger.info('Initialized tags successfully')
    
    return HttpResponseRedirect("/")

@login_required
def initialize_promoted_taggings(request):
    tag01 = {'verbosename':'WebGL','orderid':1001}
    tag02 = {'verbosename':'Html5','orderid':1002}
    tag03 = {'verbosename':'NativeClient','orderid':1003}
    tag04 = {'verbosename':'Chrome','orderid':1006}
    tag05 = {'verbosename':'Canvas','orderid':1004}
    tag06 = {'verbosename':'Chromium','orderid':1005}
    tag07 = {'verbosename':'Engine','orderid':1006}
    tag08 = {'verbosename':'Demo','orderid':1}
    tag09 = {'verbosename':'Shaders','orderid':2}
    tagGroup = [tag01,tag02,tag03,tag04,tag05,tag06,tag07,tag08,tag09]
    
    for idx,pro_tag_obj in enumerate(tagGroup):
        if idx >=7:
            category = True
        else:
            category = False
        tag_obj,created = Tag.objects.get_or_create(verbosename=pro_tag_obj['verbosename'])
        promotedTag,create = PromotedTag.objects.get_or_create(tag=tag_obj,orderid = pro_tag_obj['orderid'],iscategory=category)
    logger.info('Initialized promoted tags successfully')
    return HttpResponseRedirect("/")
@login_required
def initialize_events(request):
    
    eventList = [{'content':'2jkhj6 TV Shows to Get You Through This Summer','tag':'General'},
                        {'content':'Workmlike Parasite Detected in Ancient Mummies','tag':'WebGL'},
                        {'content':'8 anikljkl mals with wild superpowers that would make Superman jealous','tag':'Html5'},
                        {'content':'Lajh test Arkham City Trailer Shows Catwoman In Action','tag':'NativeClient'},
                        {'content':'Japklkjklan firm develops sun-chasing solar panels','tag':'WebGL'},
                        {'content':'Who hhy','tag':'General'},
                        {'content':'1jhk 0 Bizarrely Mistaken Beliefs Americans Hold About Themselves','tag':'General'},
                        {'content':'Dkljklid Cable Pay Ralph Reed Millions To Orchestrate Tea Party Opposition To Net Neutrality?','tag':'General'},
                        {'content':'TV Shows to Get You Through This Summer','tag':'General'},
                        {'content':'Parasite Detected in Ancient Mummies','tag':'WebGL'},
                        {'content':'animals with wild superpowers that would make Superman jealous','tag':'Html5'},
                        {'content':'Arkham City Trailer Shows Catwoman In Action','tag':'NativeClient'},
                        {'content':'firm develops sun-chasing solar panels','tag':'WebGL'},
                        {'content':'haha Who','tag':'General'},
                        {'content':'Bizarrely Mistaken Beliefs Americans Hold About Themselves','tag':'General'},
                        {'content':'Cable Pay Ralph Reed Millions To Orchestrate Tea Party Opposition To Net Neutrality?','tag':'General'},
                        {'content':'Shows to Get You Through This Summer','tag':'General'},
                        {'content':'Detected in Ancient Mummies','tag':'WebGL'},
                        {'content':'wild superpowers that would make Superman jealous','tag':'Html5'},
                        {'content':'City Trailer Shows Catwoman In Action','tag':'NativeClient'},
                        {'content':'sun-chasing solar panels','tag':'WebGL'},
                        {'content':'Americans Hold About Themselves','tag':'General'},
                        {'content':'Ralph Reed Millions To Orchestrate Tea Party Opposition To Net Neutrality?','tag':'General'}]
    
    for eventItem in eventList:
            tag_obj,created = Tag.objects.get_or_create(name=eventItem['tag'].lower(),verbosename=eventItem['tag'],author=request.user)
            #Create micronote entry
            micronote_obj,created = Micronote.objects.get_or_create(author=request.user,content=eventItem['content'],platform='DEF')
            
            #Relate new micronote and tag, 
            ctype = ContentType.objects.get_for_model(micronote_obj)
            taggedItem_obj, created = TaggedItem.objects.get_or_create(content_type=ctype,object_id =micronote_obj.id ,tag= tag_obj)
            
            CREATE_M_EVENT(request,micronote_obj,tag_obj)
    logger.info('Initialized events successfully')
    return HttpResponseRedirect("/")
#@login_required
#def initialize_all(request):
#    initialize_testing_account(request)
#    initialize_testing_tagging(request)
#    return HttpResponseRedirect("/")