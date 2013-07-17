#!/usr/bin/python
""" Google URL Shortener
 Usage: python goo.gl URL"""

# import struct
import urllib
from google.appengine.api import urlfetch
import simplejson
from django.http import HttpResponse
#from django.utils import simplejson

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

SHORTENER_URL = ('https://www.googleapis.com/urlshortener/v1/url'
         '?key=AIzaSyAhMuJY3nTJbWkNLFx9_XBMwF2VQygyLrc')
SHORTENER_BITLY_URL = 'http://api.bitly.com/v3/shorten';

def GetShortUrl(base_url):
  """Makes request to Google URL Shortener and returns result.
  
  Args:
    base_url: Base URL for playlist.
    playlist_id: Playlist id, str.
  Returns:
    Short URL, str or None if error.
  """
  data = {
          'longUrl':base_url
          }
  result = urlfetch.fetch(url=SHORTENER_URL,
                          payload=simplejson.dumps(data),
                          method=urlfetch.POST,
                          headers={'Content-Type': 'application/json'}
                          )

  if result.status_code == 200:
    logging.info('Result = %s', result.content)
    response = simplejson.loads(result.content)
    return response['id']
  else:
    return None

def GetShortUrl_Bit_ly(base_url):
  param = "http://api.bitly.com/v3/shorten?login=eggersun&apiKey=R_fe5169bd5e4f6dc0eff1457a40bdd2b9";
  param =param + "&longUrl=" + base_url;
  param = param + "&format=json";
  
  result = urlfetch.fetch(url=param,
                          method=urlfetch.GET,
                          headers={'Content-Type': 'application/json'}
                          )

  if result.status_code == 200:
    logging.info('Result = %s', result.content)
    response = simplejson.loads(result.content)
    logging.info(response);
    resultData = response['data']
    return resultData['url']
  else:
    return None
        
def generate_shortener_url(request,url):
    result = GetShortUrl(url)
    #if the result data from google shortenerURL api is None, it will use below function to fetch shortURL from bit.ly api
    if result == None:
        result = GetShortUrl_Bit_ly(url)
    response_data = None;
    response_data = {"shortUrl":result};
    return HttpResponse(simplejson.dumps(response_data), mimetype="application/json")