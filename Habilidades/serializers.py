from rest_framework import serializers
from .models import Habilidad, NivelHabilidad
from Practicantes.models import Practicante

class PracticanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Practicante
        fields = '__all__'


class HabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidad
        fields = '__all__'


class NivelHabilidadSerializer(serializers.ModelSerializer):
    
    practicante = serializers.StringRelatedField(read_only=True)
    habilidad = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = NivelHabilidad
        fields = '__all__'
        depth = 1