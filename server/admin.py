from django.contrib import admin

from .models import Task, Project, Activity, ImportedEmail


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
  search_fields = ('data', )


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
  search_fields = ('data', )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
  pass


@admin.register(ImportedEmail)
class ImportedEmailAdmin(admin.ModelAdmin):
  list_display = ['google_id', 'attachment_number', 'from_email', 'subject', 'status']
  list_editable = ['from_email']
