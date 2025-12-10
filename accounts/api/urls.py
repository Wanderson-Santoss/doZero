# accounts/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BecomeProfessionalView


from .views import (
    ProfileViewSet,
    ProfessionalViewSet,
    ProfilePhotoUploadView,
    PortfolioItemListCreateView,
    PortfolioItemDestroyView,
    CadastroView,
)

router = DefaultRouter()
router.register("perfil", ProfileViewSet, basename="perfil")
router.register("profissionais", ProfessionalViewSet, basename="profissionais")

urlpatterns = [
    path("register/", CadastroView.as_view(), name="register"),

    path(
        "perfil/me/photo/",
        ProfilePhotoUploadView.as_view(),
        name="profile-photo-upload",
    ),

    # ✅ PORTFÓLIO PÚBLICO
    path(
        "portfolio/",
        PortfolioItemListCreateView.as_view(),
        name="portfolio-list-create",
    ),

    path(
        "portfolio/<int:pk>/",
        PortfolioItemDestroyView.as_view(),
        name="portfolio-destroy",
    ),
    
    # Virar profissional (triagem)
    path(
        "virar-profissional/",
        BecomeProfessionalView.as_view(),
        name="become-professional",
    ),

    path("", include(router.urls)),
]
