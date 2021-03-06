# Generated by Django 2.1.5 on 2019-01-14 00:30

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import unrest.models


class Migration(migrations.Migration):

  dependencies = [
    migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ("server", "0001_initial"),
  ]

  operations = [
    migrations.CreateModel(
      name="Activity",
      fields=[
        (
          "id",
          models.AutoField(
            auto_created=True,
            primary_key=True,
            serialize=False,
            verbose_name="ID",
          ),
        ),
        ("created", models.DateTimeField(auto_now_add=True)),
        ("data_hash", models.BigIntegerField()),
        ("data", django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
        (
          "user",
          models.ForeignKey(
            on_delete=django.db.models.deletion.CASCADE,
            to=settings.AUTH_USER_MODEL,
          ),
        ),
      ],
      options={"abstract": False},
      bases=(models.Model, unrest.models.JsonMixin),
    )
  ]
