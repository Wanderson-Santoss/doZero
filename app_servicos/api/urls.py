from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet, 
    DemandaViewSet, 
    FeedbackViewSet, 
    OfferViewSet # <-- NOVO IMPORT
) 

router = DefaultRouter()

# Rotas do app_servicos
router.register(r'servicos', ServiceViewSet, basename='service')
router.register(r'demandas', DemandaViewSet, basename='demanda')
router.register(r'feedbacks', FeedbackViewSet, basename='feedback')
router.register(r'ofertas', OfferViewSet, basename='offer') # <-- NOVA ROTA

urlpatterns = [
# ROTA MANUAL PARA FORÇAR O RECONHECIMENTO DA AÇÃO 'concluir'
    #path('demandas/<int:pk>/concluir/', DemandaViewSet.as_view({'post': 'concluir'}), name='demanda-concluir'),

    path('', include(router.urls)),
]