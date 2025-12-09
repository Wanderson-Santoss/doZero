# accounts/api/views.py

from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.models import User, Profile
from .serializers import ProfessionalSerializer, FullProfileSerializer, CustomAuthTokenSerializer


# --- 1. ViewSet para a listagem pública de profissionais (COM BUSCA) ---
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista apenas usuários que são profissionais (is_professional=True) e permite busca.
    Endpoint: /api/v1/accounts/profissionais/
    """

    # Filtra por is_professional=True E profile__isnull=False.
    queryset = (
        User.objects
        .filter(is_professional=True, profile__isnull=False)
        .select_related("profile")
    )

    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Ativar o SearchFilter
    filter_backends = [SearchFilter]

    # Campos usados na busca
    search_fields = [
        "=email",
        "profile__full_name",
        "profile__palavras_chave",
        "profile__address",
    ]


# --- 2. ViewSet para o Perfil do Usuário Logado ---
class ProfileViewSet(mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin,
                     viewsets.GenericViewSet):
    """
    Permite ao usuário autenticado (Cliente ou Profissional) visualizar e editar
    seu próprio perfil (modelo User + Profile).

    Rotas:
      - GET /api/v1/accounts/perfil/me/
      - PUT/PATCH /api/v1/accounts/perfil/me/
      - POST /api/v1/accounts/perfil/me/photo/  (atualizar foto de perfil)
    """

    serializer_class = FullProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Aceita JSON, form e multipart (upload de arquivo)
    parser_classes = (MultiPartParser, FormParser,)

    def get_queryset(self):
        # A view deve sempre operar no perfil do usuário logado
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request, *args, **kwargs):
        """
        GET -> retorna dados do usuário logado
        PUT/PATCH -> atualiza dados do usuário + profile (exceto foto, que tratamos em uma rota própria)
        """
        self.kwargs["pk"] = self.request.user.pk

        if request.method == "GET":
            return self.retrieve(request, *args, **kwargs)

        return self.update(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["post"],
        url_path="me/photo",
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_photo(self, request, *args, **kwargs):
        """
        Endpoint específico para atualizar apenas a foto de perfil.

        POST /api/v1/accounts/perfil/me/photo/
        body (multipart/form-data):
          - photo: <arquivo de imagem>
        """
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        file_obj = request.FILES.get("photo")
        if not file_obj:
            return Response(
                {"detail": 'Nenhum arquivo enviado em "photo".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.photo = file_obj
        profile.save()

        # retornamos o perfil atualizado (user + profile)
        serializer = FullProfileSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- 3. View Customizada para Login ---
class CustomAuthToken(ObtainAuthToken):
    """
    View customizada para login via token.
    Endpoint: /api/v1/auth/login/
    """
    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
