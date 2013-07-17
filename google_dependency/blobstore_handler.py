from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect,HttpResponse
from django.shortcuts import get_object_or_404
from django.views.generic.simple import direct_to_template
from google_dependency.forms import UploadForm
from google_dependency.models import UploadModel
from filetransfers.api import prepare_upload, serve_file
from django.db import models
from google.appengine.api import images
from google.appengine.ext import blobstore
from google.appengine.ext.db import Model
from django.core.files.base import ContentFile
import simplejson
import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

def upload_handler(request,pk=None,entityID=None):
    view_url = reverse('google_dependency.blobstore_handler.upload_handler')
    absolute_url = '/resource/'

    if request.method == 'POST':
        form = UploadForm(request.POST, request.FILES)
        entityID = request.POST['entityID']
        
        logger.debug('entityID: ' + entityID)
        param={}
        if form.is_valid():
            obj = form.save()
            
        return HttpResponseRedirect(absolute_url+str(obj.pk) + '/' + entityID)
    
    elif request.method == 'GET':
        upload_url, upload_data = prepare_upload(request, view_url)
        resource_url ={}
        thumbnail_url = {}
        if pk != None:
            resource_url= generate_resource_URL(request,pk,'440','0')
            thumbnail_url= generate_resource_URL(request,pk,'50','1')
        param={'upload_url': upload_url, 
               'upload_data': upload_data,
               'resource_url' : resource_url,
               'thumbnail_url' : thumbnail_url,
               'pk' : pk
             }
        #form = UploadForm()
        return direct_to_template(request, 'filetransferForm.html',param)

def retrieve_handler(request, pk,size='50',crop='0'):

    return HttpResponseRedirect(generate_resource_URL(request,pk,size,crop))

def generate_resource_URL(request,pk,size='50',crop='0'):
    upload = get_object_or_404(UploadModel, pk=pk)
    # Creates the image object from blobstore 
    image = images.Image(blob_key=str(upload.file.file.blobstore_info.key()))
    imageURL = images.get_serving_url(str(upload.file.file.blobstore_info.key()), int(size), int(crop))
    
    return imageURL
    
#    data = blobstore.fetch_data(str(upload.file.file.blobstore_info.key() ), 0, 50000)
#    img = images.Image(image_data=data)
#    width = img.width
#    height = img.height
#    ratio = float(height) / float(width)
#    showcase_ratio = 0.72 # std_height/std_width
#    com_ratio = 0
#    
#    if size == '50':
#        std_width = 50
#        std_height = 50
#        
#        if ratio > 1:
#            image.resize(width = std_width)
#        else:
#            image.resize(height = std_height)
#
#    else:
#        com_ratio = showcase_ratio
#        if size == '440':
#            std_width = 440
#            std_height = 320
#    
#        elif size == '220':
#            std_width = 220
#            std_height = 160
#        
#        elif size == '110':
#            std_width = 110
#            std_height = 80
#        else:
#            std_width = 55
#            std_height = 40
#            
#        if ratio < com_ratio: #0.93 = 300/320
#            image.resize(height = std_height)
#        else:
#            image.resize(width = std_width)
#        #image.crop(0, 0, float(std_width), std_height)
#    
#        
#        logger.debug(size)
#        #image.crop(0, 0, right_x, bottom_y)
#    
#    n = str(image.execute_transforms(output_encoding=images.PNG,quality=85))
#    f = ContentFile(n)
#    return HttpResponse(f.file.read(), mimetype='image/png')


def delete_handler(request, pk):
    if request.method == 'POST':
        upload = get_object_or_404(UploadModel, pk=pk)
        upload.file.delete()
        upload.delete()
        param = {
                         'result' :'sucessed'
                         }
    return HttpResponse(simplejson.dumps(param), mimetype="application/json")
    return HttpResponseRedirect(reverse('google_dependency.blobstore_handler.upload_handler'))
