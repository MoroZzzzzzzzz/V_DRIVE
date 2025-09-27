import os
import uuid
import hashlib
import hmac
import time
import pyotp
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

class TwoFactorAuth:
    """Two-factor authentication service for VELES DRIVE"""
    
    @staticmethod
    def generate_secret() -> str:
        """Generate a new 2FA secret key"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(email: str, secret: str, issuer: str = "VELES DRIVE") -> str:
        """Generate QR code for 2FA setup"""
        try:
            totp = pyotp.TOTP(secret)
            provisioning_uri = totp.provisioning_uri(
                name=email,
                issuer_name=issuer
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"QR code generation error: {e}")
            return ""
    
    @staticmethod
    def verify_token(secret: str, token: str, window: int = 1) -> bool:
        """Verify 2FA token"""
        try:
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=window)
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return False
    
    @staticmethod
    def generate_backup_codes(count: int = 8) -> List[str]:
        """Generate backup codes for 2FA"""
        codes = []
        for _ in range(count):
            code = ''.join([str(uuid.uuid4()).replace('-', '')[:8].upper()])
            # Format as XXXX-XXXX
            formatted_code = f"{code[:4]}-{code[4:8]}"
            codes.append(formatted_code)
        return codes

class SecurityService:
    """Advanced security service for VELES DRIVE"""
    
    def __init__(self):
        self.failed_attempts = {}  # IP -> attempts count
        self.blocked_ips = {}      # IP -> block_until timestamp
        self.suspicious_activities = []
        
    def is_ip_blocked(self, ip_address: str) -> bool:
        """Check if IP is currently blocked"""
        if ip_address in self.blocked_ips:
            block_until = self.blocked_ips[ip_address]
            if datetime.now(timezone.utc) < block_until:
                return True
            else:
                # Unblock expired IP
                del self.blocked_ips[ip_address]
        return False
    
    def record_failed_attempt(self, ip_address: str, user_id: str = None) -> Dict[str, Any]:
        """Record failed login attempt and apply rate limiting"""
        current_time = datetime.now(timezone.utc)
        
        # Initialize or increment failed attempts
        if ip_address not in self.failed_attempts:
            self.failed_attempts[ip_address] = {
                'count': 0,
                'first_attempt': current_time,
                'last_attempt': current_time
            }
        
        attempts = self.failed_attempts[ip_address]
        attempts['count'] += 1
        attempts['last_attempt'] = current_time
        
        # Calculate time window (reset after 1 hour)
        time_window = timedelta(hours=1)
        if current_time - attempts['first_attempt'] > time_window:
            # Reset counter
            attempts['count'] = 1
            attempts['first_attempt'] = current_time
        
        # Determine action based on attempt count
        if attempts['count'] >= 10:
            # Block for 24 hours
            block_duration = timedelta(hours=24)
            self.blocked_ips[ip_address] = current_time + block_duration
            
            # Log security incident
            self.log_security_incident(
                type="ip_blocked",
                ip_address=ip_address,
                user_id=user_id,
                details=f"IP blocked after {attempts['count']} failed attempts"
            )
            
            return {
                "action": "blocked",
                "message": "IP заблокирован на 24 часа из-за множественных неудачных попыток входа",
                "retry_after": block_duration.total_seconds()
            }
            
        elif attempts['count'] >= 5:
            # Temporary slowdown
            return {
                "action": "slowdown",
                "message": f"Слишком много неудачных попыток. Осталось {10 - attempts['count']} попыток до блокировки",
                "wait_seconds": 30 * (attempts['count'] - 4)  # Progressive delay
            }
        
        return {
            "action": "continue",
            "attempts_remaining": 10 - attempts['count']
        }
    
    def clear_failed_attempts(self, ip_address: str):
        """Clear failed attempts for IP (after successful login)"""
        if ip_address in self.failed_attempts:
            del self.failed_attempts[ip_address]
    
    def log_security_incident(self, type: str, ip_address: str, user_id: str = None, details: str = ""):
        """Log security incidents for monitoring"""
        incident = {
            "id": str(uuid.uuid4()),
            "type": type,
            "ip_address": ip_address,
            "user_id": user_id,
            "details": details,
            "timestamp": datetime.now(timezone.utc),
            "severity": self.calculate_severity(type)
        }
        
        self.suspicious_activities.append(incident)
        
        # Keep only last 1000 incidents
        if len(self.suspicious_activities) > 1000:
            self.suspicious_activities = self.suspicious_activities[-1000:]
        
        logger.warning(f"Security incident: {type} from {ip_address} - {details}")
    
    def calculate_severity(self, incident_type: str) -> str:
        """Calculate incident severity"""
        severity_map = {
            "ip_blocked": "high",
            "multiple_failed_logins": "medium",
            "suspicious_activity": "medium",
            "unauthorized_access": "high",
            "data_breach_attempt": "critical"
        }
        return severity_map.get(incident_type, "low")
    
    def get_security_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate security report for admins"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        recent_incidents = [
            incident for incident in self.suspicious_activities
            if incident["timestamp"] > cutoff_time
        ]
        
        # Analyze incidents
        incident_types = {}
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for incident in recent_incidents:
            incident_type = incident["type"]
            incident_types[incident_type] = incident_types.get(incident_type, 0) + 1
            severity_counts[incident["severity"]] += 1
        
        return {
            "period_hours": hours,
            "total_incidents": len(recent_incidents),
            "incident_types": incident_types,
            "severity_breakdown": severity_counts,
            "blocked_ips": len(self.blocked_ips),
            "active_threats": [
                incident for incident in recent_incidents
                if incident["severity"] in ["high", "critical"]
            ],
            "recommendations": self.generate_security_recommendations(recent_incidents)
        }
    
    def generate_security_recommendations(self, incidents: List[Dict]) -> List[str]:
        """Generate security recommendations based on incidents"""
        recommendations = []
        
        if len(incidents) > 50:
            recommendations.append("Высокая активность подозрительных действий. Рассмотрите усиление мониторинга.")
        
        critical_incidents = [i for i in incidents if i["severity"] == "critical"]
        if critical_incidents:
            recommendations.append("Обнаружены критические инциденты безопасности. Требуется немедленное расследование.")
        
        blocked_ips = len(self.blocked_ips)
        if blocked_ips > 10:
            recommendations.append(f"Заблокировано {blocked_ips} IP адресов. Проверьте географическое распределение атак.")
        
        return recommendations

class DataEncryption:
    """Data encryption service for sensitive information"""
    
    def __init__(self):
        self.key = os.environ.get('ENCRYPTION_KEY', self.generate_key()).encode()
    
    @staticmethod
    def generate_key() -> str:
        """Generate encryption key"""
        return base64.urlsafe_b64encode(os.urandom(32)).decode()
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data (simple implementation)"""
        try:
            # Simple HMAC-based encryption for demo
            # In production, use proper encryption like Fernet
            timestamp = str(int(time.time()))
            message = f"{timestamp}:{data}"
            signature = hmac.new(
                self.key,
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            encrypted = base64.b64encode(f"{signature}:{message}".encode()).decode()
            return encrypted
            
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return data  # Fallback to unencrypted (not recommended for production)
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> Optional[str]:
        """Decrypt sensitive data"""
        try:
            # Decode and verify
            decoded = base64.b64decode(encrypted_data).decode()
            signature, message = decoded.split(':', 1)
            
            # Verify signature
            expected_signature = hmac.new(
                self.key,
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if hmac.compare_digest(signature, expected_signature):
                timestamp, data = message.split(':', 1)
                return data
            else:
                logger.warning("Data decryption failed: invalid signature")
                return None
                
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return None

class AuditLog:
    """Audit logging service for compliance and security monitoring"""
    
    def __init__(self):
        self.logs = []
    
    def log_user_action(self, user_id: str, action: str, resource: str = None, 
                       ip_address: str = None, details: Dict = None):
        """Log user actions for audit trail"""
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "details": details or {},
            "session_id": details.get("session_id") if details else None
        }
        
        self.logs.append(log_entry)
        
        # Keep only last 10000 logs
        if len(self.logs) > 10000:
            self.logs = self.logs[-10000:]
        
        logger.info(f"Audit log: {user_id} - {action} - {resource}")
    
    def get_user_activity(self, user_id: str, days: int = 30) -> List[Dict]:
        """Get user activity history"""
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        return [
            log for log in self.logs
            if log["user_id"] == user_id and log["timestamp"] > cutoff_date
        ]
    
    def get_audit_report(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate audit report for date range"""
        relevant_logs = [
            log for log in self.logs
            if start_date <= log["timestamp"] <= end_date
        ]
        
        # Analyze logs
        action_counts = {}
        user_activity = {}
        
        for log in relevant_logs:
            action = log["action"]
            user_id = log["user_id"]
            
            action_counts[action] = action_counts.get(action, 0) + 1
            
            if user_id not in user_activity:
                user_activity[user_id] = {"actions": 0, "first_activity": log["timestamp"]}
            user_activity[user_id]["actions"] += 1
        
        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_actions": len(relevant_logs),
            "unique_users": len(user_activity),
            "action_breakdown": action_counts,
            "most_active_users": sorted(
                user_activity.items(),
                key=lambda x: x[1]["actions"],
                reverse=True
            )[:10]
        }

# Global instances
two_factor_auth = TwoFactorAuth()
security_service = SecurityService()
data_encryption = DataEncryption()
audit_log = AuditLog()