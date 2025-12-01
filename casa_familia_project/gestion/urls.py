from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ResumenCaptadorView

router = DefaultRouter()
router.register(r'socios', views.SocioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('mi-resumen/', ResumenCaptadorView.as_view(), name='resumen-captador'),
]