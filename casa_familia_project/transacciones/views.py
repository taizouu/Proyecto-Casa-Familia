import qrcode
import base64
from io import BytesIO
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView 
from rest_framework.permissions import AllowAny 
from django.conf import settings 
from django.shortcuts import redirect 
from django.core.mail import send_mail 
from .services import WebpayService 
from .models import MetodoPago, Campana, Donacion
from .serializers import (
    MetodoPagoSerializer, CampanaSerializer, 
    DonacionSerializer, IniciarDonacionSerializer
)
from gestion.models import Socio 

class MetodoPagoViewSet(viewsets.ModelViewSet):
    queryset = MetodoPago.objects.all()
    serializer_class = MetodoPagoSerializer

class CampanaViewSet(viewsets.ModelViewSet):
    queryset = Campana.objects.all().order_by('-fecha_inicio')
    serializer_class = CampanaSerializer

class DonacionViewSet(viewsets.ModelViewSet):
    queryset = Donacion.objects.all().order_by('-fecha_donacion')
    serializer_class = DonacionSerializer
    
    def get_serializer_class(self):
        if self.action == 'iniciar_transaccion':
            return IniciarDonacionSerializer
        return DonacionSerializer

    @action(detail=False, methods=['post'])
    def iniciar_transaccion(self, request):
        
        # --- ZONA DE SEGURIDAD ---
        if not MetodoPago.objects.exists():
            try:
                MetodoPago.objects.create(nombre="Simulacion")
            except Exception: pass

        data_request = request.data.copy()
        if not data_request.get('id_metodo_pago'):
            metodo_por_defecto = MetodoPago.objects.first()
            if metodo_por_defecto:
                data_request['id_metodo_pago'] = metodo_por_defecto.id
        # -------------------------

        serializer = self.get_serializer(data=data_request)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            donacion = Donacion.objects.create(
                id_socio=data['id_socio'],
                id_metodo_pago=data['id_metodo_pago'],
                id_campana=data.get('id_campana'), 
                monto=data['monto'],
                estado=Donacion.ESTADO_PENDIENTE
            )
            
            amount = int(data['monto'])
            
            # =================================================================
            # 🔗 CAMBIO CRÍTICO: URL DIRECTA A YOUTUBE
            # =================================================================
            # Al poner esto, el QR apuntará directo al video. 
            # El celular abrirá la app de YouTube de inmediato.
            # Puedes cambiar este link por el video que quieras.
            url_pago = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1" 
            
            token = f"mock_token_{donacion.id}"

            # Enviar Correo (Opcional, también llevará a YouTube)
            try:
                send_mail(
                    subject='Gracias por tu aporte - Fundación Casa Familia',
                    message=f'¡Hola!\n\nGracias por tu donación de ${amount}.\nMira nuestro video de agradecimiento aquí:\n{url_pago}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[data['id_socio'].email], 
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error correo: {e}")

            # Generar Imagen QR
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(url_pago) # <--- Aquí se inyecta el link de YouTube
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
            qr_image_base64 = f"data:image/png;base64,{img_str}"

            return Response(
                {
                    "url_pago": url_pago,
                    "token": token,
                    "qr_image": qr_image_base64 
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WebpayConfirmView(APIView):
    permission_classes = [AllowAny] 
    
    def get(self, request, *args, **kwargs):
        token = request.GET.get("token_ws")

        if not token:
            return Response(
                {"error": "Pago anulado por el usuario."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            webpay_service = WebpayService()
            response_tbk = webpay_service.confirmar_transaccion(token)

            donacion = None
            try:
                donacion_id = int(response_tbk.buy_order)
                donacion = Donacion.objects.get(id=donacion_id)
            except (ValueError, Donacion.DoesNotExist):
                print("⚠️ [WebpayConfirm] ID no coinciden (Modo Mock). Buscando la última pendiente...")
                donacion = Donacion.objects.filter(estado=Donacion.ESTADO_PENDIENTE).last()

            if not donacion:
                return Response({"error": "Donación no encontrada"}, status=404)

            if response_tbk.is_approved():
                donacion.estado = Donacion.ESTADO_COMPLETADA
                donacion.comprobante_id = getattr(response_tbk, 'vci', 'MOCK_VCI')
                donacion.save()
                socio = donacion.id_socio
                socio.activo = True
                socio.save()
                return redirect(f"http://localhost:5173/payment-status/?estado=exito&id={donacion.id}")
            else:
                donacion.estado = Donacion.ESTADO_FALLIDA
                donacion.save()
                return redirect(f"http://localhost:5173/payment-status/?estado=fallido&id={donacion.id}")

        except Exception as e:
            print(f"Error en confirmación: {e}")
            return Response(
                {"error": f"Error al confirmar transacción: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )