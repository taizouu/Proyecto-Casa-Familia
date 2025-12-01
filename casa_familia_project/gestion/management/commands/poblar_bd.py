import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from django.db import IntegrityError
from django.contrib.auth import get_user_model

# Importamos TUS modelos exactos
from gestion.models import Socio
from transacciones.models import Donacion, MetodoPago, Campana
from usuarios.models import Rol

User = get_user_model()

class Command(BaseCommand):
    help = 'Genera datos masivos coherentes para Power BI'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('⚙️ Iniciando la fábrica de datos...'))
        
        # Configuración Chilena 🇨🇱
        fake = Faker(['es_CL'])

        # ---------------------------------------------------------
        # 1. ROLES (usuarios/models.py)
        # ---------------------------------------------------------
        rol_admin, _ = Rol.objects.get_or_create(nombre="Administrador")
        rol_captador, _ = Rol.objects.get_or_create(nombre="Captador")
        self.stdout.write("✅ Roles base verificados.")

        # ---------------------------------------------------------
        # 2. MÉTODOS DE PAGO (transacciones/models.py)
        # ---------------------------------------------------------
        lista_metodos = ['Webpay', 'Transferencia', 'Efectivo', 'Simulacion']
        objs_metodos = []
        for m in lista_metodos:
            obj, _ = MetodoPago.objects.get_or_create(nombre=m)
            objs_metodos.append(obj)
        self.stdout.write("✅ Métodos de pago listos.")

        # ---------------------------------------------------------
        # 3. CAMPAÑAS (transacciones/models.py)
        # ---------------------------------------------------------
        nombres_campanas = ['Colecta Nacional 2024', 'Cena Solidaria', 'Campaña Invierno', 'Socio Amigo']
        objs_campanas = []
        for nombre in nombres_campanas:
            fecha_ini = timezone.now() - timedelta(days=random.randint(100, 300))
            obj, created = Campana.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'descripcion': 'Campaña generada automáticamente',
                    'fecha_inicio': fecha_ini,
                    'fecha_fin': fecha_ini + timedelta(days=90),
                    'meta_recaudacion': 15000000,
                    'activa': True
                }
            )
            objs_campanas.append(obj)
        self.stdout.write("✅ Campañas históricas creadas.")

        # ---------------------------------------------------------
        # 4. CAPTADORES (usuarios/models.py)
        # ---------------------------------------------------------
        objs_captadores = []
        for _ in range(5):
            try:
                rut_fake = fake.unique.rut()
                email_fake = fake.unique.email()
                
                # Usamos create_user de tu UsuarioManager
                user = User.objects.create_user(
                    email=email_fake,
                    password='password123',
                    rut=rut_fake,
                    nombre=fake.first_name(),
                    apellido=fake.last_name(), # Tu modelo pide 'apellido', no 'last_name'
                    rol=rol_captador
                )
                objs_captadores.append(user)
            except IntegrityError:
                continue 
            except Exception as e:
                # Si falla por validación de RUT u otro, seguimos
                continue

        if not objs_captadores:
            objs_captadores = list(User.objects.filter(rol__nombre="Captador"))

        self.stdout.write(f"✅ Staff de Captadores: {len(objs_captadores)} activos.")

        # ---------------------------------------------------------
        # 5. SOCIOS Y DONACIONES (El corazón del BI)
        # ---------------------------------------------------------
        CANTIDAD_SOCIOS = 80 
        
        self.stdout.write(f"🚀 Generando {CANTIDAD_SOCIOS} socios y sus historiales...")

        for i in range(CANTIDAD_SOCIOS):
            try:
                captador_asignado = random.choice(objs_captadores) if objs_captadores else None
                
                socio = Socio.objects.create(
                    rut=fake.unique.rut(),
                    nombre=fake.first_name(),
                    apellido_paterno=fake.last_name(),
                    apellido_materno=fake.last_name(),
                    email=fake.unique.email(),
                    telefono=fake.phone_number(),
                    direccion=fake.address(),
                    zona=fake.city(),  
                    activo=True,
                    captador_por=captador_asignado
                )

                # Historial de Donaciones
                for _ in range(random.randint(1, 6)):
                    
                    dias_atras = random.randint(0, 365)
                    fecha_historica = timezone.now() - timedelta(days=dias_atras)
                    monto = random.choice([3000, 5000, 10000, 20000, 50000, 100000])
                    estado_real = 'Completada' if random.random() > 0.15 else 'Fallida'
                    
                    campana_asignada = random.choice(objs_campanas + [None])
                    metodo_asignado = random.choice(objs_metodos)

                    # Crear con fecha actual (porque auto_now_add manda)
                    donacion = Donacion.objects.create(
                        id_socio=socio,
                        id_campana=campana_asignada,
                        id_metodo_pago=metodo_asignado,
                        monto=monto,
                        estado=estado_real,
                    )

                    # Forzar fecha antigua directo en BD
                    Donacion.objects.filter(id=donacion.id).update(fecha_donacion=fecha_historica)

            except IntegrityError:
                continue 
            except Exception:
                continue

        self.stdout.write(self.style.SUCCESS('✨ ¡ÉXITO! Base de datos poblada masivamente.'))