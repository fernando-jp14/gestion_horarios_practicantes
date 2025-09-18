from django.shortcuts import render
from rest_framework import viewsets
from .models import Practicante
from .serializers import PracticanteSerializer

# Create your views here.
class PracticanteViewSet(viewsets.ModelViewSet):
    queryset = Practicante.objects.all()
    serializer_class = PracticanteSerializer
