from django.contrib import admin
from .models import Profile, Company, Job, Application, Message
# Register your models here.

admin.site.site_header = 'Jobnest Administration'
admin.site.site_title = 'Jobnest Admin portal'


admin.site.register(Profile)
admin.site.register(Company)
admin.site.register(Job)
admin.site.register(Application)
admin.site.register(Message)
