from django.urls import path

from .views import (
    ProfileListCreate, ProfileRetrieveUpdateDelete,
    CompanyListCreate, CompanyRetrieveUpdateDelete,
    JobListCreate, JobRetrieveUpdateDelete,
    ApplicationListCreate, ApplicationRetrieveUpdateDelete,
    SignupView
)

from . import views

from django.urls import path
from jobs.views import MyTokenObtainPairView, SignupView, submit_application

from .views import MyTokenObtainPairView





urlpatterns = [
    path('profiles/', ProfileListCreate.as_view()),
    path("profiles/<int:pk>/", ProfileRetrieveUpdateDelete.as_view()),

    path('companies/', CompanyListCreate.as_view()),
    path('companies/<int:pk>/', CompanyRetrieveUpdateDelete.as_view()),

    path('jobs/', JobListCreate.as_view()),
    path('jobs/<int:pk>/', JobRetrieveUpdateDelete.as_view()),
    
    
    path("applications/", ApplicationListCreate.as_view()),
    path('applications/<int:pk>/', ApplicationRetrieveUpdateDelete.as_view()),

    path('apply/', submit_application, name='submit-application'),
    path("signup/", SignupView.as_view(), name = "signup"),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('applications/<int:app_id>/status/', views.update_application_status, name='update-status'),
    path('unread-count/', views.unread_count, name='unread-count'),

    # 2. The "Inbox List" (for the app/messages/page.jsx page)
    path('jobseeker-conversations/', views.jobseeker_conversations, name='jobseeker-conversations'),
    path('employer-conversations/', views.employer_conversations, name='employer-conversations'),
    path('employer/applications/', views.EmployerApplicationsList.as_view(), name='employer-apps'),
    path('api/user/update/', views.update_profile, name='update_profile'),


    # 3. The "Chat History" (fetching messages for one person)
    path('chat/<int:app_id>/', views.view_messages, name='view-messages'),
    path('chat/message/<int:message_id>/delete/', views.delete_message, name='delete_message'),

    path('employer/conversations/<int:app_id>/', views.delete_employer_conversation, name='delete_conversation'),

    # 4. The "Send" action (for the input box in the chat)
    path('chat/<int:app_id>/send/', views.send_message, name='send-message'),

    path('my-applications/', views.my_applications, name='my-applications'),
    # ... your other paths

]

