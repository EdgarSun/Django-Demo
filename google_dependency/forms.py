from django import forms
from google_dependency.models import UploadModel

class UploadForm(forms.ModelForm):
    class Meta:
        model = UploadModel