# Create your views here.
from django.core.cache import cache
from account.forms import ExtendedUserCreationForm as CreationForm
from account.forms import ExtendedAuthenticationForm as AutheForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate,login,logout
from tests import initialize_testing_account

from django.contrib.auth.models import User

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

def create_new_user(request):
    logger.warning(request.method)
    if request.method == 'POST':
        #logger.warning('Something went warning!')
        form = CreationForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)
            # user must be active for login to work
            user.is_active = True
            user.save()
            #Auto login new account
            user = authenticate(username=user.email,password=None,nopass=True)
            login(request, user)
            return HttpResponseRedirect('/')
    else:
        form = CreationForm()
    return direct_to_template(request, 'generic_form.html',
        {'form': form,'action':'/account/register/'})
def login_user(request,mode='unembed'):
    if request.method == 'POST':
        if request.session.test_cookie_worked():
            request.session.delete_test_cookie()
            email = request.POST['email']
            password = request.POST['password']
            next = request.POST['redirect']
            user = authenticate(username=email, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    #logger.warning(request.session['member_account'])
                    # Redirect to a success page.
                    return HttpResponseRedirect(next)
                else:
                    # Return a 'disabled account' error message
                    logger.warning('disabled account!')
            else:
                # Return an 'invalid login' error message.
                logger.warning('invalid login!')
        else:
            #Return an ' doesn't accept cookie' error message.
            logger.warning('doesn\'t accept cookie!')
        return HttpResponseRedirect('/account/login/')
    
    else:
        # the login page of 'embed' mode is used to be embeded into others page
        if mode=='unembed':
            redirectTemplate = 'user_login_form.html'
        else:
            redirectTemplate = 'user_generic_form.html'

        form = AutheForm()
        request.session.set_test_cookie()
    return direct_to_template(request, redirectTemplate, {'form': form,'action':'/account/login/','next':request.REQUEST.get('next', '')})

def logout_user(request):
    logout(request)
    # Redirect to a success page.
    return HttpResponseRedirect("/")
def delete_user(request,userID=0):
    if userID > 0:
        user = User.objects.get(id=userID)
        user.delete()
    return HttpResponseRedirect("/")