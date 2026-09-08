from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_action(db: Session, user_name: str, action: str, module: str, record_id: str = None, details: str = None, user_id: int = None, ip_address: str = None):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            user_name=user_name,
            action=action,
            module=module,
            record_id=str(record_id) if record_id is not None else None,
            details=details,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[WARNING] Failed to write audit log: {e}")
