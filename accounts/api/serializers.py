# accounts/api/serializers.py

from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from rest_framework import serializers

from accounts.models import User, Profile


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
    # 🔴 campo de foto — opcional
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        # não enviamos o user nem a rating diretamente
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
    # email é o campo de login, não deve ser editado aqui
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
        Atualiza o User e o Profile aninhado.
        Aqui está o ponto crítico para a foto (photo) ser salva de verdade.
        """
        # dados aninhados do profile
        profile_data = validated_data.pop("profile", None)
        is_professional = validated_data.pop("is_professional", None)

        old_is_professional = instance.is_professional

        if is_professional is not None:
            instance.is_professional = is_professional

        # atualiza campos do User
        instance = super().update(instance, validated_data)
        instance.save()

        # garante que o Profile exista
        profile_instance, _ = Profile.objects.get_or_create(user=instance)

        # se mudou de profissional -> cliente, limpamos campos de profissional
        if old_is_professional is True and instance.is_professional is False:
            profile_instance.bio = ""
            profile_instance.address = ""
            profile_instance.cnpj = ""
            profile_instance.palavras_chave = ""
            profile_instance.save()

        # se veio profile_data, atualiza (INCLUINDO FOTO)
        if profile_data is not None:
            # ⚠️ AQUI é onde garantimos que o ImageField (photo) é processado corretamente
            profile_serializer = ProfileSerializer(
                instance=profile_instance,
                data=profile_data,
                partial=True,
                context=self.context,  # mantém acesso a request/FIL ES etc.
            )
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()

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
        """
        TODO: ligar com o modelo real de Demanda.
        Por enquanto retornamos 0 para não quebrar nada.
        """
        return 0

    def get_profession(self, obj):
        """
        Futuro: usar Profile.profession se existir.
        Por enquanto, devolve a primeira palavra-chave como rótulo de profissão.
        """
        if hasattr(obj, "profile") and hasattr(obj.profile, "profession") and obj.profile.profession:
            return obj.profile.profession

        if hasattr(obj, "profile") and obj.profile.palavras_chave:
            first = obj.profile.palavras_chave.split(",")[0].strip()
            return first or None

        return None


# -------------------------------------------------------------------
# 4. Serializer customizado para LOGIN por e-mail
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
            # IMPORTANTE: authenticate aceita "username=<email>" pois seu User.USERNAME_FIELD = 'email'
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
