from rest_framework import serializers
from accounts.models import User, Profile
from django.db import transaction
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer


# -------------------------------------------------------------------
# 1) ProfileSerializer  (PRECISA vir antes do FullProfileSerializer)
# -------------------------------------------------------------------
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Profile.
    A maioria dos campos é opcional para permitir PATCH parcial.
    """
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    cpf = serializers.CharField(required=False, allow_blank=True, max_length=11)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15)
    bio = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)
    cnpj = serializers.CharField(required=False, allow_blank=True, max_length=14)
    cep = serializers.CharField(required=False, allow_blank=True, max_length=8)
    palavras_chave = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Profile
        exclude = ("user", "rating")
        read_only_fields = ("rating",)


# -------------------------------------------------------------------
# 2) FullProfileSerializer  (User + Profile aninhado)
# -------------------------------------------------------------------
class FullProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    is_professional = serializers.BooleanField(required=False, allow_null=True)
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
        profile_data = validated_data.pop("profile", None)
        is_professional = validated_data.pop("is_professional", None)

        old_is_professional = instance.is_professional

        if is_professional is not None:
            instance.is_professional = is_professional

        instance = super().update(instance, validated_data)
        instance.save()

        # Garante que o Profile existe
        if not hasattr(instance, "profile") or instance.profile is None:
            profile_instance = Profile.objects.create(user=instance)
        else:
            profile_instance = instance.profile

        # Se deixou de ser profissional -> limpa campos específicos
        if old_is_professional is True and instance.is_professional is False:
            profile_instance.bio = ""
            profile_instance.address = ""
            profile_instance.cnpj = ""
            profile_instance.palavras_chave = ""
            profile_instance.save()

        # Atualiza dados do Profile se veio no payload
        if profile_data is not None:
            profile_serializer = self.fields["profile"]
            profile_serializer.update(profile_instance, profile_data)

        return instance


# -------------------------------------------------------------------
# 3) ProfessionalSerializer (listagem pública de profissionais)
# -------------------------------------------------------------------
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Dados públicos dos profissionais
    """
    full_name = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    palavras_chave = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()  # futuro: foto real

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
        )

    def get_full_name(self, obj):
        if getattr(obj, "profile", None) and obj.profile.full_name:
            return obj.profile.full_name
        return obj.email

    def get_bio(self, obj):
        if getattr(obj, "profile", None):
            return obj.profile.bio
        return None

    def get_rating(self, obj):
        if getattr(obj, "profile", None):
            return obj.profile.rating
        return 0.0

    def get_address(self, obj):
        if getattr(obj, "profile", None):
            return obj.profile.address
        return None

    def get_palavras_chave(self, obj):
        if getattr(obj, "profile", None):
            return obj.profile.palavras_chave or ""
        return ""

    def get_photo(self, obj):
        # quando você tiver campo de foto no Profile, mapeia aqui.
        return None


# -------------------------------------------------------------------
# 4) CustomAuthTokenSerializer (login por email)
# -------------------------------------------------------------------
class CustomAuthTokenSerializer(DRFAuthTokenSerializer):
    """Configura o Serializer de Login para usar 'email' em vez de 'username'."""
    username_field = "email"
