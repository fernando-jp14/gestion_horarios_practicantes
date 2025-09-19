from rest_framework import viewsets
from .models import Habilidad, NivelHabilidad
from .serializers import HabilidadSimpleSerializer, NivelHabilidadSerializer, PracticantePuntajeSerializer
from Practicantes.models import Practicante
from django.shortcuts import render


class PracticantePuntajeViewSet(viewsets.ModelViewSet):
    queryset = Practicante.objects.all()
    serializer_class = PracticantePuntajeSerializer


class HabilidadViewSet(viewsets.ModelViewSet):
    queryset = Habilidad.objects.all()
    serializer_class = HabilidadSimpleSerializer


class NivelHabilidadViewSet(viewsets.ModelViewSet):
    queryset = NivelHabilidad.objects.all()
    serializer_class = NivelHabilidadSerializer

def habilidades_template(request):
    return render(request, 'habilidades.html')
