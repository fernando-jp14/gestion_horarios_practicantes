from django.db import models

# Create your models here.

class Dia(models.Model):
    nombre = models.CharField(max_length=10, unique=True)

    class Meta:
        ordering = ['id']  # Ordena por id ascendente

    def __str__(self):
        return self.nombre

class HorarioRecuperacion(models.Model):
    practicante = models.OneToOneField('Practicantes.Practicante', on_delete=models.CASCADE, related_name='horario')
    dias_falta = models.ManyToManyField(Dia, related_name='faltas')
    dias_recuperacion = models.ManyToManyField(Dia, related_name='recuperaciones')

    class Meta:
        verbose_name = 'Horario de recuperación'
        verbose_name_plural = 'Horarios de recuperación'
        ordering = ['practicante']

    def __str__(self):
        faltas = ', '.join([str(d) for d in self.dias_falta.all()])
        recupera = ', '.join([str(d) for d in self.dias_recuperacion.all()])
        return f"{self.practicante} - Faltas: {faltas} / Recupera: {recupera}"
