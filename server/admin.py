from django.contrib import admin

from .models import Task, Project, Activity


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
  search_fields = ('data', )


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
  search_fields = ('data', )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
  pass
