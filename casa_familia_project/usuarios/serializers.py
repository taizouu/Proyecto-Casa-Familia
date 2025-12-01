from rest_framework import serializers
from .models import Usuario, Rol
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate 
from rest_framework_simplejwt.tokens import RefreshToken

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), required=True)

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'rut', 'nombre', 'apellido', 'password', 'rol', 'activo']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password) 
        instance.save()
        return instance
    
    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['rol'] = instance.rol.nombre if instance.rol else None
        
        return response

class MyTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                 user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError(
                    {'detail': 'Credenciales incorrectas.'}, code='authorization'
                )
        else:
            raise serializers.ValidationError(
                {'detail': 'Faltan datos.'}, code='authorization'
            )
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['nombre'] = user.nombre
        if user.rol:
            refresh['rol'] = user.rol.nombre 
        else:
            refresh['rol'] = None
        # --------------------------------------

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token), 
            'id': user.id,
            'email': user.email,
            'rol': user.rol.nombre if user.rol else None
        }