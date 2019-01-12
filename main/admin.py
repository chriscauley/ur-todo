from django.contrib import admin

from .models import Task, Project

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    pass

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    pass