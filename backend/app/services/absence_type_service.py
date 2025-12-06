"""Business logic for absence type management."""
from app import db
from app.models.absence_type import AbsenceType


class AbsenceTypeService:
    """Service class for absence type operations."""

    @staticmethod
    def get_all(active_only=True):
        """
        Get all absence types.

        Args:
            active_only (bool): Return only active types

        Returns:
            list: List of AbsenceType objects
        """
        query = AbsenceType.query

        if active_only:
            query = query.filter(AbsenceType.is_active == True)

        return query.order_by(AbsenceType.name).all()

    @staticmethod
    def get_by_id(type_id):
        """
        Get absence type by ID.

        Args:
            type_id (int): Absence type ID

        Returns:
            AbsenceType: Absence type object or None
        """
        return AbsenceType.query.get(type_id)

    @staticmethod
    def get_by_name(name):
        """
        Get absence type by name.

        Args:
            name (str): Absence type name

        Returns:
            AbsenceType: Absence type object or None
        """
        return AbsenceType.query.filter(AbsenceType.name == name).first()

    @staticmethod
    def create(data):
        """
        Create new absence type.

        Args:
            data (dict): Absence type data

        Returns:
            AbsenceType: Created absence type

        Raises:
            ValueError: If validation fails
        """
        # Validate required fields
        if not data.get('name'):
            raise ValueError('Name is required')
        if not data.get('name_de'):
            raise ValueError('German name is required')
        if not data.get('name_en'):
            raise ValueError('English name is required')

        # Check if name already exists
        existing = AbsenceTypeService.get_by_name(data['name'])
        if existing:
            raise ValueError(f'Absence type with name "{data["name"]}" already exists')

        # Validate color format (hex color)
        color = data.get('color', '#3B82F6')
        if not color.startswith('#') or len(color) != 7:
            raise ValueError('Color must be in hex format (#RRGGBB)')

        # Create absence type
        absence_type = AbsenceType.from_dict(data)

        # Save to database
        db.session.add(absence_type)
        db.session.commit()

        return absence_type

    @staticmethod
    def update(type_id, data):
        """
        Update existing absence type.

        Args:
            type_id (int): Absence type ID
            data (dict): Updated data

        Returns:
            AbsenceType: Updated absence type

        Raises:
            ValueError: If validation fails
        """
        absence_type = AbsenceTypeService.get_by_id(type_id)
        if not absence_type:
            raise ValueError(f'Absence type with ID {type_id} not found')

        # Check if new name conflicts with existing
        if 'name' in data and data['name'] != absence_type.name:
            existing = AbsenceTypeService.get_by_name(data['name'])
            if existing:
                raise ValueError(f'Absence type with name "{data["name"]}" already exists')

        # Validate color if provided
        if 'color' in data:
            color = data['color']
            if not color.startswith('#') or len(color) != 7:
                raise ValueError('Color must be in hex format (#RRGGBB)')

        # Update fields
        if 'name' in data:
            absence_type.name = data['name']
        if 'name_de' in data:
            absence_type.name_de = data['name_de']
        if 'name_en' in data:
            absence_type.name_en = data['name_en']
        if 'color' in data:
            absence_type.color = data['color']
        if 'is_active' in data:
            absence_type.is_active = data['is_active']

        # Save changes
        db.session.commit()

        return absence_type

    @staticmethod
    def delete(type_id):
        """
        Delete absence type (soft delete by setting is_active=False).

        Args:
            type_id (int): Absence type ID

        Returns:
            AbsenceType: Deleted absence type

        Raises:
            ValueError: If type not found
        """
        absence_type = AbsenceTypeService.get_by_id(type_id)
        if not absence_type:
            raise ValueError(f'Absence type with ID {type_id} not found')

        # Soft delete
        absence_type.is_active = False
        db.session.commit()

        return absence_type

    @staticmethod
    def hard_delete(type_id):
        """
        Permanently delete absence type from database.

        Args:
            type_id (int): Absence type ID

        Returns:
            AbsenceType: Deleted absence type

        Raises:
            ValueError: If type not found or has dependencies
        """
        absence_type = AbsenceTypeService.get_by_id(type_id)
        if not absence_type:
            raise ValueError(f'Absence type with ID {type_id} not found')

        # Check if type is used in any absences
        from app.models.absence import EmployeeAbsence
        count = EmployeeAbsence.query.filter(
            EmployeeAbsence.absence_type == absence_type.name
        ).count()

        if count > 0:
            raise ValueError(
                f'Cannot delete absence type "{absence_type.name}" '
                f'because it is used in {count} absence record(s). '
                f'Use soft delete instead.'
            )

        # Hard delete
        db.session.delete(absence_type)
        db.session.commit()

        return absence_type
