from rest_framework import viewsets, permissions
from rest_framework import exceptions
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q 
from app_servicos.models import Service, Demanda, Feedback, Offer 
from .serializers import ( 
    ServiceSerializer, 
    DemandaSerializer, 
    FeedbackSerializer,
    OfferSerializer
)


# --- 1. ViewSet para Serviços (Público) ---
class ServiceViewSet(viewsets.ModelViewSet):
    """
    Lista todos os serviços disponíveis. Acesso público.
    """
    queryset = Service.objects.all().order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


# --- 2. ViewSet para Demandas (Restrito a Usuários Logados) ---
class DemandaViewSet(viewsets.ModelViewSet):
    """
    Permite a clientes criar demandas e a profissionais listar demandas abertas.
    """
    serializer_class = DemandaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descricao', 'cep', 'service__name']

    def get_queryset(self):
        """
        Define o queryset com base no tipo de usuário:
        - Cliente: Vê apenas suas demandas criadas.
        - Profissional: Vê todas as demandas ABERTAS.
        """
        user = self.request.user
        
        if not user.is_professional:
            return Demanda.objects.filter(client=user).order_by('-created_at')
        else:
            return Demanda.objects.filter(status='aberto').order_by('-created_at')

    def perform_create(self, serializer):
        """ 
        Ao criar a demanda (POST), o campo 'client' é preenchido automaticamente,
        mas SÓ SE ele NÃO for um profissional.
        """
        user = self.request.user
        
        if user.is_professional:
            raise exceptions.PermissionDenied("Profissionais não podem criar novas demandas.")
            
        serializer.save(client=user)
        
    def perform_update(self, serializer):
        """
        Permite que o Cliente edite a Demanda, mas impede a alteração manual do status.
        """
        user = self.request.user

        # 1. Garante que SÓ O CLIENTE PODE EDITAR
        if serializer.instance.client != user:
            raise exceptions.PermissionDenied("Você só pode editar suas próprias demandas.")
        
        # 2. Garante que o Cliente NÃO pode alterar o status manualmente
        if 'status' in serializer.validated_data:
            raise exceptions.PermissionDenied("O status da demanda só pode ser alterado por ações específicas (ex: aceitar oferta/concluir).")
            
        # 3. Salva a atualização (título, descrição, etc.)
        serializer.save()

    
    # Ação customizada para concluir a demanda
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def concluir(self, request, pk=None):
        """ Permite ao profissional atribuído marcar a demanda como concluída. """
        try:
            demanda = self.get_object()
        except Exception:
            return Response({'detail': 'Demanda não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        
        # 1. Garante que SÓ O PROFISSIONAL ATRIBUÍDO pode concluir
        if user != demanda.professional:
            raise exceptions.PermissionDenied("Apenas o profissional atribuído pode concluir esta demanda.")

        # 2. Garante que a demanda está em progresso
        if demanda.status != 'em_progresso':
            return Response({'detail': 'A demanda não está em progresso.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Muda o status da DEMANDA para 'concluida'
        demanda.status = 'concluida'
        demanda.save()

        # 4. Retorna a demanda concluída
        serializer = self.get_serializer(demanda)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- 3. ViewSet para Feedback (Restrito a Clientes) ---
class FeedbackViewSet(viewsets.ModelViewSet):
    """
    Permite ao cliente deixar feedback para um profissional após a conclusão da demanda.
    """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """ Clientes veem apenas feedbacks que eles fizeram. """
        return Feedback.objects.filter(client=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """ 
        Ao criar o feedback, o campo 'client' é preenchido automaticamente, 
        e SÓ PODE ser criado por clientes, e SÓ SE a demanda estiver concluída.
        """
        user = self.request.user
        
        if user.is_professional:
            raise exceptions.PermissionDenied("Apenas clientes podem deixar feedback.")
            
        demanda = serializer.validated_data['demanda']
        
        # 1. Garante que a demanda pertence ao cliente
        if demanda.client != user:
            raise exceptions.PermissionDenied("Você só pode deixar feedback para suas próprias demandas.")

        # 2. Garante que a demanda está CONCLUÍDA
        if demanda.status != 'concluida':
            raise exceptions.PermissionDenied("O feedback só pode ser deixado após a conclusão do serviço.")
            
        # O campo 'client' é preenchido pelo usuário logado
        serializer.save(client=user) # <-- CORREÇÃO: Parêntese fechado aqui!


# --- 4. ViewSet para Ofertas (Restrito a Profissionais Criarem) ---
class OfferViewSet(viewsets.ModelViewSet):
    """
    Permite a Profissionais criar ofertas para demandas abertas.
    Permite a Clientes listar ofertas para suas demandas.
    """
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Profissional: Vê apenas as ofertas que ele enviou
        if user.is_professional:
            return Offer.objects.filter(professional=user).order_by('-created_at')
        
        # Cliente: Vê as ofertas feitas para as suas demandas
        return Offer.objects.filter(demanda__client=user).order_by('-created_at')

    def perform_create(self, serializer):
        """ 
        Garante que só um profissional pode criar uma oferta, e o campo
        'professional' é preenchido automaticamente.
        """
        user = self.request.user
        
        if not user.is_professional:
            raise exceptions.PermissionDenied("Apenas Profissionais podem fazer ofertas.")
        
        # Verifica se a demanda está aberta antes de permitir a oferta
        demanda = serializer.validated_data['demanda']
        if demanda.status != 'aberto':
            raise exceptions.PermissionDenied("Esta demanda não está aberta para ofertas.")

        serializer.save(professional=user)

    def perform_update(self, serializer):
        """
        Bloqueia a edição manual.
        """
        raise exceptions.PermissionDenied("A edição de ofertas não é permitida.")
    
    # Ação customizada para aceitar a oferta.
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def aceitar(self, request, pk=None):
        """ Permite ao cliente aceitar uma oferta. """
        try:
            oferta = self.get_object() # Pega a oferta pelo ID (pk)
        except Exception:
            return Response({'detail': 'Oferta não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        
        # 1. Garante que SÓ O CLIENTE da demanda pode aceitar
        if user != oferta.demanda.client:
            raise exceptions.PermissionDenied("Você não é o cliente desta demanda e não pode aceitar esta oferta.")

        # 2. Garante que a Demanda ainda está aberta
        if oferta.demanda.status != 'aberto':
            return Response({'detail': 'A demanda não está aberta para aceitação.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Muda o status da OFERTA para 'aceita'
        oferta.status = 'aceita'
        oferta.save()
        
        # 4. Muda o status da DEMANDA para 'em_progresso'
        demanda = oferta.demanda
        demanda.status = 'em_progresso'
        demanda.professional = oferta.professional # Atribui o profissional à demanda
        demanda.save()

        # 5. Rejeita todas as outras ofertas para esta demanda 
        Offer.objects.filter(demanda=demanda).exclude(pk=oferta.pk).update(status='rejeitada')

        # 6. Retorna a oferta aceita
        serializer = self.get_serializer(oferta)
        return Response(serializer.data, status=status.HTTP_200_OK)