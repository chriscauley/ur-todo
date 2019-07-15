from django.apps import apps
from django.http import JsonResponse
import json

import unrest.views


def obj_api(request, app_label, model_name):
  app = apps.get_app_config(app_label)
  model = app.get_model(model_name)
  data = json.loads(request.body.decode("utf-8") or "{}")
  if request.method != "POST":
    return unrest.views.list_view(request, app_label, model_name)
  id = int(data.pop("id", 0))
  if id:
    obj = model.objects.get(id=id, user=request.user)
  else:
    obj = model(user=request.user)
  obj.data = data
  obj.save()
  return JsonResponse(obj.as_json)
