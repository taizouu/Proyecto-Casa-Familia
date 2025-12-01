from django.shortcuts import render
from rest_framework import viewsets
from .models import Socio
from .serializers import SocioSerializer
from transacciones.models import Donacion
from transacciones.serializers import ResumenSocioInfoSerializer
from .models import Socio 
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.select_related('captador_por').all().order_by('-fecha_registro')
    serializer_class = SocioSerializer

    def perform_create(self, serializer):
        serializer.save(captador_por=self.request.user)

class ResumenCaptadorView(ListAPIView):
    serializer_class = ResumenSocioInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        captador_actual = self.request.user
        queryset = Socio.objects.filter(
            captador_por=captador_actual
        ).order_by('-fecha_registro')

        return queryset