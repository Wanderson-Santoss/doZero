# accounts/api/views.py

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets, permissions, mixins, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter

from accounts.models import User, Profile, PortfolioItem
from accounts.forms import ClientProfessionalCreationForm
from .serializers import (
    ProfessionalSerializer,
    FullProfileSerializer,
    CustomAuthTokenSerializer,
)

# -------------------------------------------------------------------
# 1. LISTAGEM / DETALHE PÚBLICO DE PROFISSIONAIS
#    /api/v1/accounts/profissionais/
# -------------------------------------------------------------------
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista apenas usuários que são profissionais (is_professional=True)
    e possuem Profile, com busca em nome, e-mail, palavras_chave, etc.
    """

    queryset = (
        User.objects.filter(is_professional=True, profile__isnull=False)
        .select_related("profile")
        .order_by("id")
    )

    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [SearchFilter]
    search_fields = [
        "=email",
        "profile__full_name",
        "profile__palavras_chave",
        "profile__address",
    ]


# -------------------------------------------------------------------
# 2. PERFIL DO USUÁRIO LOGADO (User + Profile)
#    /api/v1/accounts/perfil/me/
# -------------------------------------------------------------------
class ProfileViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Permite ao usuário autenticado visualizar e editar seu próprio perfil
    (modelo User + Profile via FullProfileSerializer).
    """

    serializer_class = FullProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # sempre trabalha só com o usuário logado
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request, *args, **kwargs):
        """
        GET  /api/v1/accounts/perfil/me/      -> dados do próprio usuário
        PUT  /api/v1/accounts/perfil/me/      -> atualiza todos os campos
        PATCH /api/v1/accounts/perfil/me/     -> atualiza parcial
        """
        self.kwargs["pk"] = self.request.user.pk

        if request.method.lower() == "get":
            return self.retrieve(request, *args, **kwargs)

        return self.update(request, *args, **kwargs)


# -------------------------------------------------------------------
# 3. LOGIN POR TOKEN (e-mail + senha)
#    /api/v1/auth/login/
# -------------------------------------------------------------------
class CustomAuthToken(ObtainAuthToken):
    """
    View customizada para login via token usando e-mail como credencial.
    """

    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


# -------------------------------------------------------------------
# 4. CADASTRO (usado pelo React)
#    /api/v1/accounts/cadastro/   ou   /api/v1/accounts/register/
# -------------------------------------------------------------------
@method_decorator(csrf_exempt, name="dispatch")
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    """
    View de registro que aceita JSON do React, usa ClientProfessionalCreationForm
    para validação e cria o usuário e perfil.
    """

    def post(self, request):
        # O DRF pega o JSON do corpo da requisição em request.data
        data = request.data.copy()

        # O formulário espera 'password1' e 'password2'
        # O React envia 'password' e 'password2'. Mapeamos 'password' -> 'password1'
        if "password" in data:
            data["password1"] = data.pop("password")

        # Se o frontend estiver enviando dados de perfil agrupados:
        # { ..., profile: { full_name, cpf, phone_number, ... } }
        profile_data = data.get("profile")
        if isinstance(profile_data, dict):
            data.update(profile_data)

        # Instancia e valida o Form com os dados reformatados
        form = ClientProfessionalCreationForm(data)

        if form.is_valid():
            try:
                user = form.save(request)
                return Response(
                    {
                        "message": "Cadastro realizado com sucesso!",
                        "user_id": user.id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response(
                    {"detail": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Erros de validação do formulário
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


# Alias usado nas urls antigas
CadastroView = RegisterAPIView


# -------------------------------------------------------------------
# 5. UPLOAD DA FOTO DE PERFIL
#    POST /api/v1/accounts/perfil/me/photo/
# -------------------------------------------------------------------
class ProfilePhotoUploadView(APIView):
    """
    Endpoint para o usuário logado enviar/atualizar a foto de perfil.
    Usado pelo botão de trocar foto na tela "Meu Portfólio".
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile: Profile = user.profile

        photo = request.FILES.get("photo")
        if not photo:
            return Response(
                {"detail": "Nenhuma imagem enviada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.photo = photo
        profile.save()

        return Response(
            {"photo": profile.photo.url},
            status=status.HTTP_200_OK,
        )


# -------------------------------------------------------------------
# 6. PORTFÓLIO (FOTOS / VÍDEOS)
#    GET/POST /api/v1/accounts/portfolio/
#    DELETE   /api/v1/accounts/portfolio/<id>/
# -------------------------------------------------------------------
class PortfolioItemListCreateView(APIView):
    """
    Lista e cria itens de portfólio (fotos/vídeos) do profissional logado.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Lista TODOS os itens do portfólio do usuário logado.
        """
        profile = request.user.profile
        items = PortfolioItem.objects.filter(profile=profile).order_by("-created_at")

        data = []
        for item in items:
            file_url = item.file.url
            data.append(
                {
                    "id": item.id,
                    "file": file_url,
                    "is_video": item.is_video,
                    "created_at": item.created_at.isoformat(),
                }
            )

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Cria um novo item de portfólio.
        Espera:
        - file (FileField - imagem ou vídeo)
        - is_video (bool, opcional — padrão False)
        """
        profile = request.user.profile

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "Nenhum arquivo enviado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_video_raw = request.data.get("is_video", "false")
        # aceita 'true'/'false' como string
        is_video = str(is_video_raw).lower() in ["true", "1", "yes"]

        item = PortfolioItem.objects.create(
            profile=profile,
            file=file_obj,
            is_video=is_video,
        )

        return Response(
            {
                "id": item.id,
                "file": item.file.url,
                "is_video": item.is_video,
                "created_at": item.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class PortfolioItemDestroyView(APIView):
    """
    Deleta um item de portfólio do usuário logado.
    """

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        profile = request.user.profile

        try:
            item = PortfolioItem.objects.get(pk=pk, profile=profile)
        except PortfolioItem.DoesNotExist:
            return Response(
                {"detail": "Item não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
