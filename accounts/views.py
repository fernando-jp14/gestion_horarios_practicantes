from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import UserSerializer, LoginSerializer
from django.shortcuts import render

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Registro de nuevo usuario"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Crear token para el usuario
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Usuario creado exitosamente',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Inicio de sesión"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        # Obtener o crear token
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login exitoso',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    """Cerrar sesión"""
    try:
        # Eliminar el token del usuario
        request.user.auth_token.delete()
        logout(request)
        return Response({
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Error al cerrar sesión'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def profile(request):
    """Obtener perfil del usuario autenticado"""
    return Response({
        'user': UserSerializer(request.user).data
    })

def login_template(request):
    return render(request, 'login.html')

def register_template(request):
    return render(request, 'register.html')
