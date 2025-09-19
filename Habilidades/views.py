from rest_framework import viewsets
from .models import Habilidad, NivelHabilidad
from .serializers import HabilidadSimpleSerializer, NivelHabilidadSerializer, PracticanteSerializer
from Practicantes.models import Practicante


class PracticanteViewSet(viewsets.ModelViewSet):
    queryset = Practicante.objects.all()
    serializer_class = PracticanteSerializer


class HabilidadViewSet(viewsets.ModelViewSet):
    queryset = Habilidad.objects.all()
    serializer_class = HabilidadSimpleSerializer


class NivelHabilidadViewSet(viewsets.ModelViewSet):
    queryset = NivelHabilidad.objects.all()
    serializer_class = NivelHabilidadSerializer
