import enum
import random

class SimulationScenario(str, enum.Enum):
    NORMAL = "NORMAL"
    TURBIDITY_SPIKE = "TURBIDITY_SPIKE"
    TDS_RISE = "TDS_RISE"
    CONDUCTIVITY_RISE = "CONDUCTIVITY_RISE"
    PH_SHIFT = "PH_SHIFT"
    MULTI_PARAMETER_DETERIORATION = "MULTI_PARAMETER_DETERIORATION"
    DEVICE_OFFLINE = "DEVICE_OFFLINE"
    RECOVERY = "RECOVERY"
    DATA_QUALITY_SPIKE = "DATA_QUALITY_SPIKE"

class BaseWaterProfile:
    # Healthy baseline explicitly set to match North Zone Reservoir demo baseline
    def __init__(self):
        self.ph = 7.20
        self.turbidity = 2.0
        self.tds = 310.0
        self.conductivity = 470.0
        self.temperature = 28.0

    def apply_noise(self):
        return {
            "ph": round(self.ph + random.uniform(-0.02, 0.02), 2),
            "turbidity": round(self.turbidity + random.uniform(-0.1, 0.1), 1),
            "tds": round(self.tds + random.uniform(-1.5, 1.5), 1),
            "conductivity": round(self.conductivity + random.uniform(-3.0, 3.0), 1),
            "temperature": round(self.temperature + random.uniform(-0.1, 0.1), 1),
        }

def get_next_reading(profile: BaseWaterProfile, scenario: SimulationScenario, step: int):
    current_phase_name = "NORMAL"
    progress = 0
    
    if scenario == SimulationScenario.MULTI_PARAMETER_DETERIORATION:
        # We model a 45-step deterioration (90 seconds at 2s/step)
        max_steps = 45
        progress = min(100, int((step / max_steps) * 100))
        
        if step < 5:
            current_phase_name = "NORMAL"
        elif step < 12:
            current_phase_name = "EARLY_CHANGE"
            # Turbidity 2.0 -> 2.6, TDS 310 -> 324
            profile.turbidity += 0.08
            profile.tds += 2.0
        elif step < 20:
            current_phase_name = "PATTERN_FORMING"
            # Conductivity and pH join
            profile.turbidity += 0.1
            profile.tds += 2.5
            profile.conductivity += 4.0
            profile.ph -= 0.015
            profile.temperature += 0.05
        elif step < 28:
            current_phase_name = "ANOMALY"
            profile.turbidity += 0.15
            profile.tds += 3.0
            profile.conductivity += 5.0
            profile.ph -= 0.02
            profile.temperature += 0.05
        elif step < 36:
            current_phase_name = "HIGH_RISK"
            profile.turbidity += 0.2
            profile.tds += 4.0
            profile.conductivity += 6.0
            profile.ph -= 0.02
        else:
            current_phase_name = "CRITICAL"
            profile.turbidity += 0.1
            profile.tds += 2.0
            profile.conductivity += 3.0
            profile.ph -= 0.01
            
            # Caps to prevent infinite growth if simulation runs forever
            profile.turbidity = min(profile.turbidity, 5.5)
            profile.tds = min(profile.tds, 385.0)
            profile.conductivity = min(profile.conductivity, 600.0)
            profile.ph = max(profile.ph, 6.95)

    elif scenario == SimulationScenario.TURBIDITY_SPIKE:
        current_phase_name = "TURBIDITY_SPIKE"
        profile.turbidity += 0.8
        profile.turbidity = min(profile.turbidity, 9.5)
    elif scenario == SimulationScenario.RECOVERY:
        current_phase_name = "RECOVERY"
        progress = min(100, int((step / 20) * 100))
        profile.turbidity = max(2.0, profile.turbidity - 0.5)
        profile.tds = max(310.0, profile.tds - 10.0)
        profile.conductivity = max(470.0, profile.conductivity - 15.0)
        profile.ph = min(7.20, profile.ph + 0.05)
        profile.temperature = max(28.0, profile.temperature - 0.1)
    
    readings = profile.apply_noise()

    # Apply data quality spike strictly to the noisy reading
    if scenario == SimulationScenario.DATA_QUALITY_SPIKE:
        current_phase_name = "QUALITY_WARNING"
        if step % 5 == 1:
            readings["turbidity"] = 37.0
            
    return readings, current_phase_name, progress

