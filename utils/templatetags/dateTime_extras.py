from django import template
from django.template.defaultfilters import stringfilter
from utils.dateTime import pretty_date


register = template.Library()

@register.filter
def pretty_datetime(value):
    return pretty_date(value)