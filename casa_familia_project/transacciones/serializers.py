from rest_framework import serializers
from .models import MetodoPago, Campana, Donacion
from gestion.models import Socio 
from gestion.serializers import ResumenSocioInfoSerializer

class MetodoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoPago
        fields = ['id', 'nombre']


class CampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campana
        fields = '__all__' 


class DonacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donacion
        fields = '__all__'
        read_only_fields = ['fecha_donacion', 'estado', 'comprobante_id']

class IniciarDonacionSerializer(serializers.Serializer):
    id_socio = serializers.PrimaryKeyRelatedField(queryset=Socio.objects.all())
    id_metodo_pago = serializers.PrimaryKeyRelatedField(queryset=MetodoPago.objects.all())
    id_campana = serializers.PrimaryKeyRelatedField(
        queryset=Campana.objects.all(), 
        required=False, 
        allow_null=True 
    )

    monto = serializers.DecimalField(max_digits=10, decimal_places=2)

class ResumenDonacionSerializer(serializers.ModelSerializer):
    id_socio = ResumenSocioInfoSerializer(read_only=True)
    
    class Meta:
        model = Donacion
        fields = ['id', 'monto', 'estado', 'fecha_donacion', 'id_socio']
