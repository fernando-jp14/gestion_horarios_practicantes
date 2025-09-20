from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Habilidad(models.Model):
    nombre = models.CharField(max_length=100, blank=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.nombre

class NivelHabilidad(models.Model):
    practicante = models.ForeignKey('Practicantes.Practicante', on_delete=models.CASCADE, related_name='niveles_habilidad')
    habilidad = models.ForeignKey(Habilidad, on_delete=models.CASCADE, related_name='niveles')
    puntaje = models.IntegerField(default=1, validators=[
        MinValueValidator(1),
        MaxValueValidator(10)
    ])

    class Meta:
        unique_together = ('practicante', 'habilidad')
        verbose_name = 'Nivel de Habilidad'
        verbose_name_plural = 'Niveles de Habilidades'
        ordering = ['-puntaje']