# reportes/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, functions
from gestion.models import Socio
import csv
from django.http import HttpResponse
from rest_framework import generics
from transacciones.models import Donacion
from .serializers import ConciliacionSerializer
from datetime import timedelta # Para el filtro de fecha

# (Importamos esto para la validación de fechas)
from django.utils.dateparse import parse_date

class ReportesDashboardView(APIView):
    """
    API endpoint para los KPIs del Dashboard.
    Ahora incluye filtros dinámicos (Sprint 8).
    """

    def _get_filtered_queryset(self, request):
        """
        Función helper para aplicar todos los filtros
        basados en los query params de la URL.
        """
        # 1. Partimos del queryset base
        queryset = Socio.objects.filter(activo=True)
        
        # 2. Aplicar filtros dinámicos
        
        # Filtro por Rango de Fechas (fecha_registro)
        fecha_inicio_str = request.query_params.get('fecha_inicio')
        fecha_fin_str = request.query_params.get('fecha_fin')
        
        if fecha_inicio_str:
            fecha_inicio = parse_date(fecha_inicio_str)
            if fecha_inicio:
                queryset = queryset.filter(fecha_registro__gte=fecha_inicio)
        
        if fecha_fin_str:
            fecha_fin = parse_date(fecha_fin_str)
            if fecha_fin:
                # (Añadimos un día para que incluya el día final)
                from datetime import timedelta
                queryset = queryset.filter(fecha_registro__lte=fecha_fin + timedelta(days=1))

        # Filtro por Zona
        zona = request.query_params.get('zona')
        if zona:
            queryset = queryset.filter(zona__iexact=zona) # 'iexact' ignora mayúsculas

        # Filtro por Captador (ID)
        captador_id = request.query_params.get('captador_id')
        if captador_id:
            queryset = queryset.filter(captador_por__id=captador_id)
            
        return queryset

    def get(self, request, format=None):
        
        # Obtenemos el queryset ya filtrado
        filtered_queryset = self._get_filtered_queryset(request)

        # 1. KPI: Socios por Captador (sobre los datos filtrados)
        socios_por_captador = (
            filtered_queryset
            .values('captador_por__nombre_usuario')
            .annotate(total_socios=Count('id'))
            .order_by('-total_socios')
        )
        
        # 2. KPI: Socios por Zona (sobre los datos filtrados)
        socios_por_zona = (
            filtered_queryset
            .values('zona')
            .annotate(total_socios=Count('id'))
            .order_by('-total_socios')
        )
        
        # 3. KPI: Socios por Horario (sobre los datos filtrados)
        socios_por_hora = (
            filtered_queryset
            .annotate(hora_registro=functions.ExtractHour('fecha_registro'))
            .values('hora_registro')
            .annotate(total_socios=Count('id'))
            .order_by('hora_registro')
        )
        
        # 4. KPI: Exportación CSV (sobre los datos filtrados)
        if request.query_params.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="reporte_socios.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Captador', 'Total Socios'])
            for item in socios_por_captador:
                writer.writerow([item['captador_por__nombre_usuario'], item['total_socios']])
            
            # (Podríamos añadir más datos al CSV aquí)
            
            return response

        # Devolvemos el JSON con los KPIs filtrados
        return Response({
            'kpi_socios_por_captador': list(socios_por_captador),
            'kpi_socios_por_zona': list(socios_por_zona),
            'kpi_socios_por_hora': list(socios_por_hora),
        })
    

class ReporteConciliacionView(generics.ListAPIView):
    """
    API endpoint para el reporte de conciliación contable.
    Permite filtrar por rango de fechas y estado.
    Soporta exportación a CSV.
    """
    serializer_class = ConciliacionSerializer

    def get_queryset(self):
        """
        Filtra el queryset basado en los query params de la URL.
        """
        queryset = Donacion.objects.select_related(
            'id_socio', 
            'id_metodo_pago', 
            'id_campana'
        ).all()
        
        # Filtro por Rango de Fechas (fecha_donacion)
        fecha_inicio_str = self.request.query_params.get('fecha_inicio')
        fecha_fin_str = self.request.query_params.get('fecha_fin')
        
        if fecha_inicio_str:
            fecha_inicio = parse_date(fecha_inicio_str)
            if fecha_inicio:
                queryset = queryset.filter(fecha_donacion__gte=fecha_inicio)
        
        if fecha_fin_str:
            fecha_fin = parse_date(fecha_fin_str)
            if fecha_fin:
                queryset = queryset.filter(fecha_donacion__lte=fecha_fin + timedelta(days=1))

        # Filtro por Estado (ej: 'Completada')
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado__iexact=estado)
            
        return queryset.order_by('fecha_donacion')

    def get(self, request, *args, **kwargs):
        """
        Sobrescribimos el método GET para manejar la exportación a CSV.
        """
        # Si el formato es CSV, generamos el archivo
        if request.query_params.get('format') == 'csv':
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="reporte_conciliacion.csv"'
            
            # Usamos el serializer para obtener los headers
            headers = serializer.data[0].keys() if queryset.exists() else []
            writer = csv.DictWriter(response, fieldnames=headers)
            
            writer.writeheader()
            for row in serializer.data:
                writer.writerow(row)
                
            return response
        
        # Si no es CSV, devolvemos el JSON normal
        return super().get(request, *args, **kwargs)