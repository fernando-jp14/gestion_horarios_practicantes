from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabilidadViewSet, NivelHabilidadViewSet, PracticanteViewSet

router = DefaultRouter()
router.register(r'habilidades', HabilidadViewSet)
router.register(r'niveles-habilidad', NivelHabilidadViewSet)
router.register(r'practicantes', PracticanteViewSet)  

urlpatterns = [
    path('', include(router.urls)),
]
