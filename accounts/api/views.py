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
# 1. LISTAGEM PÚBLICA DE PROFISSIONAIS
# -------------------------------------------------------------------
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        User.objects.filter(is_professional=True, profile__isnull=False)
        .select_related("profile")
        .order_by("id")
    )

    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [SearchFilter]
    search_fields = [
        "email",
        "profile__full_name",
        "profile__palavras_chave",
        "profile__address",
    ]


# -------------------------------------------------------------------
# 2. PERFIL DO USUÁRIO LOGADO
# -------------------------------------------------------------------
class ProfileViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = FullProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request, *args, **kwargs):
        self.kwargs["pk"] = request.user.pk
        if request.method.lower() == "get":
            return self.retrieve(request)
        return self.update(request)


# -------------------------------------------------------------------
# 3. LOGIN
# -------------------------------------------------------------------
class CustomAuthToken(ObtainAuthToken):
    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


# -------------------------------------------------------------------
# 4. CADASTRO
# -------------------------------------------------------------------
@method_decorator(csrf_exempt, name="dispatch")
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()

        if "password" in data:
            data["password1"] = data.pop("password")

        profile_data = data.get("profile")
        if isinstance(profile_data, dict):
            data.update(profile_data)

        form = ClientProfessionalCreationForm(data)

        if form.is_valid():
            user = form.save(request)
            profile = user.profile

            if user.is_professional:
                profile.profession = data.get("profession", "")
                profile.cnpj = data.get("cnpj") or None
                profile.bio = data.get("bio", "")
                profile.cep = data.get("cep", "")
                profile.address = data.get("address", "")
                profile.has_completed_professional_setup = True
                profile.save()

            return Response(
                {
                    "message": "Cadastro realizado com sucesso!",
                    "user_id": user.id,
                    "is_professional": user.is_professional,
                    "profession": profile.profession,
                    "cnpj": profile.cnpj,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


CadastroView = RegisterAPIView


# -------------------------------------------------------------------
# 5. UPLOAD DE FOTO DE PERFIL
# -------------------------------------------------------------------
class ProfilePhotoUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        photo = request.FILES.get("photo")

        if not photo:
            return Response(
                {"detail": "Nenhuma imagem enviada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.photo = photo
        profile.save()

        return Response({"photo": profile.photo.url}, status=200)


# -------------------------------------------------------------------
# 6. PORTFÓLIO (✅ CORRIGIDO)
# -------------------------------------------------------------------
class PortfolioItemListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        professional_id = request.query_params.get("professional_id")

        if not professional_id:
            return Response([], status=200)

        items = PortfolioItem.objects.filter(
            profile__user__id=professional_id
        ).order_by("-created_at")

        return Response(
            [
                {
                    "id": item.id,
                    "file": item.file.url if item.file else None,
                    "is_video": item.is_video,
                    "created_at": item.created_at.isoformat(),
                }
                for item in items
            ]
        )

    def post(self, request):
        profile = request.user.profile

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "Nenhum arquivo enviado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_video = str(request.data.get("is_video", "false")).lower() in (
            "true",
            "1",
            "yes",
        )

        # ✅ CORRETO
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


# -------------------------------------------------------------------
# 7. VIRAR PROFISSIONAL
# -------------------------------------------------------------------
class BecomeProfessionalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = user.profile

        if user.is_professional:
            return Response(
                {"detail": "Usuário já é profissional."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        confirm = request.data.get("confirm")
        profession = request.data.get("profession")
        cnpj = request.data.get("cnpj", None)

        if confirm is not True:
            return Response(
                {"detail": "Confirmação obrigatória."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not profession:
            return Response(
                {"detail": "Profissão é obrigatória."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_professional = True
        user.save()

        profile.profession = profession
        profile.cnpj = cnpj
        profile.has_completed_professional_setup = True
        profile.save()

        return Response(
            {
                "message": "Usuário agora é profissional.",
                "is_professional": True,
                "profession": profile.profession,
                "cnpj": profile.cnpj,
            },
            status=status.HTTP_200_OK,
        )
