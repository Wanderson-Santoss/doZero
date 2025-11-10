from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt 
from django.utils.decorators import method_decorator
# Importamos o Form correto
from .forms import ClientProfessionalCreationForm

# A view de API agora se chama RegisterAPIView
@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):

    permission_classes = [permissions.AllowAny]
    """
    View de registro que aceita JSON do React, usa ClientProfessionalCreationForm para validação
    e cria o usuário e perfil.
    """
    def post(self, request):
        # O DRF pega o JSON do corpo da requisição em request.data
        data = request.data.copy()
        
        # O formulário espera 'password1' e 'password2' do Django Forms
        # O React envia 'password' e 'password2'. Mapeamos 'password' para 'password1'
        data['password1'] = data.pop('password') 
        
        # O formulário de criação de usuário do Django espera 'is_professional' diretamente
        # e os campos de perfil (full_name, cpf, phone_number) em data
        data.update(data.get('profile', {}))

        # 1. Instancia e valida o Form com os dados reformatados
        form = ClientProfessionalCreationForm(data)
        
        if form.is_valid():
            try:
                # 2. Salva o usuário e o perfil
                user = form.save(request)

                return Response(
                    {"message": "Cadastro realizado com sucesso!", "user_id": user.id},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                # Caso ocorra um erro de banco de dados ou outro erro ao salvar
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 3. Retorno de erro de validação (DRF retorna JSON dos erros do form)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

# Por compatibilidade, mantemos o nome original, mas apontando para a nova view.
CadastroView = RegisterAPIView