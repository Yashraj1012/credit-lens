import type { BorrowerData, PredictionResult, AnalyticsResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.info = info;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errInfo = null;
    try {
      errInfo = await response.json();
    } catch {
      // ignore JSON parse errors for failed responses
    }
    
    const message = errInfo?.detail || `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errInfo);
  }
  return response.json() as Promise<T>;
}

export const creditApi = {
  /**
   * Submit borrower data to obtain risk prediction
   */
  async predict(data: BorrowerData): Promise<PredictionResult> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<PredictionResult>(response);
  },

  /**
   * Fetch model comparison, confusion matrix, ROC/PR curves, and statistics
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<AnalyticsResponse>(response);
  },
};
