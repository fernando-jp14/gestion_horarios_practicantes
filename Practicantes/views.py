from django.shortcuts import render
from rest_framework import viewsets
from .models import Practicante, Equipo
from .serializers import PracticanteSerializer, EquipoSerializer
from django.shortcuts import render

# Create your views here.

class PracticanteViewSet(viewsets.ModelViewSet):
    serializer_class = PracticanteSerializer

    def get_queryset(self):
        queryset = Practicante.objects.all()
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        return queryset


# ViewSet correcto para equipos
class EquipoViewSet(viewsets.ModelViewSet):
    def destroy(self, request, *args, **kwargs):
        equipo = self.get_object()
        # Poner en 'libre' a los practicantes del equipo
        for practicante in equipo.practicantes.all():
            practicante.estado = 'libre'
            practicante.equipo = None
            practicante.save()
        return super().destroy(request, *args, **kwargs)
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer

def practicante_template(request):
    return render(request, 'practicante.html')

def equipos_template(request):
    return render(request, 'equipos.html')

