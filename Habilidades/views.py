from rest_framework import viewsets
from django.http import HttpResponse
from rest_framework.decorators import action
from .models import Habilidad, NivelHabilidad
from .serializers import HabilidadSerializer, NivelHabilidadSerializer
from .utils import export_niveles_habilidad_to_excel

class HabilidadViewSet(viewsets.ModelViewSet):
    queryset = Habilidad.objects.all()
    serializer_class = HabilidadSerializer


class NivelHabilidadViewSet(viewsets.ModelViewSet):
    queryset = NivelHabilidad.objects.all()
    serializer_class = NivelHabilidadSerializer

    @action(detail=False, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request):
        queryset = self.get_queryset()
        excel_file = export_niveles_habilidad_to_excel(queryset)

        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=habilidades_practicantes.xlsx'
        return response