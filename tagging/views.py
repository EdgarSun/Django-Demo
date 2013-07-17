# Create your views here.
from django.contrib.auth.models import User
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from tagging.models import Tag
from tagging.models import PromotedTag
from tagging.forms import CreateTagForm
from tagging.forms import PromoteTagForm
from django.contrib.auth.decorators import login_required
import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

def create_new_tag(request):

    if request.method == 'POST':
        verbose_name = request.POST.get('verbosename','general')
        #tag, created = Tag.objects.get_or_create(name=verbose_name.lower(),verbosename=verbose_name,author=request.user)
        create(request,verbose_name)

        return HttpResponseRedirect("/tag/add/")
    else:
        form = CreateTagForm()
    return direct_to_template(request, 'generic_form.html',{'form': form,'action':'/tag/add/'})
def create(request,tagName):
    shortTagName = tagName.replace(' ','').lower()
    tag, created = Tag.objects.get_or_create(name=shortTagName)
    tag.associated_count = tag.associated_count + 1
    result = ''
    if created == True:
        tag.verbosename = tagName
        tag.author = request.user
        
    tag.save();
    return tag,created
def promote_tag(request):
    if request.method == 'POST':
        tag_obj = Tag.objects.get(id=request.POST['tag'])
        order_id = request.POST['orderid']
        logger.debug(tag_obj)
        promotedTag,created = PromotedTag.objects.get_or_create(tag=tag_obj,orderid = order_id)
        logger.debug(promotedTag)
        return HttpResponseRedirect("/tag/promote/")
    else:
        form = PromoteTagForm()
        promotedTags = PromotedTag.objects.filter(iscategory=False)
        logger.debug(promotedTags)
    return direct_to_template(request, 'generic_form.html',{'form': form,'promotedTags':promotedTags,'action':'/tag/promote/'})