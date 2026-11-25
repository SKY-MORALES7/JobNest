# from django.shortcuts import render
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .models import Profile, Company, Job, Application, Message
from .serializers import ProfileSerializer, CompanySerializer, JobSerializer, ApplicationSerializer, SignupSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Application, Job
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer




class ProfileListCreate(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]


class ProfileRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class CompanyListCreate(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    
  

class CompanyRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

# list jobs or create new ones
from rest_framework.exceptions import ValidationError

class JobListCreate(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request}) # This tells the serializer WHO the user is
        return context

    def perform_create(self, serializer):
        # Use get_or_create to prevent "DoesNotExist" crashes
        profile, _ = Profile.objects.get_or_create(user=self.request.user)

        # Get company linked to this employer
        company = Company.objects.filter(owner=profile).first()
        if not company:
            company = Company.objects.create(
                name=f"{profile.user.username}'s Company",
                email=profile.user.email,
                location="Not set yet",
                owner=profile
                
            )
        serializer.save(company=company)

    def get_queryset(self):
        try:
            profile = Profile.objects.get(user=self.request.user)
            # Employer sees only their jobs
            if profile.role == "employer":
                return Job.objects.filter(company__owner=profile)
        except Profile.DoesNotExist:
            return Job.objects.all() # Fallback

        # Job seekers see all jobs
        return Job.objects.all()
class JobRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]


class ApplicationListCreate(generics.ListCreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer 
    permission_classes = [IsAuthenticated]  

class ApplicationRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]



def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# class SignupView(generics.CreateAPIView):
#     serializer_class  = SignupSerializer
#     permission_classes = [AllowAny]

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data = request.data)
#         serializer.is_valid(raise_exception = True)
#         user = serializer.save()
#         return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]  # ✅ anyone can signup

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # ✅ Only create profile if it doesn't exist
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={"role": serializer.validated_data.get("role")}
        )

        # ✅ Only create default company if employer and no company exists
        if profile.role == "employer" and not hasattr(profile, "company"):
            Company.objects.create(
                name=f"{user.username}'s Company",
                email=user.email,
                location="Not set yet",
                owner=profile
            )

        return Response(
            {"message": "User, profile, and company created successfully!"},
            status=status.HTTP_201_CREATED
        )

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_application(request):
    # Log the data coming in so you can see it in your terminal!
    print("Received data:", request.data)

    # 1. Get the Core data
    job_id = request.data.get('job')
    resume_file = request.FILES.get('resume')

    if Application.objects.filter(job_id=job_id, applicant=request.user).exists():
        return Response({"error": "You have already applied for this job!"}, status=400)

    # 2. Get the NEW fields (these match  React 'data.append' keys)
    full_name = request.data.get("full_name")
    phone = request.data.get('phone')
    experience = request.data.get('experience_years')
    previous_roles = request.data.get('previous_jobs')
    

    try:
        job = Job.objects.get(id=job_id)
        
        # 3. Create the object with ALL fields
        Application.objects.create(
            job=job,
            applicant=request.user,
            resume=resume_file,
            full_name=full_name,
            phone=phone,
            experience_years=experience if experience else 0, # Default to 0 if empty
        # 🔹
            previous_roles=previous_roles if previous_roles else ""
        )
        return Response({"message": "Success!"}, status=201)
    except Exception as e:
        print("Error saving:", str(e))
        return Response({"error": str(e)}, status=400)

