from app.schemas.reading import IngestPayload
from app.models.reading import QualityStatus
from typing import Tuple, List

class DataQualityService:
    # Basic bounds for realistic sensor data
    BOUNDS = {
        "ph": (0.0, 14.0),
        "turbidity": (0.0, 1000.0), # NTU
        "tds": (0.0, 5000.0), # ppm
        "conductivity": (0.0, 10000.0), # µS/cm
        "temperature": (-10.0, 50.0) # Celsius
    }

    @staticmethod
    def validate_payload(payload: IngestPayload) -> Tuple[QualityStatus, List[str]]:
        flags = []
        status = QualityStatus.VALID
        readings = payload.readings

        for param, (min_val, max_val) in DataQualityService.BOUNDS.items():
            val = getattr(readings, param)
            if val is None:
                flags.append(f"Missing {param}")
                status = QualityStatus.INVALID
            elif val < min_val or val > max_val:
                flags.append(f"{param} out of bounds ({val})")
                if status != QualityStatus.INVALID:
                    status = QualityStatus.WARNING

        if len(flags) > 0 and status == QualityStatus.VALID:
            status = QualityStatus.WARNING

        return status, flags

data_quality_service = DataQualityService()
