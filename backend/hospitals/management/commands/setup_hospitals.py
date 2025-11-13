from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from hospitals.models import Hospital
from users.models import CustomUser

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up initial hospitals and superuser for multi-tenant system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial hospitals...')
        
        # Create hospitals
        hospitals_data = [
            {
                'name': 'City General Hospital',
                'address': '123 Main Street, Downtown, City',
                'phone': '+1234567890',
                'email': 'info@citygeneral.com',
                'subscription_plan': 'premium'
            },
            {
                'name': 'Community Medical Center',
                'address': '456 Oak Avenue, Suburb, City',
                'phone': '+1234567891',
                'email': 'contact@communitymed.com',
                'subscription_plan': 'basic'
            },
            {
                'name': 'Regional Health Institute',
                'address': '789 Pine Road, District, City',
                'phone': '+1234567892',
                'email': 'admin@regionalhealth.com',
                'subscription_plan': 'enterprise'
            }
        ]
        
        created_hospitals = []
        for hospital_data in hospitals_data:
            hospital, created = Hospital.objects.get_or_create(
                name=hospital_data['name'],
                defaults=hospital_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created hospital: {hospital.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Hospital already exists: {hospital.name}')
                )
            created_hospitals.append(hospital)
        
        # Create superuser if it doesn't exist
        if not CustomUser.objects.filter(is_superuser=True).exists():
            superuser = CustomUser.objects.create_superuser(
                username='admin',
                email='admin@hospital.com',
                password='admin123',
                first_name='System',
                last_name='Administrator'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created superuser: {superuser.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Superuser already exists')
            )
        
        # Create sample hospital admin users
        for i, hospital in enumerate(created_hospitals):
            admin_username = f'admin_{hospital.name.lower().replace(" ", "_")}'
            if not CustomUser.objects.filter(username=admin_username).exists():
                admin_user = CustomUser.objects.create_user(
                    username=admin_username,
                    email=f'admin@{hospital.name.lower().replace(" ", "")}.com',
                    password='admin123',
                    first_name='Hospital',
                    last_name='Admin',
                    hospital=hospital,
                    role='admin'
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created hospital admin: {admin_user.username} for {hospital.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Hospital admin already exists: {admin_username}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Hospital setup completed successfully!')
        )
