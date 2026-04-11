import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

# Setup Django atmosphere
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

def ensure_superuser():
    User = get_user_model()
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@osonprava.uz')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    if not password:
        print("DJANGO_SUPERUSER_PASSWORD not set. Skipping superuser check.")
        return

    print(f"Ensuring superuser via script. Target email: {email}")

    try:
        user = User.objects.filter(email__iexact=email).first()
        if user:
            print(f"User {email} already exists (ID: {user.id}). Updating password and permissions...")
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            # For this specific model, we also need to set the role
            if hasattr(user, 'role') and hasattr(User, 'Role'):
                user.role = User.Role.SUPER_ADMIN
            user.save()
            print(f"Superuser {email} updated successfully.")
        else:
            print(f"Creating superuser {email}...")
            # For this specific model, we also need to set the role
            extra_fields = {
                'is_staff': True,
                'is_superuser': True,
            }
            if hasattr(User, 'Role'):
                extra_fields['role'] = User.Role.SUPER_ADMIN
            
            User.objects.create_superuser(
                email=email,
                password=password,
                **extra_fields
            )
            print(f"Superuser {email} created successfully.")
    except Exception as e:
        print(f"Error ensuring superuser: {e}")

if __name__ == '__main__':
    ensure_superuser()
