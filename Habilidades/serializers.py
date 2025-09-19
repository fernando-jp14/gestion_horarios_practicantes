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

    # Para lectura: nombres legibles
    id_practicante = serializers.SerializerMethodField(read_only=True)
    nombre_practicante = serializers.SerializerMethodField(read_only=True)
    nombre_habilidad = serializers.CharField(source='habilidad.nombre', read_only=True)

    class Meta:
        model = NivelHabilidad
        fields = [
            'id',
            'practicante',        # Para POST/PUT (id)
            'habilidad',          # Para POST/PUT (id)
            'puntaje',
            'id_practicante',     # Solo lectura
            'nombre_practicante', # Solo lectura
            'nombre_habilidad',   # Solo lectura
        ]

    def get_id_practicante(self, obj):
        return obj.practicante.id if obj.practicante else None

    def get_nombre_practicante(self, obj):
        if obj.practicante:
            return f"{obj.practicante.nombre} {obj.practicante.apellido}"
        return None


class PracticantePuntajeSerializer(serializers.ModelSerializer):
    niveles_habilidad = NivelHabilidadSerializer(many=True, read_only=True)

    class Meta:
        model = Practicante
        fields = ['id', 'nombre', 'niveles_habilidad']
