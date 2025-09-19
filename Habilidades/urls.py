from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabilidadViewSet, NivelHabilidadViewSet, PracticantePuntajeViewSet, habilidades_template

router = DefaultRouter()
router.register(r'habilidades', HabilidadViewSet)
router.register(r'niveles-habilidad', NivelHabilidadViewSet)
router.register(r'practicantes_puntaje', PracticantePuntajeViewSet)  

urlpatterns = [
    path('', include(router.urls)),
    path('habilidades_template/', habilidades_template, name='habilidades_template'),
]
