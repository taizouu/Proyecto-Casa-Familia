from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="API Proyecto Casa Familia",
      default_version='v1',
      description="""Documentación de la API para el proyecto de título 'Sistema de Gestión, 
                   Captación y Donaciones para la Fundación Casa Familia'.
                   Desarrollado por Guido Soto.""",
      contact=openapi.Contact(email="guido.sc15@gmail.com"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,), 
)

urlpatterns = [
    re_path(
        r'^swagger(?P<format>\.json|\.yaml)$', 
        schema_view.without_ui(cache_timeout=0), 
        name='schema-json'
    ),
    path(
        'swagger/', 
        schema_view.with_ui('swagger', cache_timeout=0), 
        name='schema-swagger-ui'
    ),
    path(
        'redoc/', 
        schema_view.with_ui('redoc', cache_timeout=0), 
        name='schema-redoc'
    ),
    path('admin/', admin.site.urls),
    path('api/auth/', include('usuarios.urls')),
    path('api/gestion/', include('gestion.urls')),
    path('api/transacciones/', include('transacciones.urls')),
    path('api/reportes/', include('reportes.urls')),
]