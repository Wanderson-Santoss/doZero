# accounts/api/serializers.py

from rest_framework import serializers
from accounts.models import User, Profile
from django.db import transaction # Importamos para garantir que User e Profile sejam salvos juntos
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer

# --- 1. Serializer do Modelo Profile ---
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        # Excluímos 'rating' e 'user' pois o usuário não deve editá-los diretamente
        exclude = ('user', 'rating')
        read_only_fields = ('rating',) # Garante que rating só pode ser lido

# --- 2. Serializer do Modelo User (para edição de e-mail e profissional) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_professional')
        read_only_fields = ('email', 'is_professional') # Impedimos a alteração via esta rota

# --- 3. Serializer Mestre: Perfil Completo (User + Profile) ---
class FullProfileSerializer(serializers.ModelSerializer):
    """
    Serializer que encapsula o modelo User (para dados básicos) e o Profile (para detalhes).
    """
    
    # Aninha o ProfileSerializer aqui para que os dados do perfil apareçam em um bloco 'profile'
    profile = ProfileSerializer(required=True)
    
    # Expõe campos importantes do User diretamente na raiz (read-only)
    is_professional = serializers.BooleanField(source='user.is_professional', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = User
        # Exponha campos relevantes, mas user e profile são tratados abaixo
        fields = (
            'id', 
            'email', 
            'is_professional', 
            'profile'
        )
        read_only_fields = ('id',) # Apenas a chave primária é read-only

    @transaction.atomic # Garante que se uma parte falhar, tudo é revertido
    def update(self, instance, validated_data):
        """ 
        Lida com a atualização do User (instance) e do Profile aninhado.
        """
        # Pega os dados do Profile que vieram do JSON
        profile_data = validated_data.pop('profile')

        # 1. Atualiza o modelo User (apenas se houver dados User para atualizar, embora limitados)
        instance = super().update(instance, validated_data)

        # 2. Atualiza o modelo Profile relacionado
        profile_serializer = self.fields['profile']
        
        # Pega a instância do Profile relacionada ao User atual
        profile_instance = instance.profile

        # Chama o update do ProfileSerializer com a instância e os dados
        profile_serializer.update(profile_instance, profile_data)
        
        return instance
    
# --- 4. Serializer para Listagem Pública de Profissionais (Novo) ---
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer para a listagem pública de profissionais (apenas dados essenciais).
    """
    # Aninhamos o ProfileSerializer aqui também, mas com campos limitados, se desejar.
    # Por enquanto, vamos expor os dados básicos do User e o nome completo do Profile.
    full_name = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'bio', 'rating')
        
    def get_full_name(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') and obj.profile.full_name else obj.email

    def get_bio(self, obj):
        return obj.profile.bio if hasattr(obj, 'profile') else None

    def get_rating(self, obj):
        return obj.profile.rating if hasattr(obj, 'profile') else 0.00
    

class CustomAuthTokenSerializer(DRFAuthTokenSerializer):
    """ Configura o Serializer de Login para usar 'email' em vez de 'username'. """
    username_field = 'email'