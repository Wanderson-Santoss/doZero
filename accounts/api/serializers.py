from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from rest_framework import serializers

from accounts.models import User, Profile


# -------------------------------------------------------------------
# 1. PROFILE SERIALIZER
# -------------------------------------------------------------------
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer do Profile.
    Usado tanto para leitura quanto atualização (PATCH).
    """

    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    cpf = serializers.CharField(required=False, allow_blank=True, max_length=11)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15)
    bio = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)
    cnpj = serializers.CharField(required=False, allow_blank=True, max_length=14)
    cep = serializers.CharField(required=False, allow_blank=True, max_length=8)
    palavras_chave = serializers.CharField(required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    #  profissão principal
    profession = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100
    )

    class Meta:
        model = Profile
        exclude = ("user", "rating")
        read_only_fields = ("rating",)


# -------------------------------------------------------------------
# 2. FULL PROFILE SERIALIZER (User + Profile)
# -------------------------------------------------------------------
class FullProfileSerializer(serializers.ModelSerializer):
    """
    Serializer usado em:
    /api/v1/accounts/perfil/me/
    """

    profile = ProfileSerializer(required=False)
    is_professional = serializers.BooleanField(required=False)
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "is_professional",
            "profile",
        )
        read_only_fields = ("id", "email")

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Controla a transição Cliente <-> Profissional
        """
        profile_data = validated_data.pop("profile", None)
        new_is_professional = validated_data.pop("is_professional", None)

        old_is_professional = instance.is_professional

        if new_is_professional is not None:
            instance.is_professional = new_is_professional

        instance = super().update(instance, validated_data)
        instance.save()

        profile, _ = Profile.objects.get_or_create(user=instance)

        # ✅ Se voltou de PROFISSIONAL → CLIENTE, limpamos dados profissionais
        if old_is_professional and not instance.is_professional:
            profile.bio = ""
            profile.address = ""
            profile.cnpj = ""
            profile.palavras_chave = ""
            profile.profession = ""
            profile.save()

        # ✅ Atualiza campos do profile
        if profile_data:
            ProfileSerializer().update(profile, profile_data)

        return instance


# -------------------------------------------------------------------
# 3. PROFESSIONAL SERIALIZER (LISTAGEM / PERFIL PÚBLICO)
# -------------------------------------------------------------------
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer público usado no Home e Perfil Público.
    """

    full_name = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    palavras_chave = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    demands_count = serializers.SerializerMethodField()
    profession = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "bio",
            "rating",
            "address",
            "palavras_chave",
            "photo",
            "demands_count",
            "profession",
        )

    def get_full_name(self, obj):
        return getattr(obj.profile, "full_name", None) or obj.email

    def get_bio(self, obj):
        return getattr(obj.profile, "bio", None)

    def get_rating(self, obj):
        return getattr(obj.profile, "rating", 0.0) or 0.0

    def get_address(self, obj):
        return getattr(obj.profile, "address", None)

    def get_palavras_chave(self, obj):
        return getattr(obj.profile, "palavras_chave", "") or ""

    def get_photo(self, obj):
        photo = getattr(obj.profile, "photo", None)
        return photo.url if photo else None

    def get_demands_count(self, obj):
        # reservado para uso futuro
        return 0

    def get_profession(self, obj):
        """
        Prioridade:
        1️⃣ profile.profession
        2️⃣ fallback palavras-chave
        """
        profession = getattr(obj.profile, "profession", None)
        if profession:
            return profession

        palavras = getattr(obj.profile, "palavras_chave", "")
        if palavras:
            return palavras.split(",")[0].strip()

        return None


# -------------------------------------------------------------------
# 4. LOGIN VIA TOKEN (E-MAIL)
# -------------------------------------------------------------------
class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(
        style={"input_type": "password"},
        trim_whitespace=False,
        write_only=True,
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(
                _("É necessário informar e-mail e senha.")
            )

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                _("Credenciais inválidas."),
                code="authorization",
            )

        attrs["user"] = user
        return attrs
