from django.urls import path
from .views import RegisterView, LogoutView, PatientListView, PatientDetailView, PatientSearchView, PatientStatsView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),

    # Patient endpoints
    path('patients/', PatientListView.as_view(), name='patient-list'),
    path('patients/search/', PatientSearchView.as_view(), name='patient-search'),
    path('patients/stats/', PatientStatsView.as_view(), name='patient-stats'),
    path('patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
]
