from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class UsuarioManager(BaseUserManager):
    # AHORA PEDIMOS RUT, NOMBRE Y APELLIDO AL CREAR, PERO NO NOMBRE_USUARIO
    def create_user(self, email, rut, nombre, apellido, rol=None, password=None):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        if not rut:
            raise ValueError('El usuario debe tener un RUT')
        if not nombre:
            raise ValueError('El usuario debe tener un nombre')
        
        usuario = self.model(
            email=self.normalize_email(email),
            rut=rut,
            nombre=nombre,
            apellido=apellido,
            rol=rol,
        )
        
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, rut, nombre, apellido, password, rol=None):
        # Para superusuario, si no hay rol, asignamos Admin
        if not rol:
            rol, _ = Rol.objects.get_or_create(nombre="Administrador")

        usuario = self.create_user(
            email=email,
            rut=rut,
            nombre=nombre,
            apellido=apellido,
            rol=rol,
            password=password,
        )
        usuario.is_admin = True
        usuario.save(using=self._db)
        return usuario

class Usuario(AbstractBaseUser):
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField(max_length=255, unique=True)
    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=100)   
    apellido = models.CharField(max_length=100) 
    activo = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    objects = UsuarioManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['rut', 'nombre', 'apellido']

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin