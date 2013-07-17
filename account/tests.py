"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from django.contrib.auth.models import User
from account.forms import ExtendedUserCreationForm as CreationForm
from django.test import TestCase

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)

def initialize_testing_account(request):
    user01 = {'password1': '123', 'first_name': 'Edgar', 'last_name': 'Sun', 'email': 'test01@gmail.com', 'password2': '123'}
    user02 = {'password1': '123', 'first_name': 'Kar', 'last_name': 'Kar', 'email': 'test02@gmail.com', 'password2': '123'}
    user03 = {'password1': '123', 'first_name': 'Kang', 'last_name': 'Chen', 'email': 'test03@gmail.com', 'password2': '123'}
    
    userGroup = [user01,user02,user03]
    
    for userInfo in userGroup:
        form = CreationForm(userInfo)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = True
            user.save()
    logger.info('Initialized accounts successfully')
    