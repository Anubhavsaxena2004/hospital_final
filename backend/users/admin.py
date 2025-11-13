from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'hospital', 'role', 'is_active')
    list_filter = ('hospital', 'role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Hospital Information', {
            'fields': ('hospital', 'role', 'phone')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Hospital Information', {
            'fields': ('hospital', 'role', 'phone')
        }),
    )
    
    def get_queryset(self, request):
        """Filter users based on admin permissions."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Hospital admins can only see users from their hospital
        if hasattr(request.user, 'hospital') and request.user.hospital:
            return qs.filter(hospital=request.user.hospital)
        return qs.none()
