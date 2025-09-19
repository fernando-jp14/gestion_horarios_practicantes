from rest_framework import serializers
from .models import Practicante

class PracticanteSerializer(serializers.ModelSerializer):
    name_especialidad = serializers.SerializerMethodField()

    class Meta:
        model = Practicante
        fields = ["id", "nombre", "apellido", "semestre", "sexo", "estado", "especialidad", "name_especialidad", "equipo"]



    def get_name_especialidad(self, obj):
        return obj.especialidad.nombre if obj.especialidad else None
