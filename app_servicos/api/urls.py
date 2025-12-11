# app_servicos/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, DemandaViewSet, OfferViewSet, FeedbackViewSet

router = DefaultRouter()
router.register(r"servicos", ServiceViewSet, basename="service")
router.register(r"demandas", DemandaViewSet, basename="demanda")
router.register(r"ofertas", OfferViewSet, basename="offer")
router.register(r"feedbacks", FeedbackViewSet, basename="feedback")

urlpatterns = [
    path("", include(router.urls)),
]
