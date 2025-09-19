from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HorarioRecuperacionViewSet

router = DefaultRouter()
router.register(r'horarios-recuperacion', HorarioRecuperacionViewSet, basename='horariorecuperacion')

urlpatterns = [
	path('', include(router.urls)),
]

# Probar exportación a Excel
# http://localhost:8000/api/horarios-recuperacion/exportar-excel/