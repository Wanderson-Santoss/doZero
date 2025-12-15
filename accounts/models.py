from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver


# ===============================================================
# 1. Custom User Manager — login usando e-mail
# ===============================================================
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O endereço de e-mail deve ser definido.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superusuário deve ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superusuário deve ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


# ===============================================================
# 2. Custom User Model — login por e-mail
# ===============================================================
class User(AbstractUser):
    username = None
    email = models.EmailField(_("Endereço de e-mail"), unique=True)

    is_professional = models.BooleanField(
        default=False,
        verbose_name=_("É Profissional?"),
        help_text=_("Define se o usuário será tratado como prestador de serviços."),
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = _("Usuário")
        verbose_name_plural = _("Usuários")


# ===============================================================
# 3. Profile Model — dados adicionais do usuário
# ===============================================================
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    # Dados pessoais
    full_name = models.CharField(_("Nome Completo"), max_length=255, blank=True, null=True)
    cpf = models.CharField(_("CPF"), max_length=11, unique=True, blank=True, null=True)
    phone_number = models.CharField(_("Telefone"), max_length=15, blank=True, null=True)

    # Localização
    cep = models.CharField(_("CEP"), max_length=8, blank=True, null=True)
    address = models.CharField(_("Endereço/Cidade"), max_length=255, blank=True, null=True)

    # Informações profissionais
    bio = models.TextField(_("Sobre Mim"), blank=True, null=True)
    cnpj = models.CharField(_("CNPJ"), max_length=14, blank=True, null=True)

    palavras_chave = models.TextField(
        _("Palavras-Chave/Tags"),
        blank=True,
        default="",
        help_text="Ex: Pedreiro, Pintor, Eletricista",
    )

    profession = models.CharField(
        _("Profissão principal"),
        max_length=100,
        blank=True,
        null=True,
    )

    # Foto
    photo = models.ImageField(
        _("Foto de Perfil"),
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    # ⭐ Avaliação — começa SEMPRE com 5 estrelas
    rating = models.DecimalField(
        _("Avaliação Média"),
        max_digits=3,
        decimal_places=2,
        default=5.00,
    )

    has_completed_professional_setup = models.BooleanField(default=False)

    def __str__(self):
        return f"Perfil de {self.user.email}"

    class Meta:
        verbose_name = _("Perfil")
        verbose_name_plural = _("Perfis")


# ===============================================================
# 4. Signals — cria Profile automaticamente
# ===============================================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()


# ===============================================================
# 5. PortfolioItem — fotos e vídeos do profissional
# ===============================================================
class PortfolioItem(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="portfolio_items",
    )

    file = models.FileField(upload_to="portfolio/")
    is_video = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Portfólio de {self.profile.user.email}"
