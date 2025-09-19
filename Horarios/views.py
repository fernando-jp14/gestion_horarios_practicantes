from rest_framework import viewsets
from django.http import HttpResponse
from rest_framework.decorators import action
from .models import HorarioRecuperacion
from .serializers import HorarioRecuperacionSerializer
from .utils import export_horarios_to_excel


class HorarioRecuperacionViewSet(viewsets.ModelViewSet):
    queryset = HorarioRecuperacion.objects.all()
    serializer_class = HorarioRecuperacionSerializer

    @action(detail=False, methods=['get'], url_path='exportar-excel')
    def exportar_excel(self, request):
        queryset = self.get_queryset()
        excel_file = export_horarios_to_excel(queryset)

        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=horarios_recuperacion.xlsx'
        return response