from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter 

# Importações Absolutas (A partir do pacote 'accounts')
from accounts.models import User 
from accounts.forms import ClientProfessionalCreationForm 

# Importa Serializers (presumimos que estes estão no mesmo pacote)
from .serializers import ProfessionalSerializer, FullProfileSerializer, CustomAuthTokenSerializer 

# Importa a View de Cadastro de contas/views.py
from accounts.views import CadastroView 


# --- 1. ViewSet para a listagem pública de profissionais (COM BUSCA) ---
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista apenas usuários que são profissionais (is_professional=True) e permite busca.
    Endpoint: /api/v1/accounts/profissionais/
    """
    queryset = User.objects.filter(is_professional=True)
    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    # Ativar o SearchFilter
    filter_backends = [SearchFilter] 
    
    # Campos que serão buscados pelo SearchFilter (usando o parâmetro ?search=)
    search_fields = [
        '=email',                       # Busca exata (não prefixada)
        'profile__full_name',           # Nome completo
        'profile__servico_principal',   # Serviço principal
        'profile__cidade',              # Cidade
        'profile__estado',              # Estado             
    ]


# --- 2. ViewSet para o Perfil do Usuário Logado ---
class ProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Permite ao usuário autenticado (Cliente ou Profissional) visualizar e editar
    seu próprio perfil (modelo User + Profile).
    
    Rotas: GET, PUT/PATCH /api/v1/accounts/perfil/me/
    """
    serializer_class = FullProfileSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        self.kwargs['pk'] = self.request.user.pk
        
        if request.method == 'GET':
            return self.retrieve(request)
        
        return self.update(request)


# --- 3. View Customizada para Login ---
class CustomAuthToken(ObtainAuthToken):
    """
    View customizada para login via token.
    Endpoint: /api/v1/token/login/
    """
    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES