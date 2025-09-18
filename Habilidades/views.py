from rest_framework import viewsets
from .models import Habilidad, NivelHabilidad
from .serializers import HabilidadSerializer, NivelHabilidadSerializer

class HabilidadViewSet(viewsets.ModelViewSet):
    queryset = Habilidad.objects.all()
    serializer_class = HabilidadSerializer


class NivelHabilidadViewSet(viewsets.ModelViewSet):
    queryset = NivelHabilidad.objects.all()
    serializer_class = NivelHabilidadSerializer