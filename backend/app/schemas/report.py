from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ReportFilterRequest(BaseModel):
    report_type: str = "summary"  # summary, incident, location, shelter, resource, medical
    incident_id: Optional[int] = None
    district: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    format: Optional[str] = "pdf" # pdf or excel

class ReportSummaryResponse(BaseModel):
    title: str
    generated_at: str
    generated_by: str
    metrics: Dict[str, Any]
    incident_summary: List[Dict[str, Any]]
    district_summary: List[Dict[str, Any]]
    shelter_summary: List[Dict[str, Any]]
    resource_summary: List[Dict[str, Any]]
    recommendations: List[str]
