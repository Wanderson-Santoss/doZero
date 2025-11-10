# vagali_project/urls.py (Versão Corrigida)

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

# IMPORTAÇÕES DA AUTENTICAÇÃO
from accounts.api.views import CustomAuthToken 
from accounts.views import CadastroView 

from app_servicos.api.views import DemandaViewSet 


urlpatterns = [
    # ------------------ ROTAS ADMINISTRATIVAS E TRADICIONAIS (HTML) ------------------
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # ------------------ ROTAS DA API (Django REST Framework) ------------------

    # 1. ROTA DE CADASTRO
    path('api/v1/accounts/cadastro/', CadastroView.as_view(), name='api_cadastro'), 
    
    # Rota base para os demais endpoints da API de Usuários/Perfis
    path('api/v1/accounts/', include('accounts.api.urls')), 
    
    # 2. ENDPOINT DE LOGIN (Customizado)
    path('api/v1/auth/login/', CustomAuthToken.as_view(), name='api_login'), 

    # 🚨 NOVO: Rota para as funcionalidades de Autenticação do Djoser:
    # (Troca de Senha, Recuperação, etc.)
    # O Djoser fornece users/set_password/, password/reset/, etc.
    path('api/v1/auth/', include('djoser.urls.authtoken')), 
    path('api/v1/auth/', include('djoser.urls')),

    # Rotas do app_servicos (Serviços e Demandas)
    path('api/v1/', include('app_servicos.api.urls')),
]