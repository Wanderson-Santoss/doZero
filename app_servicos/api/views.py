# app_servicos/api/views.py

from rest_framework import viewsets, permissions, exceptions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from app_servicos.models import Service, Demanda, Offer, Feedback
from .serializers import ServiceSerializer, DemandaSerializer, OfferSerializer, FeedbackSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("name")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class DemandaViewSet(viewsets.ModelViewSet):
    serializer_class = DemandaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["titulo", "descricao", "cep", "service__name"]
    parser_classes = [MultiPartParser, FormParser]  # aceita multipart (arquivos)

    def get_queryset(self):
        user = self.request.user
        if user.is_professional:
            return Demanda.objects.filter(status="pendente").order_by("-created_at")
        return Demanda.objects.filter(client=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_professional:
            raise exceptions.PermissionDenied("Profissionais não podem criar demandas.")
        # serializer.save aceita arquivos porque usamos multipart parser
        serializer.save(client=user)

    def perform_update(self, serializer):
        demanda = serializer.instance
        user = self.request.user
        if demanda.client != user:
            raise exceptions.PermissionDenied("Você só pode editar suas próprias demandas.")
        if demanda.status != "pendente":
            raise exceptions.PermissionDenied("Só é possível editar demandas pendentes.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != "pendente":
            raise exceptions.PermissionDenied("Só é possível excluir demandas pendentes.")
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def concluir(self, request, pk=None):
        demanda = self.get_object()
        user = request.user
        if demanda.professional != user:
            raise exceptions.PermissionDenied("Apenas o profissional responsável pode concluir.")
        if demanda.status != "em_andamento":
            return Response({"detail": "A demanda não está em andamento."}, status=400)
        demanda.status = "concluida"
        demanda.save()
        return Response(DemandaSerializer(demanda).data, status=200)


class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_professional:
            return Offer.objects.filter(professional=user).order_by("-created_at")
        return Offer.objects.filter(demanda__client=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_professional:
            raise exceptions.PermissionDenied("Apenas profissionais podem enviar ofertas.")
        demanda = serializer.validated_data["demanda"]
        if demanda.status != "pendente":
            raise exceptions.PermissionDenied("Esta demanda não está aberta para ofertas.")
        serializer.save(professional=user)

    def perform_update(self, serializer):
        raise exceptions.PermissionDenied("Não é permitido editar uma oferta.")

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def aceitar(self, request, pk=None):
        oferta = self.get_object()
        user = request.user
        if oferta.demanda.client != user:
            raise exceptions.PermissionDenied("Você não pode aceitar esta oferta.")
        if oferta.demanda.status != "pendente":
            return Response({"detail": "A demanda não está disponível para aceitar ofertas."}, status=400)
        oferta.status = "aceita"
        oferta.save()
        demanda = oferta.demanda
        demanda.status = "em_andamento"
        demanda.professional = oferta.professional
        demanda.save()
        Offer.objects.filter(demanda=demanda).exclude(id=oferta.id).update(status="rejeitada")
        return Response(OfferSerializer(oferta).data)


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_professional:
            return Feedback.objects.filter(client=user).order_by("-created_at")
        return Feedback.objects.filter(professional=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_professional:
            raise exceptions.PermissionDenied("Apenas clientes podem enviar feedback.")
        demanda = serializer.validated_data["demanda"]
        if demanda.client != user:
            raise exceptions.PermissionDenied("Você só pode avaliar serviços que contratou.")
        if demanda.status != "concluida":
            raise exceptions.PermissionDenied("Só é possível avaliar após a conclusão.")
        if hasattr(demanda, "feedback"):
            raise exceptions.PermissionDenied("Você já avaliou esta demanda.")
        serializer.save(client=user, professional=demanda.professional)
