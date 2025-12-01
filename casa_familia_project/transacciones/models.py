from django.db import models
from gestion.models import Socio 

class MetodoPago(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Campana(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    meta_recaudacion = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Donacion(models.Model):
    ESTADO_PENDIENTE = 'Pendiente'
    ESTADO_COMPLETADA = 'Completada'
    ESTADO_FALLIDA = 'Fallida'
    ESTADO_OPCIONES = [
        (ESTADO_PENDIENTE, 'Pendiente'),
        (ESTADO_COMPLETADA, 'Completada'),
        (ESTADO_FALLIDA, 'Fallida'),
    ]

    id_socio = models.ForeignKey(Socio, on_delete=models.PROTECT)
    id_campana = models.ForeignKey(
        Campana, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="donaciones"
    )
    id_metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.SET_NULL, null=True, blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_donacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES, default=ESTADO_PENDIENTE)
    comprobante_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Donación {self.id} - {self.id_socio.nombre} - {self.monto}"