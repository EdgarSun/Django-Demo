# Create your views here.
from django.views.generic.simple import direct_to_template
from django.contrib.auth.decorators import login_required

def render_sample_page(request,entity_id):

    template = 'webgl_sample.html'
    
    return direct_to_template(request, template,{})