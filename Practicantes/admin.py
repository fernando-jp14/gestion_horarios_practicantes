from django.contrib import admin
from .models import Practicante, Especialidad, Equipo

@admin.register(Practicante)
class PracticanteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'semestre', 'sexo', 'estado', 'especialidad', 'equipo')
    list_filter = ('semestre', 'sexo', 'estado', 'especialidad', 'equipo')
    search_fields = ('nombre', 'apellido')

@admin.register(Especialidad)
class EspecialidadAdmin(admin.ModelAdmin):
    search_fields = ('nombre',)

@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'confirmado', 'created_at', 'updated_at')
    search_fields = ('nombre',)
    list_filter = ('confirmado',)
