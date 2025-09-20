from rest_framework import serializers
from .models import Habilidad, NivelHabilidad
from Practicantes.models import Practicante


class HabilidadSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidad
        fields = ['nombre']

class NivelHabilidadSerializer(serializers.ModelSerializer):
    # Para escritura: ids de practicante y habilidad
    practicante = serializers.PrimaryKeyRelatedField(queryset=Practicante.objects.all(), write_only=True, required=True)
    habilidad = serializers.PrimaryKeyRelatedField(queryset=Habilidad.objects.all(), write_only=True, required=True)

    # Para lectura personalizada
    id_habilidad = serializers.IntegerField(source='habilidad.id', read_only=True)
    nombre_habilidad = serializers.CharField(source='habilidad.nombre', read_only=True)

    class Meta:
        model = NivelHabilidad
        fields = [
            'id_habilidad',
            'puntaje',
            'nombre_habilidad',
            'practicante',  # Para POST/PUT
            'habilidad',    # Para POST/PUT
        ]

    # Ocultar practicante y habilidad en la respuesta GET (solo para escritura)
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep.pop('practicante', None)
        rep.pop('habilidad', None)
        return rep


class PracticantePuntajeSerializer(serializers.ModelSerializer):
    niveles_habilidad = NivelHabilidadSerializer(many=True, read_only=True)

    id_practicante = serializers.IntegerField(source='id', read_only=True)
    nombre_practicante = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Practicante
        fields = ['id_practicante', 'nombre_practicante', 'niveles_habilidad']

    def get_nombre_practicante(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()


