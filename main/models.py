from django.db import models

from unrest.models import JsonModel, UserModel


class Task(UserModel):
    json_fields = ['id','data']

class Project(UserModel):
    json_fields = ['id','data']
    def __str__(self):
        if self.data:
            return "{} - {}".format(self.data['name'],self.user)