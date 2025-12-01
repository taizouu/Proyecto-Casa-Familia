from rest_framework import serializers
from .models import Socio

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = [
            'id', 'rut', 'nombre', 'apellido_paterno', 'apellido_materno', 
            'email', 'telefono', 'direccion', 'zona', 'fecha_nacimiento', 'activo',
            'fecha_registro', 'captador_por'
        ]
        
        read_only_fields = ['fecha_registro', 'captador_por']

class ResumenSocioInfoSerializer(serializers.ModelSerializer):
    # 1. IMPORTANTE: Declaramos el campo explícitamente
    estado_donacion = serializers.SerializerMethodField()

    class Meta:
        model = Socio
        # 2. Agregamos 'estado_donacion' a la lista de campos visibles
        fields = ['nombre', 'apellido_paterno', 'email', 'zona', 'estado_donacion']

    def get_estado_donacion(self, obj):
        # Esta lógica estaba perfecta, la dejamos igual
        ultima_donacion = obj.donacion_set.order_by('-fecha_donacion').first()
        if ultima_donacion:
            return ultima_donacion.estado
        return "Sin Donación"