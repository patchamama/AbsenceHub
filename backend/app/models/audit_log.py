"""Audit log model for tracking changes to absences."""
from datetime import datetime
from app import db


class AuditLog(db.Model):
    """Model for tracking all changes to employee absences."""

    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)

    # What changed
    action = db.Column(db.String(20), nullable=False)  # CREATE, UPDATE, DELETE
    entity_type = db.Column(db.String(50), nullable=False, default='EmployeeAbsence')
    entity_id = db.Column(db.Integer, nullable=True)  # ID of the absence (null if deleted)

    # Who changed it (future enhancement - for now track system changes)
    user = db.Column(db.String(100), nullable=True, default='system')

    # What was the change
    old_values = db.Column(db.JSON, nullable=True)  # Before change (null for CREATE)
    new_values = db.Column(db.JSON, nullable=True)  # After change (null for DELETE)

    # When it happened
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Additional context
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        """String representation of audit log."""
        return f'<AuditLog {self.action} on {self.entity_type}:{self.entity_id} at {self.timestamp}>'

    def to_dict(self):
        """Convert audit log to dictionary."""
        return {
            'id': self.id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'user': self.user,
            'old_values': self.old_values,
            'new_values': self.new_values,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'description': self.description
        }

    @staticmethod
    def log_create(entity_type, entity_id, new_values, user='system', description=None):
        """Log a CREATE action."""
        log = AuditLog(
            action='CREATE',
            entity_type=entity_type,
            entity_id=entity_id,
            new_values=new_values,
            user=user,
            description=description or f'Created {entity_type} with ID {entity_id}'
        )
        db.session.add(log)
        return log

    @staticmethod
    def log_update(entity_type, entity_id, old_values, new_values, user='system', description=None):
        """Log an UPDATE action."""
        log = AuditLog(
            action='UPDATE',
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            user=user,
            description=description or f'Updated {entity_type} with ID {entity_id}'
        )
        db.session.add(log)
        return log

    @staticmethod
    def log_delete(entity_type, entity_id, old_values, user='system', description=None):
        """Log a DELETE action."""
        log = AuditLog(
            action='DELETE',
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            user=user,
            description=description or f'Deleted {entity_type} with ID {entity_id}'
        )
        db.session.add(log)
        return log
