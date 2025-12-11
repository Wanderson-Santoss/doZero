# app_servicos/models.py

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

# --- Status de demandas ---
DEMANDA_STATUS_CHOICES = [
    ('pendente', 'Pendente'),
    ('aceita', 'Aceita'),
    ('em_andamento', 'Em Andamento'),
    ('concluida', 'Concluída'),
    ('cancelada', 'Cancelada'),
]

# --- Status de ofertas ---
OFFER_STATUS_CHOICES = [
    ('pendente', 'Pendente'),
    ('aceita', 'Aceita'),
    ('rejeitada', 'Rejeitada'),
]


# ---------------------------------------------------------
# 1. Tabela de Serviços (Eletricista, Pintura, Limpeza...)
# ---------------------------------------------------------
class Service(models.Model):
    name = models.CharField(_('Nome do Serviço'), max_length=100, unique=True)
    description = models.TextField(_('Descrição'))
    icon = models.CharField(_('Ícone'), max_length=50, default='🛠️')  # emoji ou icone

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Serviço')
        verbose_name_plural = _('Serviços')
        ordering = ['name']


# ---------------------------------------------------------
# 2. Demanda (Pedido de cliente)
# ---------------------------------------------------------
class Demanda(models.Model):

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='demandas_criadas',
        limit_choices_to={'is_professional': False}
    )

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandas_aceitas',
        limit_choices_to={'is_professional': True}
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='demandas'
    )

    titulo = models.CharField(_('Título'), max_length=255)
    descricao = models.TextField(_('Descrição'))
    cep = models.CharField(_('CEP'), max_length=8)

    # 🆕 Arquivos adicionados
    photos = models.FileField(upload_to="demandas/photos/", null=True, blank=True)
    videos = models.FileField(upload_to="demandas/videos/", null=True, blank=True)

    status = models.CharField(_('Status'), max_length=20, choices=DEMANDA_STATUS_CHOICES, default='pendente')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Demanda #{self.id} - {self.titulo}"

    class Meta:
        verbose_name = _('Demanda')
        verbose_name_plural = _('Demandas')
        ordering = ['-created_at']


# ---------------------------------------------------------
# 3. Offer (Proposta do profissional)
# ---------------------------------------------------------
class Offer(models.Model):

    demanda = models.ForeignKey(
        Demanda,
        on_delete=models.CASCADE,
        related_name='offers'
    )

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='offers_feitas',
        limit_choices_to={'is_professional': True}
    )

    proposta_valor = models.DecimalField(_('Valor'), max_digits=10, decimal_places=2)
    proposta_prazo = models.CharField(_('Prazo'), max_length=50)

    status = models.CharField(_('Status Oferta'), max_length=20, choices=OFFER_STATUS_CHOICES, default='pendente')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Oferta #{self.id} - {self.demanda.titulo}"

    class Meta:
        unique_together = ('demanda', 'professional')
        verbose_name = _('Oferta')
        verbose_name_plural = _('Ofertas')


# ---------------------------------------------------------
# 4. Feedback (Avaliação)
# ---------------------------------------------------------
class Feedback(models.Model):

    demanda = models.OneToOneField(
        Demanda,
        on_delete=models.CASCADE,
        related_name='feedback'
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_feitos',
        limit_choices_to={'is_professional': False}
    )

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_recebidos',
        limit_choices_to={'is_professional': True}
    )

    rating = models.PositiveSmallIntegerField(_('Avaliação'), choices=[(i, str(i)) for i in range(1, 6)])
    comentario = models.TextField(_('Comentário'), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Avaliação {self.rating} para {self.professional.email}"

    class Meta:
        verbose_name = _('Feedback')
        verbose_name_plural = _('Feedbacks')
