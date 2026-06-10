from fastapi import APIRouter, Depends, HTTPException
from backend.models.request import BorrowerData
from backend.models.response import PredictionResponse
from backend.services.prediction_service import PredictionService

router = APIRouter(prefix="/predict", tags=["prediction"])

# Singleton prediction service instance
prediction_service = PredictionService()

def get_prediction_service() -> PredictionService:
    return prediction_service

@router.post("", response_model=PredictionResponse)
async def predict_risk(
    data: BorrowerData, 
    service: PredictionService = Depends(get_prediction_service)
):
    try:
        response = service.predict(data)
        return response
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An internal error occurred while predicting risk: {str(e)}"
        )
