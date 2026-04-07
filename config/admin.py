"""
Django Admin customizatsiya.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# Asosiy sayt sozlamalari
admin.site.site_header = _('OsonPrava Boshqaruv Paneli')
admin.site.site_title = _('OsonPrava Admin')
admin.site.index_title = _('OsonPrava ga xush kelibsiz!')

# Admin sahifa sarlavhasini o'zgartirish
admin.AdminSite.site_url = None
