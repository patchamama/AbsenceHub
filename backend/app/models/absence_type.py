"""Absence Type model."""
from datetime import datetime
from app import db


class AbsenceType(db.Model):
    """Absence type configuration."""

    __tablename__ = "absence_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True, index=True)
    name_de = db.Column(db.String(50), nullable=False)  # German name
    name_en = db.Column(db.String(50), nullable=False)  # English name
    color = db.Column(db.String(7), nullable=False, default="#3B82F6")  # Hex color
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<AbsenceType {self.id}: {self.name} ({self.color})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "name_de": self.name_de,
            "name_en": self.name_en,
            "color": self.color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def from_dict(cls, data):
        """Create model from dictionary."""
        return cls(
            name=data.get("name"),
            name_de=data.get("name_de"),
            name_en=data.get("name_en"),
            color=data.get("color", "#3B82F6"),
            is_active=data.get("is_active", True),
        )
