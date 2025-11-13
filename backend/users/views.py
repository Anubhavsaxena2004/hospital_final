from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    CustomUserSerializer,
    UserProfileSerializer
)
from hospitals.models import Hospital
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration with hospital assignment.
    Allows any user (even unauthenticated) to create a new account.
    """
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        """Create user and return JWT tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'user': CustomUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
        
        logger.info(f"New user registered: {user.username} for hospital: {user.hospital.name}")
        
        return Response(response_data, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'hospital_id': user.hospital.id if user.hospital else None,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)
class LogoutView(APIView):
    """
    API endpoint for user logout.
    Blacklists the refresh token to log the user out.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """Blacklist the refresh token to log the user out."""
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"User logged out: {request.user.username}")
                return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({"error": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile management.
    Allows users to view and update their profile information.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        """Return the current user."""
        return self.request.user

class HospitalListView(generics.ListAPIView):
    """
    API endpoint to list available hospitals for registration.
    """
    permission_classes = (AllowAny,)
    serializer_class = CustomUserSerializer
    
    def get_queryset(self):
        """Return only active hospitals."""
        return Hospital.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        """Return list of active hospitals."""
        hospitals = self.get_queryset()
        hospital_data = [
            {
                'id': hospital.id,
                'name': hospital.name,
                'subscription_plan': hospital.subscription_plan,
                'address': hospital.address,
                'phone': hospital.phone,
                'email': hospital.email
            }
            for hospital in hospitals
        ]
        return Response(hospital_data, status=status.HTTP_200_OK)
