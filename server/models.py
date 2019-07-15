from unrest.models import UserModel


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
