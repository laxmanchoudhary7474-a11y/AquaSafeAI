from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Tuple, List, Dict
import logging

from app.models.reading import SensorReading
from app.models.source import WaterSource, RiskLevel, TrendDirection
from app.models.prediction import Prediction, RiskFactor, Direction

logger = logging.getLogger(__name__)

class RiskEngine:
    # Baseline window size
    WINDOW_SIZE = 50
    
    # Heuristic weights for multi-parameter risk
    WEIGHTS = {
        "turbidity": 0.35,
        "tds": 0.25,
        "conductivity": 0.25,
        "ph": 0.15
    }

    def evaluate_risk(self, current_reading: SensorReading, db: Session) -> Prediction:
        # 1. Fetch historical data for baseline
        recent_readings = db.query(SensorReading)\
            .filter(SensorReading.source_id == current_reading.source_id)\
            .order_by(desc(SensorReading.captured_at))\
            .limit(self.WINDOW_SIZE)\
            .all()

        if len(recent_readings) < 5:
            # Not enough data for baseline, return LOW risk safely
            return self._create_baseline_prediction(current_reading, db)

        # 2. Calculate baseline (simple mean)
        baselines = {
            "turbidity": sum(r.turbidity for r in recent_readings) / len(recent_readings),
            "tds": sum(r.tds for r in recent_readings) / len(recent_readings),
            "conductivity": sum(r.conductivity for r in recent_readings) / len(recent_readings),
            "ph": sum(r.ph for r in recent_readings) / len(recent_readings),
        }

        # 3. Calculate deviations and anomaly score
        factors = []
        total_anomaly_score = 0.0

        for param, weight in self.WEIGHTS.items():
            current_val = getattr(current_reading, param)
            baseline_val = baselines[param]
            
            # Avoid division by zero
            if baseline_val == 0:
                baseline_val = 0.001
                
            percent_change = ((current_val - baseline_val) / baseline_val) * 100
            
            # Absolute change for anomaly calculation
            abs_change = abs(percent_change)
            
            # If change > 5%, it starts contributing to risk
            if abs_change > 5.0:
                contribution = min(100.0, abs_change) * weight
                total_anomaly_score += contribution
                
                direction = Direction.UP if percent_change > 0 else Direction.DOWN
                explanation = f"{param.upper()} is {'rising above' if direction == Direction.UP else 'dropping below'} source baseline by {abs_change:.1f}%."
                if param == "ph":
                    explanation = f"pH shifted by {abs_change:.1f}% from baseline."
                
                factors.append(RiskFactor(
                    parameter=param,
                    direction=direction,
                    relative_change=percent_change,
                    contribution=contribution,
                    explanation=explanation
                ))
                
                # Attach baseline and current for frontend use
                setattr(factors[-1], "baseline", baseline_val)
                setattr(factors[-1], "current", current_val)

        # 4. Calculate Risk Score (0-100)
        risk_score = min(100.0, total_anomaly_score * 1.5) # Scale up slightly to make demo visible
        
        # 5. Determine Risk Level
        if risk_score >= 75:
            risk_level = RiskLevel.CRITICAL
        elif risk_score >= 50:
            risk_level = RiskLevel.HIGH
        elif risk_score >= 25:
            risk_level = RiskLevel.MODERATE
        else:
            risk_level = RiskLevel.LOW

        # 6. Determine Trend (comparing to the most recent previous reading)
        trend = TrendDirection.STABLE
        if len(recent_readings) > 1:
            prev_reading = recent_readings[1]
            if current_reading.turbidity > prev_reading.turbidity * 1.05:
                trend = TrendDirection.RISING
            elif current_reading.turbidity < prev_reading.turbidity * 0.95:
                trend = TrendDirection.FALLING

        # 7. Generate Explanation & Multi-Parameter Logic
        explanation = "Water quality is stable and within normal baseline parameters."
        
        parameter_change_count = len(factors)
        
        if risk_score >= 25:
            if parameter_change_count >= 3:
                explanation = f"MULTI-PARAMETER DETERIORATION: {parameter_change_count} parameters are moving away from baseline in a sustained direction."
            elif parameter_change_count == 1 and factors[0].parameter == "turbidity" and factors[0].relative_change > 20.0:
                explanation = "ISOLATED TURBIDITY ANOMALY: Turbidity has increased sharply while the other monitored parameters remain relatively stable."
            else:
                sorted_factors = sorted(factors, key=lambda x: x.contribution, reverse=True)
                top_factors = [f.parameter for f in sorted_factors[:2]]
                explanation = f"Deterioration detected. Primary factors: {', '.join(top_factors)}. "
                explanation += " ".join([f.explanation for f in sorted_factors[:2]])

        # 8. Save Prediction
        prediction = Prediction(
            source_id=current_reading.source_id,
            reading_id=current_reading.id,
            anomaly_score=total_anomaly_score,
            risk_score=risk_score,
            risk_level=risk_level,
            input_quality=current_reading.quality_status.value,
            explanation=explanation
        )
        
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        for factor in factors:
            factor.prediction_id = prediction.id
            db.add(factor)
        
        # 9. Update WaterSource
        source = db.query(WaterSource).filter(WaterSource.id == current_reading.source_id).first()
        source.safety_score = 100.0 - risk_score
        source.risk_level = risk_level
        source.trend = trend
        db.commit()

        # Attach factors for realtime broadcast without hitting db again
        prediction.active_factors = factors
        return prediction

    def _create_baseline_prediction(self, current_reading, db):
        prediction = Prediction(
            source_id=current_reading.source_id,
            reading_id=current_reading.id,
            anomaly_score=0.0,
            risk_score=0.0,
            risk_level=RiskLevel.LOW,
            input_quality=current_reading.quality_status.value,
            explanation="Establishing baseline. Not enough historical data to estimate risk."
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        prediction.active_factors = []
        return prediction

risk_engine = RiskEngine()
