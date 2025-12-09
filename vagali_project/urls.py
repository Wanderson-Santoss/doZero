# vagali_project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from django.conf import settings
from django.conf.urls.static import static

# IMPORTAÇÕES DA AUTENTICAÇÃO
from accounts.api.views import CustomAuthToken
from accounts.views import CadastroView


urlpatterns = [
    # ------------------ ROTAS ADMINISTRATIVAS E TRADICIONAIS (HTML) ------------------
    path('admin/', admin.site.urls),

    # Se você estiver servindo o React pelo Django (index.html em templates/)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # ------------------ ROTAS DA API (Django REST Framework) ------------------

    # 1. ROTA DE CADASTRO (sua view customizada)
    path('api/v1/accounts/cadastro/', CadastroView.as_view(), name='api_cadastro'),

    # 2. ROTAS DE ACCOUNTS (perfil, profissionais, register)
    #    -> /api/v1/accounts/profissionais/
    #    -> /api/v1/accounts/profissionais/<id>/
    #    -> /api/v1/accounts/perfil/me/
    #    -> /api/v1/accounts/register/
    path('api/v1/accounts/', include('accounts.api.urls')),

    # 3. ENDPOINT DE LOGIN (Customizado com email + senha retornando token)
    #    URL: /api/v1/auth/login/
    path('api/v1/auth/login/', CustomAuthToken.as_view(), name='api_login'),

    # 4. DJOSER (reset de senha, etc.)
    #    Exemplos:
    #      - POST /api/v1/auth/password/reset/
    #      - POST /api/v1/auth/password/reset/confirm/
    #      - POST /api/v1/auth/users/set_password/
    path('api/v1/auth/', include('djoser.urls.authtoken')),
    path('api/v1/auth/', include('djoser.urls')),

    # 5. Rotas do app_servicos (demands, etc.)
    path('api/v1/', include('app_servicos.api.urls')),
]

# ------------------ ARQUIVOS DE MÍDIA (ex: foto de perfil) ------------------
# if settings.DEBUG:
#     urlpatterns += static(
#         settings.MEDIA_URL,
#         document_root=settings.MEDIA_ROOT,
#     )

# 👇 para servir as fotos em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)