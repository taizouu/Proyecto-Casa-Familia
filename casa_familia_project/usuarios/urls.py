from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from usuarios.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UsuarioActualView
router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet)
router.register(r'roles', views.RolViewSet)

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('yo/', UsuarioActualView.as_view(), name='usuario-actual'),
    path('', include(router.urls)),
]