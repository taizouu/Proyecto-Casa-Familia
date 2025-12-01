from django.test import TestCase
from rest_framework.test import APITestCase # Usamos esto para probar la API
from rest_framework import status
from .models import Usuario, Rol

class AuthTests(APITestCase):
    
    def setUp(self):
        self.rol_captador = Rol.objects.create(nombre="Captador")
        self.test_password = "password123"
        self.test_user = Usuario.objects.create_user(
            nombre_usuario="test_captador",
            email="test@casafamilia.cl",
            rol=self.rol_captador,
            password=self.test_password
        )

    def test_password_is_hashed(self):
        usuario = Usuario.objects.get(nombre_usuario="test_captador")
        self.assertNotEqual(usuario.password, self.test_password)
        self.assertTrue(usuario.check_password(self.test_password))
        print("\n[TEST OK] Contraseña hasheada correctamente.")

    def test_obtain_token_success(self):
        url = "/api/auth/token/" 
        data = {
            "nombre_usuario": "test_captador",
            "password": self.test_password
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        print("\n[TEST OK] Endpoint de Login (/api/auth/token/) funciona.")

    def test_obtain_token_fail(self):
        url = "/api/auth/token/"
        data = {
            "nombre_usuario": "test_captador",
            "password": "password_incorrecta"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("\n[TEST OK] Endpoint de Login rechaza contraseña incorrecta.")