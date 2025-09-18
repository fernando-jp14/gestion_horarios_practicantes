from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PracticanteViewSet

router = DefaultRouter()
router.register(r'practicantes', PracticanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
