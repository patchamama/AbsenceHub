"""API routes for audit logs."""
from flask import Blueprint, jsonify, request
from app import db
from app.models.audit_log import AuditLog
from sqlalchemy import desc

audit_bp = Blueprint('audit', __name__)


@audit_bp.route('/audit-logs', methods=['GET'])
def get_audit_logs():
    """
    Get all audit logs with optional filtering.

    Query Parameters:
        - action: Filter by action type (CREATE, UPDATE, DELETE)
        - entity_id: Filter by entity ID
        - limit: Limit number of results (default: 100, max: 1000)
        - offset: Number of records to skip (default: 0)

    Returns:
        JSON response with audit logs
    """
    try:
        # Build query
        query = AuditLog.query

        # Apply filters
        action = request.args.get('action')
        if action:
            action = action.upper()
            if action in ['CREATE', 'UPDATE', 'DELETE']:
                query = query.filter(AuditLog.action == action)

        entity_id = request.args.get('entity_id')
        if entity_id:
            try:
                entity_id = int(entity_id)
                query = query.filter(AuditLog.entity_id == entity_id)
            except ValueError:
                pass  # Invalid entity_id, skip filter

        # Pagination
        limit = request.args.get('limit', 100, type=int)
        limit = min(limit, 1000)  # Cap at 1000
        offset = request.args.get('offset', 0, type=int)

        # Order by timestamp descending (most recent first)
        query = query.order_by(desc(AuditLog.timestamp))

        # Execute query with pagination
        total_count = query.count()
        logs = query.limit(limit).offset(offset).all()

        return jsonify({
            'success': True,
            'data': [log.to_dict() for log in logs],
            'meta': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'returned': len(logs)
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error retrieving audit logs: {str(e)}'
        }), 500


@audit_bp.route('/audit-logs/<int:log_id>', methods=['GET'])
def get_audit_log(log_id):
    """
    Get a specific audit log by ID.

    Args:
        log_id: Audit log ID

    Returns:
        JSON response with audit log details
    """
    log = AuditLog.query.get(log_id)

    if not log:
        return jsonify({
            'success': False,
            'error': 'Audit log not found'
        }), 404

    return jsonify({
        'success': True,
        'data': log.to_dict()
    }), 200


@audit_bp.route('/audit-logs/stats', methods=['GET'])
def get_audit_stats():
    """
    Get statistics about audit logs.

    Returns:
        JSON response with statistics
    """
    try:
        from sqlalchemy import func

        # Count by action type
        action_counts = db.session.query(
            AuditLog.action,
            func.count(AuditLog.id).label('count')
        ).group_by(AuditLog.action).all()

        stats = {
            'total_logs': AuditLog.query.count(),
            'by_action': {action: count for action, count in action_counts},
            'latest_log': None
        }

        # Get latest log
        latest = AuditLog.query.order_by(desc(AuditLog.timestamp)).first()
        if latest:
            stats['latest_log'] = latest.to_dict()

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error retrieving audit stats: {str(e)}'
        }), 500


@audit_bp.route('/audit-logs', methods=['DELETE'])
def delete_audit_logs():
    """
    Delete audit logs with optional filtering.

    Query Parameters:
        - action: Filter by action type (CREATE, UPDATE, DELETE)
                  If not provided, deletes ALL logs

    Returns:
        JSON response with deletion result
    """
    try:
        # Build query
        query = AuditLog.query

        # Apply filter if provided
        action = request.args.get('action')
        if action:
            action = action.upper()
            if action in ['CREATE', 'UPDATE', 'DELETE']:
                query = query.filter(AuditLog.action == action)

        # Count logs to be deleted
        count_to_delete = query.count()

        # Delete logs
        query.delete(synchronize_session=False)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Successfully deleted {count_to_delete} audit log(s)',
            'deleted_count': count_to_delete
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error deleting audit logs: {str(e)}'
        }), 500