class EmployerApplicationsList(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get applications for jobs owned by this employer's company
        return Application.objects.filter(job__company__owner__user=user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, app_id):
    content = request.data.get('content')
    try:
        application = Application.objects.get(id=app_id)
        # Create the message
        Message.objects.create(
            application=application,
            sender=request.user,
            content=content
        )
        return Response({"status": "Sent!"}, status=201)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    print(f"DEBUG: User is {request.user}") 
    print(f"DEBUG: Auth Header: {request.headers.get('Authorization')}")
    user = request.user
    
    # --- 1. MESSAGE LOGIC ---
    unread_messages = Message.objects.filter(
        is_read=False
    ).exclude(sender=user)

    if user.profile.role == "employer":
        unread_messages = unread_messages.filter(application__job__company__owner__user=user)
    else:
        unread_messages = unread_messages.filter(application__applicant=user)

    msg_count = unread_messages.count()
    latest_sender = None
    if msg_count > 0:
        latest_msg = unread_messages.order_by('-timestamp').first()
        latest_sender = latest_msg.sender.username

    # --- 2. APPLICANT LOGIC (For Employers Only) ---
    new_applicants_count = 0
    if user.profile.role == "employer":
        # We look for applications that haven't been 'reviewed' yet
        new_applicants_count = Application.objects.filter(
            job__company__owner__user=user,
            status="pending" # Or use a custom 'notified' boolean if you prefer
        ).count()

    return Response({
        "unread_count": msg_count,
        "latest_sender": latest_sender,
        "new_applicants": new_applicants_count,
        "role": user.profile.role
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_messages(request, app_id):
    try:
        application = Application.objects.get(id=app_id)
        
        # 1. MARK MESSAGES AS READ (This works for both roles)
        Message.objects.filter(
            application=application, 
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        # 2. GET MESSAGES
        messages = Message.objects.filter(application=application).order_by('timestamp')
        
        # 3. USE THE SERIALIZER (The 'context' part is why your toast is missing!)
        from .serializers import MessageSerializer
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        
        return Response({
            "application_status": application.status,
            "messages": serializer.data  # This now contains the correct 'is_me' and 'sender_name'
        })
    except Application.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employer_conversations(request):
    # 1. Get all applications for jobs owned by this employer
    # This avoids the "Message Join" duplicates entirely
    apps = Application.objects.filter(
        job__company__owner__user=request.user
    ).order_by('-id') # Shows newest applicants first

    data = []
    for app in apps:
        # Get the last message if it exists
        last_msg = app.messages.order_by('timestamp').last()
        
        data.append({
            "id": app.id, # This is the Application ID (Unique)
            "applicant_name": app.full_name or app.applicant.username,
            "job_title": app.job.title,
            "last_message_preview": last_msg.content[:30] + "..." if last_msg else "No messages yet",
            "last_message_time": last_msg.timestamp.strftime("%b %d") if last_msg else "New",
            "unread_count": app.messages.filter(is_read=False).exclude(sender=request.user).count()
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jobseeker_conversations(request):
    # 1. Get all applications submitted by THIS jobseeker
    apps = Application.objects.filter(
        applicant=request.user
    ).order_by('-applied_at')

    data = []
    for app in apps:
        # Get the last message in this application thread
        last_msg = app.messages.order_by('timestamp').last()
        
        # We only want to show it in the inbox if there's actually a message
        # OR you can remove the 'if last_msg' check if you want empty chats to show
        if last_msg:
            data.append({
                "id": app.id, 
                "company_name": app.job.company.name if app.job else "Unknown Company",
                "job_title": app.job.title if app.job else "Unknown Job",
                "last_message_preview": last_msg.content[:30] + "..." if last_msg else "No messages yet",
                "last_message_time": last_msg.timestamp.strftime("%b %d") if last_msg else "New",
                "unread_count": app.messages.filter(is_read=False).exclude(sender=request.user).count()
            })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    # This specifically fetches jobs the LOGGED-IN user applied for
    user_apps = Application.objects.filter(applicant=request.user).order_by('-applied_at')
    
    data = []
    for app in user_apps:
        data.append({
            "id": app.id,
            "job_title": app.job.title if app.job else "Unknown Job",
            "company_name": app.job.company.name if app.job and app.job.company else "Unknown Company",
            "status": app.status,
            "applied_on": app.applied_at.strftime("%b %d, %Y") if hasattr(app, 'applied_at') else "N/A"
        })
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_application_status(request, app_id):
    try:
        application = Application.objects.get(id=app_id)
        new_status = request.data.get('status') # This will be 'accepted' or 'rejected'
        
        # Check if the user is the employer who owns the job
        if application.job.company.owner.user != request.user:
            return Response({"error": "Only the employer can change the status."}, status=403)

        if new_status in ["accepted", "rejected", "reviewed"]:
            application.status = new_status
            application.save()
            return Response({"status": application.status})
        
        return Response({"error": "Invalid status"}, status=400)
    except Application.DoesNotExist:
        return Response(status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    try:
        message = Message.objects.get(id=message_id, sender=request.user) # Ensures only the sender can delete
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Message.DoesNotExist:
        return Response({"error": "Not found or not your message"}, status=403)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employer_conversation(request, app_id):
    try:
        # We find the application that belongs to this employer's company
        application = Application.objects.get(
            id=app_id, 
            job__company__owner__user=request.user
        )
        
        # Option A: Hard Delete (Removes it from the database entirely)
        application.delete() 
        
        return Response({"message": "Conversation removed"}, status=204)
    except Application.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=404)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile = user.profile

    # --- STEP 1: SEND DATA TO NEXT.JS (GET) ---
    if request.method == 'GET':
        data = {
            "username": user.username,
            "email": user.email,
            "role": profile.role,
        }
        # If employer, find their company to show current info in Next.js
        if profile.role == 'employer':
            company = Company.objects.filter(owner=profile).first()
            if company:
                data.update({
                    "company_name": company.name,
                    "company_email": company.email,
                    "company_phone": company.phone,
                    "company_location": company.location,
                    "company_description": company.description,
                })
        return Response(data)

    # --- STEP 2: SAVE DATA FROM NEXT.JS (PATCH) ---
    if request.method == 'PATCH':
        incoming = request.data
        
        # A. Update the User Model
        user.username = incoming.get('username', user.username)
        user.email = incoming.get('email', user.email)
        user.password = incoming.get('password', user.password)

        if user.password:
            user.set_password(user.password)
        user.save()

        # B. Update the Company Model (This fills your Admin!)
        if profile.role == 'employer':
            company = Company.objects.filter(owner=profile).first()
            if company:
                # Check if 'company_name' was sent from Next.js
                new_name = incoming.get('company_name')
                
                # Only update if the user actually typed something in that box
                if new_name:
                    company.name = new_name
                    
                company.email = incoming.get('company_email', company.email)
                company.phone = incoming.get('company_phone', company.phone)
                company.location = incoming.get('company_location', company.location)
                company.description = incoming.get('company_description', company.description)
                company.save()

            return Response({"message": "Success! Your Admin should now be populated."}, status=200)
        
        # Fallback response for non-employers
        return Response({"message": "Profile updated successfully!"}, status=200)