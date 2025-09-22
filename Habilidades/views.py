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
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

class PracticantePuntajeViewSet(viewsets.ModelViewSet):

    @action(detail=False, methods=['post', 'put'], url_path='asignar_puntajes')
    def asignar_puntajes(self, request):
    
        id_practicante = request.data.get('id_practicante')
        nombre = request.data.get('nombre')
        apellido = request.data.get('apellido')
        puntajes = request.data.get('puntajes', [])
        if not isinstance(puntajes, list):
            return Response({'detail': 'Faltan datos requeridos.'}, status=400)

        practicante = None
        if id_practicante:
            try:
                practicante = Practicante.objects.get(id=id_practicante)
            except Practicante.DoesNotExist:
                return Response({'detail': 'No se encontró el practicante con ese id.'}, status=404)
        elif nombre and apellido:
            try:
                practicante = Practicante.objects.get(nombre=nombre, apellido=apellido)
            except Practicante.DoesNotExist:
                return Response({'detail': 'No se encontró el practicante con ese nombre y apellido.'}, status=404)
        else:
            return Response({'detail': 'Debes enviar id_practicante o nombre y apellido.'}, status=400)

        errores = []
        creados = 0
        habilidades_enviadas = set()
        for item in puntajes:
            nombre_habilidad = item.get('nombre_habilidad')
            puntaje = item.get('puntaje')
            if not nombre_habilidad or puntaje is None:
                errores.append(f"Faltan datos en: {item}")
                continue
            try:
                habilidad = Habilidad.objects.get(nombre=nombre_habilidad)
            except Habilidad.DoesNotExist:
                errores.append(f"Habilidad '{nombre_habilidad}' no existe.")
                continue
            habilidades_enviadas.add(habilidad.id)
            # Crear o actualizar el puntaje
            nivel, created = NivelHabilidad.objects.update_or_create(
                practicante=practicante,
                habilidad=habilidad,
                defaults={'puntaje': puntaje}
            )
            creados += 1

        # Si es PUT, eliminar los puntajes antiguos que no estén en la lista enviada
        if request.method == 'PUT':
            NivelHabilidad.objects.filter(practicante=practicante).exclude(habilidad_id__in=habilidades_enviadas).delete()

        return Response({
            'detail': f'Se asignaron {creados} puntajes.',
            'errores': errores
        }, status=201 if creados else 400)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'No está permitido eliminar practicantes desde este endpoint.'}, status=405)
    queryset = Practicante.objects.all()
    serializer_class = PracticantePuntajeSerializer

    @action(detail=True, methods=['delete'], url_path='borrar_puntajes')
    def borrar_puntajes(self, request, pk=None):
        """
        Elimina todos los niveles de habilidad del practicante, pero NO elimina el practicante.
        """
        try:
            practicante = self.get_object()
        except Practicante.DoesNotExist:
            return Response({'detail': 'Practicante no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        borrados, _ = NivelHabilidad.objects.filter(practicante=practicante).delete()
        return Response({'detail': f'Se eliminaron {borrados} puntajes de habilidad.'}, status=status.HTTP_204_NO_CONTENT)


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
    
