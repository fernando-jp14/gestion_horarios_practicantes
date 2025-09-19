from rest_framework import viewsets
from django.http import HttpResponse
from rest_framework.decorators import action
from .models import Habilidad, NivelHabilidad
from .serializers import HabilidadSimpleSerializer, NivelHabilidadSerializer, PracticantePuntajeSerializer
from Practicantes.models import Practicante
from django.shortcuts import render
from .utils import export_niveles_habilidad_to_excel
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, permission_classes

class PracticantePuntajeViewSet(viewsets.ModelViewSet):
    queryset = Practicante.objects.all()
    serializer_class = PracticantePuntajeSerializer


class HabilidadViewSet(viewsets.ModelViewSet):
    queryset = Habilidad.objects.all()
    serializer_class = HabilidadSimpleSerializer


class NivelHabilidadViewSet(viewsets.ModelViewSet):
    queryset = NivelHabilidad.objects.all()
    serializer_class = NivelHabilidadSerializer

    @action(detail=False, methods=['get'], url_path='exportar-excel')
    @permission_classes([IsAuthenticated])
    def exportar_excel(self, request):
        queryset = self.get_queryset()
        excel_file = export_niveles_habilidad_to_excel(queryset)

        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=habilidades_practicantes.xlsx'
        return response

def habilidades_template(request):
    return render(request, 'habilidades.html')
    
