from rest_framework import viewsets
from .models import HorarioRecuperacion
from .serializers import HorarioRecuperacionSerializer


class HorarioRecuperacionViewSet(viewsets.ModelViewSet):
    queryset = HorarioRecuperacion.objects.all()
    serializer_class = HorarioRecuperacionSerializer

# Create your views here.
