from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PracticanteViewSet, practicante_template, EquipoViewSet, equipos_template, EspecialidadViewSet

router = DefaultRouter()
router.register(r'practicantes', PracticanteViewSet, basename='practicante')
router.register(r'equipos', EquipoViewSet, basename='equipo')
router.register(r'especialidades', EspecialidadViewSet, basename='especialidad')

urlpatterns = [
    path('', include(router.urls)),
    path('practicante_template/', practicante_template, name='practicante_template'),
    path('equipos_template/', equipos_template, name='equipos_template'),
]
