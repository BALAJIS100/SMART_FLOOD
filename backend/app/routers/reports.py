from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.report import ReportFilterRequest
from app.auth.security import get_current_user
from app.services.report_generator import generate_report_data
from app.utils.pdf_exporter import build_pdf_report
from app.utils.excel_exporter import build_excel_report
from app.services.audit_service import log_action

router = APIRouter(prefix="/reports", tags=["Reporting"])

@router.post("/generate")
def generate_report(
    payload: ReportFilterRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    data = generate_report_data(
        db=db,
        report_type=payload.report_type,
        incident_id=payload.incident_id,
        district=payload.district,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        user_name=current_user.full_name
    )
    log_action(db, user_name=current_user.full_name, action="GENERATE_REPORT", module="Reports", record_id=None, details=f"Generated {payload.report_type} report", user_id=current_user.id)
    return data

@router.post("/export/pdf")
def export_pdf_report(
    payload: ReportFilterRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    data = generate_report_data(
        db=db,
        report_type=payload.report_type,
        incident_id=payload.incident_id,
        district=payload.district,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        user_name=current_user.full_name
    )
    pdf_bytes = build_pdf_report(data)
    log_action(db, user_name=current_user.full_name, action="EXPORT_PDF", module="Reports", record_id=None, details=f"Exported PDF for {payload.report_type} report", user_id=current_user.id)
    
    filename = f"Flood_Rescue_Report_{payload.report_type}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/export/excel")
def export_excel_report(
    payload: ReportFilterRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    data = generate_report_data(
        db=db,
        report_type=payload.report_type,
        incident_id=payload.incident_id,
        district=payload.district,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
        user_name=current_user.full_name
    )
    excel_bytes = build_excel_report(data)
    log_action(db, user_name=current_user.full_name, action="EXPORT_EXCEL", module="Reports", record_id=None, details=f"Exported Excel for {payload.report_type} report", user_id=current_user.id)
    
    filename = f"Flood_Rescue_Report_{payload.report_type}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
