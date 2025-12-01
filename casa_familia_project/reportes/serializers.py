from rest_framework import serializers
from transacciones.models import Donacion

class ConciliacionSerializer(serializers.ModelSerializer):
    """
    Serializer para el reporte de conciliación contable.
    Expone los datos del socio y la transacción de forma plana.
    """
    
    # Obtenemos los campos de los modelos relacionados (Socio)
    socio_rut = serializers.CharField(source='id_socio.rut', read_only=True)
    socio_nombre = serializers.CharField(source='id_socio.__str__', read_only=True)
    metodo_pago = serializers.CharField(source='id_metodo_pago.nombre', read_only=True)
    campana = serializers.CharField(source='id_campana.nombre', read_only=True, default=None)

    class Meta:
        model = Donacion
        # Los campos exactos que necesita el contador
        fields = [
            'id',               # ID de la Donación
            'fecha_donacion',
            'monto',
            'estado',
            'comprobante_id',   # ID de Transbank
            'metodo_pago',
            'socio_rut',
            'socio_nombre',
            'campana',
        ]