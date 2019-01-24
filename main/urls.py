from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve

import unrest.views
import main.views
from unrest.nopass.views import create as nopass_create

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/nopass/',include('unrest.nopass.urls')),
    path("user.json",unrest.views.user_json),
    path("api/auth/register/",nopass_create),
    re_path('^api/(main).(Task|Project|Activity)/$', main.views.obj_api),
]

if settings.DEBUG:
    kwargs = { 'path': 'index.html', 'document_root': settings.DIST_DIR }
    urlpatterns.append(path('', serve, kwargs=kwargs))
