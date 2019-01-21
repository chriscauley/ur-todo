from django.db import models

from unrest.models import JsonModel, UserModel


class Task(UserModel):
    json_fields = ['id','data']
    def __str__(self):
        return "{} - {}".format(self.data['name'],self.user)

class Project(UserModel):
    json_fields = ['id','data']
    def __str__(self):
        return "{} - {}".format(self.data['name'],self.user)

class Activity(UserModel):
    json_fields = ['id','data']
    def __str__(self):
        return "{} - {}".format(self.data['name'],self.user)
