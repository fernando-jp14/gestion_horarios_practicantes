from rest_framework import serializers
from .models import Dia, HorarioRecuperacion
# Importar Practicante para usarlo en el serializer
from Practicantes.models import Practicante

class DiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dia
        fields = '__all__'


# Serializer para HorarioRecuperacion
class HorarioRecuperacionSerializer(serializers.ModelSerializer):
    def validate_dias_falta(self, value):
        # Solo permitir días de lunes a viernes
        dias_no_permitidos = []
        for dia in value:
            nombre = (dia.nombre or '').strip().lower()
            if nombre == 'sábado' or nombre == 'sabado':
                dias_no_permitidos.append(dia.nombre)
        if dias_no_permitidos:
            raise serializers.ValidationError(f"Día(s) no permitido(s) en faltas: {', '.join(dias_no_permitidos)}. Solo se permite de lunes a viernes.")
        return value
    # Validación para asegurar que un practicante solo tenga un horario
    def validate_practicante(self, value):
        # Permite actualizar el propio objeto sin lanzar error
        qs = HorarioRecuperacion.objects.filter(practicante=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Este practicante ya tiene un horario de recuperación asignado.")
        return value

    # Campos de solo lectura para mostrar los días con detalle (GET)
    dias_falta_detalle = DiaSerializer(source='dias_falta', many=True, read_only=True)
    dias_recuperacion_detalle = DiaSerializer(source='dias_recuperacion', many=True, read_only=True)

    # Campos de solo lectura para mostrar info del practicante (GET)
    id_practicante = serializers.SerializerMethodField()
    nombre_practicante = serializers.SerializerMethodField()

    # Campos de escritura para permitir POST/PUT (solo los IDs)
    practicante = serializers.PrimaryKeyRelatedField(queryset=Practicante.objects.all(), write_only=True, required=False)
    def update(self, instance, validated_data):
        # Si no se envía practicante, mantener el actual
        practicante = validated_data.get('practicante', instance.practicante)
        dias_falta = validated_data.get('dias_falta', instance.dias_falta.all())
        dias_recuperacion = validated_data.get('dias_recuperacion', instance.dias_recuperacion.all())

        instance.practicante = practicante
        instance.save()
        instance.dias_falta.set(dias_falta)
        instance.dias_recuperacion.set(dias_recuperacion)
        return instance
    dias_falta = serializers.PrimaryKeyRelatedField(
        queryset=Dia.objects.all(), many=True, write_only=True, help_text="IDs de días de falta"
    )
    dias_recuperacion = serializers.PrimaryKeyRelatedField(
        queryset=Dia.objects.all(), many=True, write_only=True, help_text="IDs de días de recuperación"
    )

    class Meta:
        model = HorarioRecuperacion
        # Incluye los campos de solo lectura y los de escritura
        fields = [
            'id',
            'practicante',        # Para POST/PUT (id)
            'dias_falta',         # Para POST/PUT (ids)
            'dias_recuperacion',  # Para POST/PUT (ids)
            'dias_falta_detalle', # Solo lectura (detalle)
            'dias_recuperacion_detalle', # Solo lectura (detalle)
            'id_practicante',     # Solo lectura (id)
            'nombre_practicante', # Solo lectura (nombre y apellido)
        ]

    def get_id_practicante(self, obj):
        # Devuelve el id del practicante
        return obj.practicante.id if obj.practicante else None

    def get_nombre_practicante(self, obj):
        # Devuelve el nombre y apellido del practicante
        if obj.practicante:
            return f"{obj.practicante.nombre} {obj.practicante.apellido}"
        return None
    