# Multi-Tenant Hospital Management System

This document explains the safe implementation of multi-tenancy in the hospital management system.

## 🏗️ Architecture Overview

The system implements **Hospital-Based Multi-Tenancy** where each hospital is a separate tenant with completely isolated data. This ensures that:

- ✅ **Data Isolation**: Each hospital can only access their own data
- ✅ **Security**: No cross-hospital data leakage
- ✅ **Scalability**: Easy to add new hospitals
- ✅ **Maintainability**: Clean separation of concerns

## 🔑 Core Components

### 1. Hospital Model (Tenant)
```python
# hospitals/models.py
class Hospital(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    subscription_plan = models.CharField(max_length=20, choices=...)
    is_active = models.BooleanField(default=True)
```

### 2. Custom User Model
```python
# users/models.py
class CustomUser(AbstractUser):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=20, choices=...)
    phone = models.CharField(max_length=15, blank=True, null=True)
```

### 3. Multi-Tenant Models
All data models include a hospital field:
```python
# patients/models.py
class Patient(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='patients')
    # ... other fields
```

## 🛡️ Security Implementation

### 1. Middleware Layer
Two middleware classes handle multi-tenancy:

#### MultiTenantMiddleware
- Extracts hospital information from JWT tokens
- Attaches hospital context to requests
- Adds hospital headers to responses

#### HospitalDataIsolationMiddleware
- Validates hospital access permissions
- Prevents cross-hospital data access
- Logs security violations

### 2. View Mixins
```python
# hospital_management/mixins.py
class HospitalScopedMixin:
    def get_queryset(self):
        # Automatically filters by hospital
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            return super().get_queryset().filter(hospital=hospital)
    
    def perform_create(self, serializer):
        # Automatically assigns hospital
        hospital = getattr(self.request, 'hospital', None)
        serializer.save(hospital=hospital)
```

## 🔄 Data Flow

### Authentication Flow
1. User logs in with username/password
2. System validates credentials
3. JWT token generated with user_id
4. Middleware extracts user and hospital from token
5. Hospital context attached to request

### Data Access Flow
1. User makes API request with JWT token
2. Middleware validates token and extracts hospital
3. View mixin filters queryset by hospital
4. Only hospital-specific data returned
5. Response includes hospital context headers

### Data Creation Flow
1. User submits data creation request
2. Middleware validates hospital context
3. View mixin automatically assigns hospital
4. Data saved with correct hospital association
5. Response confirms successful creation

## 🚀 Safe Implementation Steps

### Phase 1: Foundation (✅ Completed)
- [x] Create Hospital model
- [x] Create CustomUser model
- [x] Set up middleware
- [x] Create view mixins
- [x] Update settings

### Phase 2: Database Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Make migrations
python manage.py makemigrations

# 3. Apply migrations
python manage.py migrate

# 4. Set up initial data
python manage.py setup_hospitals
```

### Phase 3: Testing
```bash
# 1. Start the server
python manage.py runserver

# 2. Test endpoints
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin_city_general_hospital", "password": "admin123"}'
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/profile/` - Get user profile

### Hospitals
- `GET /api/hospitals/` - List available hospitals

### Patients (Multi-Tenant)
- `GET /api/patients/` - List patients (hospital-scoped)
- `POST /api/patients/` - Create patient (hospital-assigned)
- `GET /api/patients/<id>/` - Get patient details
- `PUT /api/patients/<id>/` - Update patient
- `DELETE /api/patients/<id>/` - Deactivate patient
- `GET /api/patients/search/` - Search patients
- `GET /api/patients/stats/` - Get patient statistics

## 🔒 Security Best Practices

### 1. Always Use Hospital Scoping
```python
# ✅ Correct - Uses mixin
class PatientListView(HospitalScopedListCreateView):
    queryset = Patient.objects.all()

# ❌ Wrong - No hospital scoping
class PatientListView(generics.ListCreateAPIView):
    queryset = Patient.objects.all()
```

### 2. Validate Hospital Context
```python
# ✅ Correct - Check hospital context
def get_queryset(self):
    hospital = getattr(self.request, 'hospital', None)
    if not hospital:
        raise PermissionDenied("No hospital context")
    return Patient.objects.filter(hospital=hospital)
```

### 3. Use Proper Serializers
```python
# ✅ Correct - Hospital field is read-only
class PatientSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = ['id', 'hospital', 'name', ...]
        read_only_fields = ['id', 'hospital']
```

## 🧪 Testing Multi-Tenancy

### Test Data Isolation
1. Create two hospitals
2. Create users for each hospital
3. Create patients for each hospital
4. Verify users can only see their hospital's patients

### Test Security
1. Try to access other hospital's data
2. Verify access is denied
3. Check logs for security violations

## 🐛 Common Issues & Solutions

### Issue: "No hospital context found"
**Solution**: Ensure user has hospital assigned and JWT token is valid

### Issue: "Access denied: You can only access data from your assigned hospital"
**Solution**: User is trying to access data from different hospital - this is working as intended

### Issue: "Hospital field is required"
**Solution**: Ensure using HospitalScopedMixin for views

## 📊 Monitoring & Logging

The system includes comprehensive logging:
- User authentication events
- Hospital context extraction
- Data access patterns
- Security violations

Check logs for:
- `MultiTenantMiddleware` - Hospital context extraction
- `HospitalDataIsolationMiddleware` - Security validation
- View mixins - Data filtering

## 🔄 Next Steps

1. **Add More Models**: Doctors, Appointments, Departments
2. **Implement Role-Based Access**: Different permissions per role
3. **Add Audit Logging**: Track all data changes
4. **Implement Caching**: Cache hospital-specific data
5. **Add API Rate Limiting**: Prevent abuse

## 🆘 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify hospital context is set correctly
3. Ensure all models have hospital field
4. Test with different user accounts

Remember: **Multi-tenancy is a security feature - when in doubt, err on the side of caution!**
