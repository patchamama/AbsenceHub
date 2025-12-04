"""Employee Absence model."""
from datetime import datetime
from app import db


class EmployeeAbsence(db.Model):
    """Employee absence record."""

    __tablename__ = "employee_absences"

    id = db.Column(db.Integer, primary_key=True)
    service_account = db.Column(db.String(100), nullable=False, index=True)
    employee_fullname = db.Column(db.String(200), nullable=True)
    absence_type = db.Column(db.String(50), nullable=False, index=True)
    start_date = db.Column(db.Date, nullable=False, index=True)
    end_date = db.Column(db.Date, nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self):
        return (
            f"<EmployeeAbsence {self.id}: {self.service_account} "
            f"{self.absence_type} ({self.start_date} to {self.end_date})>"
        )

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "service_account": self.service_account,
            "employee_fullname": self.employee_fullname,
            "absence_type": self.absence_type,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def from_dict(cls, data):
        """Create model from dictionary."""
        return cls(
            service_account=data.get("service_account"),
            employee_fullname=data.get("employee_fullname"),
            absence_type=data.get("absence_type"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
        )
