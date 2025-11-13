from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from users.models import CustomUser
from hospitals.models import Hospital
import logging

logger = logging.getLogger(__name__)

class MultiTenantMiddleware:
    """
    Middleware to handle multi-tenant hospital identification and data isolation.
    This middleware ensures that all requests are properly scoped to the user's hospital.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view
        request = self.process_request(request)
        
        # Get response from view
        response = self.get_response(request)
        
        # Process response after view
        response = self.process_response(request, response)
        
        return response

    def process_request(self, request):
        """
        Process the request to identify the hospital and set up multi-tenancy.
        """
        # Skip for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return request
        
        # For API requests, extract hospital from JWT
        if request.path.startswith('/api/'):
            request = self._extract_hospital_from_jwt(request)
        
        return request

    def _extract_hospital_from_jwt(self, request):
        """
        Extract hospital information from JWT token and attach to request.
        """
        try:
            # Get authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            logger.info(f"Authorization header: {auth_header[:20]}...")  # Log first 20 chars for debugging
            if not auth_header.startswith('Bearer '):
                # No token provided, continue without hospital context
                logger.warning("No Bearer token found in request")
                return request

            # Extract token
            token = auth_header.split(' ')[1]
            logger.info(f"Token extracted, length: {len(token)}")

            # Decode token
            access_token = AccessToken(token)
            logger.info(f"Token decoded successfully")

            # Get user ID from token
            user_id = access_token.get('user_id')
            logger.info(f"User ID from token: {user_id}")
            if not user_id:
                logger.warning("No user_id found in token")
                return request

            # Get user and hospital
            try:
                user = CustomUser.objects.get(id=user_id, is_active=True)
                logger.info(f"User found: {user.username}, hospital: {user.hospital}")
                if user.hospital:
                    request.hospital = user.hospital
                    request.user_hospital_id = user.hospital.id
                    logger.info(f"User {user.username} accessing hospital: {user.hospital.name}")
                else:
                    # Superuser without hospital
                    request.hospital = None
                    request.user_hospital_id = None
                    logger.info(f"Superuser {user.username} accessing system")
            except CustomUser.DoesNotExist:
                logger.warning(f"User with ID {user_id} not found")
                return request

        except (InvalidToken, TokenError, IndexError, KeyError) as e:
            logger.warning(f"Token processing error: {str(e)}")
            return request

        return request

    def process_response(self, request, response):
        """
        Process the response to add any multi-tenant headers if needed.
        """
        # Add hospital context to response headers for debugging
        if hasattr(request, 'hospital') and request.hospital:
            response['X-Hospital-ID'] = str(request.hospital.id)
            response['X-Hospital-Name'] = request.hospital.name
        
        return response

class HospitalDataIsolationMiddleware:
    """
    Middleware to ensure data isolation between hospitals.
    This middleware validates that users can only access data from their own hospital.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view
        request = self.process_request(request)
        
        # Get response from view
        response = self.get_response(request)
        
        return response

    def process_request(self, request):
        """
        Validate that the request is properly scoped to the user's hospital.
        """
        # Skip for admin and static files
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return request
        
        # For API requests, validate hospital access
        if request.path.startswith('/api/'):
            self._validate_hospital_access(request)
        
        return request

    def _validate_hospital_access(self, request):
        """
        Validate that the user has access to the requested hospital data.
        """
        # Skip validation for superusers
        if hasattr(request, 'user') and request.user.is_authenticated and request.user.is_superuser:
            return
        
        # Check if hospital context is set
        if not hasattr(request, 'hospital'):
            logger.warning("No hospital context found in request")
            return
        
        # For authenticated users, ensure they can only access their own hospital
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_hospital = getattr(request.user, 'hospital', None)
            request_hospital = getattr(request, 'hospital', None)
            
            if user_hospital and request_hospital and user_hospital != request_hospital:
                logger.error(f"User {request.user.username} attempted to access hospital {request_hospital.name} but belongs to {user_hospital.name}")
                raise PermissionDenied("Access denied: You can only access data from your assigned hospital.")
