from django.shortcuts import render
from rest_framework import viewsets
from .models import Practicante
from .serializers import PracticanteSerializer
from django.shortcuts import render

# Create your views here.
class PracticanteViewSet(viewsets.ModelViewSet):
    queryset = Practicante.objects.all()
    serializer_class = PracticanteSerializer

def practicante_template(request):
    return render(request, 'practicante.html')

