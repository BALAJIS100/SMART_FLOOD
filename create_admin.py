import sys
import os

backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if os.path.exists(backend_path) and backend_path not in sys.path:
    sys.path.insert(0, backend_path)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.auth.security import get_password_hash

def create_admin_user(
    email: str = "balajikavi100@gmail.com",
    password: str = "admin123",
    full_name: str = "Balaji Kavi (State Admin)",
    phone: str = "+91 98765 43299"
):
    print("[1/3] Connecting to database & verifying table schemas...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("[2/3] Checking Admin role...")
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            admin_role = Role(
                name="Admin",
                description="Full administrative access to system parameters, user management, and disaster logs."
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            print(" -> Created new 'Admin' role.")

        print(f"[3/3] Provisioning admin user for '{email}'...")
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f" -> User '{email}' already exists in database. Updating password and ensuring Admin role...")
            user.hashed_password = get_password_hash(password)
            user.role_id = admin_role.id
            user.is_active = True
            user.full_name = full_name
            user.phone = phone
        else:
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name=full_name,
                phone=phone,
                role_id=admin_role.id,
                is_active=True
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        print("\n==================================================")
        print(" SUCCESS: ADMIN LOGIN CREATED & STORED IN DATABASE!")
        print("==================================================")
        print(f" Email:    {user.email}")
        print(f" Password: {password}")
        print(f" Full Name:{user.full_name}")
        print(f" Role:     Admin (Role ID: {user.role_id})")
        print(f" Status:   Active ({user.is_active})")
        print("==================================================\n")
    except Exception as e:
        db.rollback()
        print(f"\n ERROR: Failed to store admin user in database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()