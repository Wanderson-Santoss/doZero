from rest_framework import serializers
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer
from django.db import transaction

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
        if not hasattr(instance, "profile") or instance.profile is None:
            profile_instance = Profile.objects.create(user=instance)
        else:
            profile_instance = instance.profile

        # se mudou de profissional -> cliente, limpamos campos de profissional
        if old_is_professional is True and instance.is_professional is False:
            profile_instance.bio = ""
            profile_instance.address = ""
            profile_instance.cnpj = ""
            profile_instance.palavras_chave = ""
            profile_instance.save()

        # se veio profile_data, atualiza
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
        Quando você adicionar um campo de foto, pode retornar a URL aqui.
        Por enquanto, devolvemos None e o frontend usa avatar com iniciais.
        """
        if hasattr(obj, "profile") and hasattr(obj.profile, "photo") and obj.profile.photo:
            try:
                return obj.profile.photo.url
            except Exception:
                return None
        return None

    def get_demands_count(self, obj):
        """
        Número de demandas concluidas por esse profissional.
        Ajuste o import/consulta de acordo com o seu app 'demands'.
        """
        try:
            from demands.models import Demand  # ajuste se o nome do app/model for outro
        except Exception:
            return 0

        return Demand.objects.filter(
            professional=obj,
            status="completed",  # ajuste para o status que significa "trabalho concluído"
        ).count()

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
class CustomAuthTokenSerializer(DRFAuthTokenSerializer):
    """
    Configura o serializer de login para usar 'email' no lugar de 'username'.
    """
    username_field = "email"
