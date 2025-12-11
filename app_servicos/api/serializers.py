# app_servicos/api/serializers.py

from rest_framework import serializers
from app_servicos.models import Service, Demanda, Offer, Feedback
from accounts.models import User

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"
        read_only_fields = ["id"]


class DemandaSerializer(serializers.ModelSerializer):
    service_name = serializers.SlugRelatedField(source="service", slug_field="name", read_only=True)
    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()
    service_icon = serializers.SerializerMethodField()
    accepted_offer_value = serializers.SerializerMethodField()

    # Campos para upload (aceitam null/blank)
    photos = serializers.FileField(required=False, allow_null=True)
    videos = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Demanda
        fields = (
            "id",
            "service",
            "service_name",
            "client",
            "client_name",
            "professional",
            "professional_name",
            "titulo",
            "descricao",
            "cep",
            "photos",
            "videos",
            "status",
            "created_at",
            "service_icon",
            "accepted_offer_value",
        )
        read_only_fields = ("client", "professional", "status", "created_at")

    def get_client_name(self, obj):
        client = obj.client
        if client and hasattr(client, "profile"):
            return client.profile.full_name or client.email
        return client.email if client else None

    def get_professional_name(self, obj):
        prof = obj.professional
        if prof and hasattr(prof, "profile"):
            return prof.profile.full_name or prof.email
        return prof.email if prof else None

    def get_service_icon(self, obj):
        return getattr(obj.service, "icon", "🛠️")

    def get_accepted_offer_value(self, obj):
        if obj.status in ["em_andamento", "concluida"]:
            accepted = obj.offers.filter(status="aceita").first()
            if accepted:
                return float(accepted.proposta_valor)
        return None


class OfferSerializer(serializers.ModelSerializer):
    professional_name = serializers.SerializerMethodField()
    demanda_client_name = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = (
            "id",
            "demanda",
            "professional",
            "professional_name",
            "proposta_valor",
            "proposta_prazo",
            "status",
            "created_at",
            "demanda_client_name",
        )
        read_only_fields = ("professional", "status", "created_at")

    def get_professional_name(self, obj):
        prof = obj.professional
        if prof and hasattr(prof, "profile"):
            return prof.profile.full_name or prof.email
        return prof.email if prof else None

    def get_demanda_client_name(self, obj):
        client = obj.demanda.client
        if client and hasattr(client, "profile"):
            return client.profile.full_name or client.email
        return client.email if client else None


class FeedbackSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = (
            "id",
            "demanda",
            "client",
            "client_name",
            "professional",
            "professional_name",
            "rating",
            "comentario",
            "created_at",
        )
        read_only_fields = ("client", "created_at")

    def get_client_name(self, obj):
        client = obj.client
        if client and hasattr(client, "profile"):
            return client.profile.full_name or client.email
        return client.email if client else None

    def get_professional_name(self, obj):
        prof = obj.professional
        if prof and hasattr(prof, "profile"):
            return prof.profile.full_name or prof.email
        return prof.email if prof else None
