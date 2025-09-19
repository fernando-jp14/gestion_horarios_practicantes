from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PracticanteViewSet, practicante_template

router = DefaultRouter()
router.register(r'practicantes', PracticanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('practicante_template/', practicante_template, name='practicante_template'),
]
