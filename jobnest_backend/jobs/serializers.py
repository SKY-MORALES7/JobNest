from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile, Company, Job, Application, Message
from django.contrib.auth.models import User
from django.utils import timezone
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)
    # 1. You MUST declare the field here
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        # 2. You MUST add 'has_applied' to this list
        fields = [
            'id', 'title', 'description', 'location', 'job_type', 'location_type',
            'salary', 'skills', 'company', 'has_applied'
        ]

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(job=obj, applicant=request.user).exists()
        return False

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[("employer", "Employer"), ("job_seeker", "Job Seeker")])
    # Define the single field the frontend is sending
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'full_name']

    def create(self, validated_data):
        role = validated_data.pop("role")
        full_name = validated_data.pop("full_name").strip()

        # Split the fullname into parts
        name_parts = full_name.split(" ")
        first_name = name_parts[0]
        # Join the rest as the last name (handles middle names correctly)
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        # Create the user with Django's standard fields
        user = User.objects.create_user(
            **validated_data,
            first_name=first_name,
            last_name=last_name
        )
        
        Profile.objects.create(user=user, role=role)
        return user
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Standard JWT validation (checks username/password)
        data = super().validate(attrs)

        # 2. Safety Check for Profile and Name Data
        try:
            # Grab the profile (this uses the 'related_name' from your model)
            profile = self.user.profile 
            
            data['role'] = profile.role
            data['username'] = self.user.username
            
            # Combine first and last name from the User model
            f_name = self.user.first_name
            l_name = self.user.last_name
            combined_name = f"{f_name} {l_name}".strip()
            
            # If the user has names saved, use them. 
            # Otherwise, use the username so React never gets "undefined"
            data['full_name'] = combined_name if combined_name else self.user.username

        except AttributeError:
            # 🔹 YOUR ERROR HANDLING IS BACK 🔹
            # This triggers if self.user has no .profile attribute
            raise serializers.ValidationError(
                "User account is active, but no profile was found. Please contact support."
            )
        except Exception as e:
            # Catch-all for any other weird data issues
            raise serializers.ValidationError(f"Authentication error: {str(e)}")

        return data
class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()
    sender_name = serializers.ReadOnlyField(source='sender.username')
    time = serializers.SerializerMethodField() # Add this

    class Meta:
        model = Message  # Make sure Message is imported from your models
        fields = ['id', 'content', 'time','timestamp', 'is_me', 'sender_name']


    def get_time(self, obj):
        # Returns just "14:30" or "02:30"
        # return obj.timestamp.strftime("%H:%M")
        local_time = timezone.localtime(obj.timestamp)
        return local_time.strftime("%I:%M %p")

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Compare IDs directly to avoid errors
            return obj.sender.id == request.user.id
        return False