from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class PredictionResponse(BaseModel):
    default_probability: float = Field(
        ..., 
        description="Probability of default, from 0.0 to 1.0", 
        ge=0.0, 
        le=1.0
    )
    risk_score: int = Field(
        ..., 
        description="Calculated credit risk score, from 0 to 100", 
        ge=0, 
        le=100
    )
    risk_category: str = Field(
        ..., 
        description="Risk category classification (Low Risk, Medium Risk, High Risk)"
    )
    feature_importance: Dict[str, float] = Field(
        ..., 
        description="Calculated feature importance contribution percentages (must sum to approximately 100%)"
    )
    diagnostics: Optional[Dict[str, Any]] = Field(
        None,
        description="Developer diagnostic info for debugging"
    )

