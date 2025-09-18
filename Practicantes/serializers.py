from rest_framework import serializers
from .models import Practicante

class PracticanteSerializer(serializers.ModelSerializer):
    id_especialidad = serializers.SerializerMethodField()
    name_especialidad = serializers.SerializerMethodField()

    class Meta:
        model = Practicante
        fields = ["id", "nombre", "apellido", "semestre", "sexo", "estado", "id_especialidad", "name_especialidad", "equipo"]

    def get_id_especialidad(self, obj):
        return obj.especialidad.id if obj.especialidad else None

    def get_name_especialidad(self, obj):
        return obj.especialidad.nombre if obj.especialidad else None
