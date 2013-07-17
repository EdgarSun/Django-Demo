"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from django.contrib.auth.models import User
from tagging.forms import CreateTagForm as TaggingCreationForm
from django.test import TestCase


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)

def initialize_testing_tagging(request):
    user = User.objects.get(id=1)
    tag01 = {'verbosename':'General','name':'general','author':user}