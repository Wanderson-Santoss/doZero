# accounts/api/serializers.py

from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from rest_framework import serializers

from accounts.models import User, Profile, PortfolioItem


# -------------------------------------------------------------------
# 1. PROFILE SERIALIZER (dados do Profile)
# -------------------------------------------------------------------
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Profile, com campos opcionais para permitir PATCH.
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

    class Meta:
        model = Profile
        exclude = ("user", "rating")
        read_only_fields = ("rating",)


# -------------------------------------------------------------------
# 2. FULL PROFILE SERIALIZER (User + Profile do usuário logado)
# -------------------------------------------------------------------
class FullProfileSerializer(serializers.ModelSerializer):
    """
    Retorna e atualiza dados do User + Profile.
    Usado em /api/v1/accounts/perfil/me/
    """

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

        if not hasattr(instance, "profile") or instance.profile is None:
            profile_instance = Profile.objects.create(user=instance)
        else:
            profile_instance = instance.profile

        if old_is_professional is True and instance.is_professional is False:
            profile_instance.bio = ""
            profile_instance.address = ""
            profile_instance.cnpj = ""
            profile_instance.palavras_chave = ""
            profile_instance.save()

        if profile_data is not None:
            profile_serializer = self.fields["profile"]
            profile_serializer.update(profile_instance, profile_data)

        return instance


# -------------------------------------------------------------------
# 3. PUBLIC PROFESSIONAL SERIALIZER (listagem / detalhe público)
# -------------------------------------------------------------------
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer usado na listagem pública de profissionais.
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
        if hasattr(obj, "profile") and obj.profile and obj.profile.full_name:
            return obj.profile.full_name
        return obj.email

    def get_bio(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return obj.profile.bio
        return None

    def get_rating(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return obj.profile.rating or 0.0
        return 0.0

    def get_address(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return obj.profile.address
        return None

    def get_palavras_chave(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return obj.profile.palavras_chave or ""
        return ""

    def get_photo(self, obj):
        """
        Retorna a URL da foto de perfil, se existir.
        """
        if hasattr(obj, "profile") and getattr(obj.profile, "photo", None):
            try:
                return obj.profile.photo.url
            except Exception:
                return None
        return None

    def get_demands_count(self, obj):
        # Aqui no futuro podemos integrar com o app de demandas
        return 0

    def get_profession(self, obj):
        if hasattr(obj, "profile") and hasattr(obj.profile, "profession") and obj.profile.profession:
            return obj.profile.profession

        if hasattr(obj, "profile") and obj.profile.palavras_chave:
            first = obj.profile.palavras_chave.split(",")[0].strip()
            return first or None

        return None


# -------------------------------------------------------------------
# 4. PORTFOLIO ITEM SERIALIZER
# -------------------------------------------------------------------
class PortfolioItemSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioItem
        fields = ("id", "file_url", "is_video", "created_at")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


# -------------------------------------------------------------------
# 5. Serializer customizado para LOGIN por e-mail
# -------------------------------------------------------------------
class CustomAuthTokenSerializer(serializers.Serializer):
    """
    Serializer de login que usa EMAIL + PASSWORD.
    Compatível com CustomUser (USERNAME_FIELD = 'email').
    Usado por accounts.api.views.CustomAuthToken (ObtainAuthToken).
    """

    email = serializers.EmailField(
        label=_("E-mail"),
        write_only=True,
    )
    password = serializers.CharField(
        label=_("Senha"),
        style={"input_type": "password"},
        trim_whitespace=False,
        write_only=True,
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(
                request=self.context.get("request"),
                username=email,
                password=password,
            )
            if not user:
                msg = _("Não foi possível fazer login com essas credenciais.")
                raise serializers.ValidationError(msg, code="authorization")
        else:
            msg = _("É necessário informar e-mail e senha.")
            raise serializers.ValidationError(msg, code="authorization")

        attrs["user"] = user
        return attrs
