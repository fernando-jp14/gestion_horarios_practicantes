from django.contrib import admin
from .models import Habilidad, NivelHabilidad

@admin.register(Habilidad)
class HabilidadAdmin(admin.ModelAdmin):
	search_fields = ('nombre',)

@admin.register(NivelHabilidad)
class NivelHabilidadAdmin(admin.ModelAdmin):
	list_display = ('practicante', 'habilidad', 'puntaje')
	list_filter = ('habilidad', 'puntaje')
	search_fields = ('practicante__nombre', 'habilidad__nombre')
