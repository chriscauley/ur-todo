from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.static import serve

import unrest.views
import unrest.urls
import server.views
from unrest.nopass.views import create as nopass_create

urlpatterns = [
    path('', include(unrest.urls)),
    path('admin/', admin.site.urls),
    path('api/nopass/',include('unrest.nopass.urls')),
    path("user.json",unrest.views.user_json),
    path("api/auth/register/",nopass_create),
    re_path('^api/(server).(Task|Project|Activity)/$', server.views.obj_api),
]

if settings.DEBUG:
    urlpatterns.append(path('', unrest.views.index))
