# accounts/models.py

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver


# --- 1. Custom User Manager (Necessário para usar E-mail como login) ---
class CustomUserManager(BaseUserManager):
    """
    Manager customizado que usa o e-mail como identificador único para autenticação.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O endereço de e-mail deve ser definido.')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Cria e salva um superusuário com o e-mail e senha fornecidos.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuário deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuário deve ter is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)


# --- 2. Custom User Model (A base do seu sistema de autenticação) ---
class User(AbstractUser):
    # Remove o campo 'username' padrão do AbstractUser
    username = None 
    
    # Campo principal de login (único e obrigatório)
    email = models.EmailField(_('endereço de e-mail'), unique=True)
    
    # Campo crucial para diferenciar Cliente (False) e Profissional (True)
    is_professional = models.BooleanField(
        default=False,
        verbose_name=_('É Profissional?'),
        help_text=_('Designa se o usuário deve ser tratado como profissional/prestador de serviço.')
    )
    
    # Atribui o manager customizado (CustomUserManager)
    objects = CustomUserManager() 
    
    # Configurações de Login (dizendo ao Django para usar 'email')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 
    
    def __str__(self):
        return self.email

    class Meta:
        verbose_name = _('Usuário')
        verbose_name_plural = _('Usuários')


# --- 3. Profile Model (Dados adicionais de Cliente/Profissional) ---
class Profile(models.Model):
    # Relacionamento One-to-One: todo Profile pertence a um User
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Dados do Cadastro (Geral)
    full_name = models.CharField(_('Nome Completo'), max_length=255, blank=True, null=True)
    cpf = models.CharField(_('CPF'), max_length=11, unique=True, blank=True, null=True) 
    phone_number = models.CharField(_('Telefone'), max_length=15, blank=True, null=True)
    
    # CEP (essencial para as demandas)
    cep = models.CharField(_('CEP'), max_length=8, blank=True, null=True)
    
    # Dados Adicionais (Para o Profissional)
    bio = models.TextField(_('Sobre Mim'), blank=True, null=True)
    address = models.CharField(_('Endereço/Cidade'), max_length=255, blank=True, null=True)
    cnpj = models.CharField(
        _('CNPJ'),
        max_length=14,
        blank=True,
        null=True,
        help_text=_('Opcional, para empresas.')
    )
    
    # Campo para o profissional listar suas habilidades e tags
    palavras_chave = models.TextField(
        'Palavras-Chave/Tags', 
        blank=True, 
        default='',
        help_text="Liste todos os termos de busca (Ex: Bolo, Brigadeiro, Cimento, Tinta)"
    )

    # Foto de perfil
    photo = models.ImageField(
        _('Foto de Perfil'),
        upload_to='profiles/',
        blank=True,
        null=True
    )

    # Avaliação Média
    rating = models.DecimalField(
        _('Avaliação Média'), max_digits=3, decimal_places=2, default=0.00
    )

    def __str__(self):
        return f"Perfil de {self.user.email}"
        
    class Meta:
        verbose_name = _('Perfil')
        verbose_name_plural = _('Perfis')


# --- 4. Signals (Garante que todo User tem um Profile automaticamente) ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Cria um objeto Profile sempre que um novo User é criado."""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Salva o objeto Profile sempre que o User é salvo."""
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)


# --- 5. PortfolioItem (Fotos/Vídeos do Portfólio) ---
class PortfolioItem(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="portfolio_items"
    )

    file = models.FileField(
        upload_to="portfolio/",
        verbose_name="Foto ou Vídeo"
    )

    is_video = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Portfólio de {self.profile.user.email}"
