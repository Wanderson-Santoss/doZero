# accounts/urls.py

from django.urls import path
from .views import CadastroView

urlpatterns = [
    # Rota para o seu formulário de cadastro
    path('cadastro/', CadastroView.as_view(), name='cadastro'),
]