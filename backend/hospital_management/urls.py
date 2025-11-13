"""
URL configuration for hospital_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import RegisterView, LoginView, LogoutView, UserProfileView, HospitalListView
from patients.views import PatientListView, PatientDetailView, PatientSearchView, PatientStatsView
from doctors.views import DoctorListView, DoctorDetailView, DoctorSearchView, DoctorStatsView
from appointments.views import (
    AppointmentListView, AppointmentDetailView, AppointmentSearchView, 
    AppointmentStatsView, TodayAppointmentsView, UpcomingAppointmentsView
)
from django.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Hospital endpoints
    # path('api/hospitals/', HospitalListView.as_view(), name='hospital_list'),
    path('', HospitalListView.as_view(), name='hospital_list'),
    
    # Patient endpoints
    path('api/patients/', PatientListView.as_view(), name='patient_list'),
    path('api/patients/<int:pk>/', PatientDetailView.as_view(), name='patient_detail'),
    path('api/patients/search/', PatientSearchView.as_view(), name='patient_search'),
    path('api/patients/stats/', PatientStatsView.as_view(), name='patient_stats'),
    
    # Doctor endpoints
    path('api/doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('api/doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor_detail'),
    path('api/doctors/search/', DoctorSearchView.as_view(), name='doctor_search'),
    path('api/doctors/stats/', DoctorStatsView.as_view(), name='doctor_stats'),
    
    # Appointment endpoints
    path('api/appointments/', AppointmentListView.as_view(), name='appointment_list'),
    path('api/appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment_detail'),
    path('api/appointments/search/', AppointmentSearchView.as_view(), name='appointment_search'),
    path('api/appointments/stats/', AppointmentStatsView.as_view(), name='appointment_stats'),
    path('api/appointments/today/', TodayAppointmentsView.as_view(), name='today_appointments'),
    path('api/appointments/upcoming/', UpcomingAppointmentsView.as_view(), name='upcoming_appointments'),

    # Staff endpoints
    path('api/', include('staff.urls')),

    # Beds endpoints
    path('api/', include('beds.urls')),
]
