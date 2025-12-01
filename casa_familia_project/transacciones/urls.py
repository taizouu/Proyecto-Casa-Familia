from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'metodos-pago', views.MetodoPagoViewSet)
router.register(r'campanas', views.CampanaViewSet)
router.register(r'donaciones', views.DonacionViewSet)

urlpatterns = [
    path(
        'webpay-confirm/', 
        views.WebpayConfirmView.as_view(), 
        name='webpay-confirm'
    ),
    path('', include(router.urls)),
]