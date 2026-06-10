from pydantic import BaseModel, Field, field_validator
from typing import Literal

class BorrowerData(BaseModel):
    age: int = Field(..., description="Age of the borrower", ge=18, le=120)
    annual_income: float = Field(..., description="Annual income in USD", gt=0)
    employment_length: float = Field(..., description="Employment length in years", ge=0, le=60)
    loan_amount: float = Field(..., description="Loan amount requested in USD", gt=0)
    loan_intent: Literal[
        "PERSONAL", "EDUCATION", "MEDICAL", "VENTURE", "HOMEIMPROVEMENT", "DEBTCONSOLIDATION"
    ] = Field(..., description="The purpose of the loan")
    home_ownership: Literal["RENT", "MORTGAGE", "OWN", "OTHER"] = Field(
        ..., description="Home ownership status"
    )
    credit_history_length: int = Field(..., description="Length of credit history in years", ge=0, le=60)
    previous_defaults: Literal["Y", "N"] = Field(
        ..., description="Has the borrower defaulted before? ('Y' or 'N')"
    )
    loan_int_rate: float = Field(..., description="Interest rate of the loan (percentage, e.g., 11.5)", ge=1.0, le=35.0)
    loan_grade: Literal["A", "B", "C", "D", "E", "F", "G"] = Field(..., description="Loan grade classification")

    @field_validator("age")
    @classmethod
    def validate_age_vs_emp_len(cls, v: int, info) -> int:
        # Check if age makes sense compared to employment length
        emp_len = info.data.get("employment_length")
        if emp_len is not None and v - emp_len < 14:
            raise ValueError("Age must be at least 14 years greater than employment length")
        return v

    @field_validator("credit_history_length")
    @classmethod
    def validate_credit_history(cls, v: int, info) -> int:
        age = info.data.get("age")
        if age is not None and v >= age:
            raise ValueError("Credit history length cannot exceed or equal borrower age")
        return v

