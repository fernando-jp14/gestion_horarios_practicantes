from django.db import models

class Especialidad(models.Model):
    nombre = models.CharField(max_length=100, blank=False)

    class Meta:
        verbose_name = 'Especialidad'
        verbose_name_plural = 'Especialidades'

    def __str__(self):
        return self.nombre


class Equipo(models.Model):
    nombre = models.CharField(max_length=100, blank=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmado = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre


class Practicante(models.Model):
    class SemestreChoices(models.TextChoices):
        PRIMERO = '1', '1er Semestre'
        SEGUNDO = '2', '2do Semestre'
        TERCERO = '3', '3er Semestre'
        CUARTO = '4', '4to Semestre'
        QUINTO = '5', '5to Semestre'
        SEXTO = '6', '6to Semestre'

    class EstadoChoices(models.TextChoices):
        OCUPADO = 'ocupado', 'Ocupado'
        LIBRE = 'libre', 'Libre'

    class SexoChoices(models.TextChoices):
        M = 'M', 'Masculino'
        F = 'F', 'Femenino'

    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    semestre = models.CharField(max_length=1, choices=SemestreChoices.choices)
    sexo = models.CharField(max_length=1, choices=SexoChoices.choices, blank=True)
    estado = models.CharField(max_length=10, choices=EstadoChoices.choices, default=EstadoChoices.LIBRE)
    especialidad = models.ForeignKey(Especialidad, on_delete=models.CASCADE, related_name='practicantes')
    equipo = models.ForeignKey(Equipo, on_delete=models.SET_NULL, null=True, blank=True, related_name='practicantes')

    class Meta:
        ordering = ['id']
        verbose_name = 'Practicante'
        verbose_name_plural = 'Practicantes'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    

