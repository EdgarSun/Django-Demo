import re # ?
from django.forms import ModelForm
from django.contrib.auth.models import User
from micronote.models import Micronote
from django.utils.translation import ugettext_lazy as _

import logging
# Get an instance of a logger
logger = logging.getLogger(__name__)

TITLE_CHOICES = (
    ('HTML5', 'Html5'),
    ('WEBGL', 'WebGL'),
    ('NATIVE_CLIENT', 'Native Client'),
)

class MicronoteForm(forms.EmailField):
    class Meta:
        model = Micronote