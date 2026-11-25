from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    phone = models.CharField(max_length = 20, blank = True)
    address = models.CharField(max_length = 200, blank = True)
    role = models.CharField(max_length=25, choices = [("employer", "Employer"), ("job_seeker", "Job_seeker") ])

    def __str__ (self):
        return self.user.username

class Company(models.Model):
    name = models.CharField(max_length= 100)
    email = models.EmailField(max_length= 100, blank= False) 
    phone = models.CharField(max_length = 45, blank= True)
    location = models.CharField(max_length= 255)
    description = models.TextField(blank = True)
    owner = models.ForeignKey(Profile, on_delete = models.CASCADE)

    def __str__ (self):
       return  self.name
    
    # daverobb2011
    class Meta:
       verbose_name_plural = "Companies"


class Job(models.Model):
    title = models.CharField(max_length= 50)
    skills = models.CharField(max_length= 255, blank =  True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    salary = models.IntegerField(blank= True, null= True)
    location = models.CharField(max_length= 255)
    description = models.TextField(blank= True)
    created_at = models.DateTimeField(auto_now_add= True)
    job_type = models.CharField(max_length = 20, choices = [("Full-Time", "Full-Time"), ("Part-Time", "Part-Time"), ("Contract", "Contract"), ("Freelance", "Freelance")], default = "Full-Time")
    location_type = models.CharField(max_length = 20, choices = [  ("On-site", "On-site"), ("Remote", "Remote"),("Hybrid", "Hybrid")], default = "On-site")

    def __str__ (self):
        return  self.title

class Application(models.Model):
    full_name = models.CharField(max_length=255,blank=True)
    phone = models.CharField(max_length=20, blank=True)
    experience_years = models.IntegerField(default=0)
    previous_roles = models.TextField(blank=True, null = True)
    job =models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, on_delete= models.CASCADE)
    resume = models.FileField(upload_to= "resume/")
    applied_at =models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length = 20, choices= [("pending", "Pending"), ("reviewed", "Reviewed"), ("accepted", "Accepted"), ("rejected", "rejected")], default= "pending")

    def __str__ (self):
       return f' {self.applicant.username}- {self.job.title}'

class Message(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False) # 👈 This powers your notification count

    def __str__(self):
        return f"From {self.sender.username} for {self.application.job.title}"