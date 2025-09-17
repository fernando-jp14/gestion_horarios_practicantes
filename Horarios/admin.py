from django.contrib import admin
from .models import Dia, HorarioRecuperacion

@admin.register(Dia)
class DiaAdmin(admin.ModelAdmin):
	search_fields = ('nombre',)

@admin.register(HorarioRecuperacion)
class HorarioRecuperacionAdmin(admin.ModelAdmin):
    list_display = ('practicante', 'get_dias_falta', 'get_dias_recuperacion')
    search_fields = ('practicante__nombre',)
    filter_horizontal = ('dias_falta', 'dias_recuperacion')

    def get_dias_falta(self, obj):
        return ', '.join([d.nombre for d in obj.dias_falta.all()])
    get_dias_falta.short_description = 'Días de falta'

    def get_dias_recuperacion(self, obj):
        return ', '.join([d.nombre for d in obj.dias_recuperacion.all()])
    get_dias_recuperacion.short_description = 'Días de recuperación'


