from django import forms
from tagging.models import Tag
from tagging.models import PromotedTag

class CreateTagForm(forms.ModelForm):
    class Meta:
        model = Tag
        exclude = ['author', 'name','associated_count','date_created']
        
class PromoteTagForm(forms.ModelForm):
    class Meta:
        model = PromotedTag
        #exclude = ['orderid']