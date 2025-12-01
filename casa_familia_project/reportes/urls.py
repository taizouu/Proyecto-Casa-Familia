# reportes/urls.py
from django.urls import path
from . import views

# Esta es una ruta manual, no usa el router
urlpatterns = [
    path(
        'dashboard/', 
        views.ReportesDashboardView.as_view(), 
        name='reportes-dashboard'
    ),
    
    path(
        'conciliacion/',
        views.ReporteConciliacionView.as_view(),
        name='reporte-conciliacion'
    ),
]