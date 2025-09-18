from rest_framework import serializers
from .models import Dia, HorarioRecuperacion

class DiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dia
        fields = '__all__'


class HorarioRecuperacionSerializer(serializers.ModelSerializer):
    dias_falta = DiaSerializer(many=True, read_only=True)
    dias_recuperacion = DiaSerializer(many=True, read_only=True)
    nombre_practicante = serializers.SerializerMethodField()

    class Meta:
        model = HorarioRecuperacion
        fields = [
            'id',
            'dias_falta',
            'dias_recuperacion',
            'nombre_practicante',
        ]

    def get_nombre_practicante(self, obj):
        return str(obj.practicante) if obj.practicante else None