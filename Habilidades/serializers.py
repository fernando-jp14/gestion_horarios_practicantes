from rest_framework import serializers
from .models import Habilidad, NivelHabilidad
from Practicantes.models import Practicante


class HabilidadSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidad
        fields = ['nombre']


class NivelHabilidadSerializer(serializers.ModelSerializer):
    habilidad = serializers.CharField(source='habilidad.nombre')  

    class Meta:
        model = NivelHabilidad
        fields = ['habilidad', 'puntaje']


class PracticanteSerializer(serializers.ModelSerializer):
    niveles_habilidad = NivelHabilidadSerializer(many=True, read_only=True)

    class Meta:
        model = Practicante
        fields = ['id', 'nombre', 'niveles_habilidad']
