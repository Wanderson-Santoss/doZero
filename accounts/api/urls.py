# accounts/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProfileViewSet,
    ProfessionalViewSet,
    ProfilePhotoUploadView,
    PortfolioItemListCreateView,
    PortfolioItemDestroyView,
    CadastroView,  # alias para RegisterAPIView
)

router = DefaultRouter()
router.register(r"perfil", ProfileViewSet, basename="perfil")
router.register(r"profissionais", ProfessionalViewSet, basename="profissionais")

urlpatterns = [
    # (Opcional) rota de cadastro via API:
    # POST /api/v1/accounts/register/
    path("register/", CadastroView.as_view(), name="register"),

    # Upload da FOTO de perfil do usuário logado:
    # POST /api/v1/accounts/perfil/me/photo/
    path(
        "perfil/me/photo/",
        ProfilePhotoUploadView.as_view(),
        name="profile-photo-upload",
    ),

    # Portfólio (imagens / vídeos)
    # GET, POST /api/v1/accounts/portfolio/
    path(
        "portfolio/",
        PortfolioItemListCreateView.as_view(),
        name="portfolio-list-create",
    ),

    # DELETE /api/v1/accounts/portfolio/<id>/
    path(
        "portfolio/<int:pk>/",
        PortfolioItemDestroyView.as_view(),
        name="portfolio-destroy",
    ),

    # Rotas geradas pelo router (perfil, profissionais)
    path("", include(router.urls)),
]
