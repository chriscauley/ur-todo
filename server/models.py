from unrest.models import UserModel
from django.db import models


class Task(UserModel):
  json_fields = ["id", "data"]

  def __str__(self):
    return "{} - {}".format(self.data["name"], self.user)


class Project(UserModel):
  json_fields = ["id", "data"]

  def __str__(self):
    return "{} - {}".format(self.data["name"], self.user)


class Activity(UserModel):
  json_fields = ["id", "data"]

  def __str__(self):
    return "{} - {}".format(self.data["name"], self.user)


class ScoreCard(UserModel):
  json_fields = ["id", "data"]

  def __str__(self):
    return "ScoreCard {} - {}".format(self.data["datetime"], self.user)


class ImportedEmail(models.Model):
  _STATUS = ['new', 'rejected', 'completed']
  STATUS_CHOICES = zip(_STATUS, _STATUS)
  subject = models.TextField()
  content = models.TextField()
  google_id = models.CharField(max_length=32)
  attachment_number = models.IntegerField()
  source_email = models.CharField(max_length=256)
  from_email = models.CharField(max_length=256)
  status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='new')
  status_note = models.CharField(max_length=256, null=True, blank=True)