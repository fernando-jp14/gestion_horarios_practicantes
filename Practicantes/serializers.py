from rest_framework import serializers
from .models import Practicante, Equipo

class PracticanteSerializer(serializers.ModelSerializer):
    name_especialidad = serializers.SerializerMethodField()

    class Meta:
        model = Practicante
        fields = ["id", "nombre", "apellido", "semestre", "sexo", "estado", "especialidad", "name_especialidad", "equipo"]

    def get_name_especialidad(self, obj):
        return obj.especialidad.nombre if obj.especialidad else None
    

# Serializer para mostrar practicantes dentro de un equipo (solo los campos requeridos)
class PracticanteMiniSerializer(serializers.ModelSerializer):
    name_especialidad = serializers.SerializerMethodField()
    class Meta:
        model = Practicante
        fields = ["id", "nombre", "apellido", "name_especialidad"]

    def get_name_especialidad(self, obj):
        return obj.especialidad.nombre if obj.especialidad else None

# Serializer para Equipo con practicantes anidados
class EquipoSerializer(serializers.ModelSerializer):
    practicantes = PracticanteMiniSerializer(many=True, read_only=True)
    practicantes_ids = serializers.PrimaryKeyRelatedField(
        queryset=Practicante.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='practicantes'  # para que DRF lo relacione con el related_name
    )

    class Meta:
        model = Equipo
        fields = ["id", "nombre", "practicantes", "practicantes_ids"]

    def validate_practicantes_ids(self, value):
        # Permitir entre 1 y 5 practicantes
        if len(value) > 5:
            raise serializers.ValidationError("Un equipo no puede tener más de 5 practicantes.")
        if len(value) < 1:
            raise serializers.ValidationError("El equipo debe tener al menos 1 practicante.")
        # Validar que todos estén libres
        # Si es actualización, permitir los que ya están en el equipo
        ocupados = []
        if self.instance:
            ids_actuales = set(p.id for p in self.instance.practicantes.all())
            for p in value:
                if getattr(p, 'estado', '').lower() == 'ocupado' and p.id not in ids_actuales:
                    ocupados.append(p)
        else:
            ocupados = [p for p in value if getattr(p, 'estado', '').lower() == 'ocupado']
        if ocupados:
            nombres = ', '.join(f"{p.nombre} {p.apellido}" for p in ocupados)
            raise serializers.ValidationError(f"Los siguientes practicantes están ocupados y no pueden ser asignados: {nombres}")
        # Contar especialidades (máximos)
        backend = sum(1 for p in value if getattr(p.especialidad, 'nombre', '').strip().upper() == 'BACKEND')
        frontend = sum(1 for p in value if getattr(p.especialidad, 'nombre', '').strip().upper() == 'FRONTEND')
        scrum = sum(1 for p in value if getattr(p.especialidad, 'nombre', '').strip().upper() == 'SCRUM MASTER')
        if backend > 2:
            raise serializers.ValidationError("No puede haber más de 2 practicantes de especialidad BACKEND en un equipo.")
        if frontend > 2:
            raise serializers.ValidationError("No puede haber más de 2 practicantes de especialidad FRONTEND en un equipo.")
        if scrum > 1:
            raise serializers.ValidationError("No puede haber más de 1 practicante de especialidad SCRUM MASTER en un equipo.")
        return value


    def create(self, validated_data):
        practicantes = validated_data.pop('practicantes', [])
        equipo = Equipo.objects.create(**validated_data)
        for practicante in practicantes:
            practicante.equipo = equipo
            practicante.estado = 'ocupado'
            practicante.save()
        return equipo

    def update(self, instance, validated_data):
        practicantes = validated_data.pop('practicantes', None)
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()
        if practicantes is not None:
            # Quitar practicantes actuales y ponerlos libres
            for p in instance.practicantes.all():
                p.equipo = None
                p.estado = 'libre'
                p.save()
            # Asignar nuevos practicantes y ponerlos ocupados
            for practicante in practicantes:
                practicante.equipo = instance
                practicante.estado = 'ocupado'
                practicante.save()
        return instance
