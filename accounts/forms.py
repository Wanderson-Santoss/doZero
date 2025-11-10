# accounts/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Profile

class ClientProfessionalCreationForm(UserCreationForm):
    # Campos do User (email, password e o novo is_professional)
    class Meta:
        model = User
        fields = ('email', 'is_professional')
    
    # Campos do Profile
    full_name = forms.CharField(label='Nome Completo', max_length=255)
    cpf = forms.CharField(label='CPF', max_length=11)
    phone_number = forms.CharField(label='Telefone (com DDD)', max_length=15, required=False)
    
    # Campo para confirmar a senha (adicionado pelo UserCreationForm, mas garantido aqui)
    password2 = forms.CharField(label='Confirme a senha', widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Removemos o campo 'username' que pode ser herdado, caso você não o tenha removido totalmente
        if 'username' in self.fields:
            del self.fields['username']

    # Método crucial para salvar os dois modelos
    def save(self, commit=True):
        # 1. Salva o User (email, senha e is_professional)
        user = super().save(commit=False)
        if commit:
            user.save()
            
            # 2. Salva o Profile, que é criado via sinal, e o atualiza
            # O Profile é criado automaticamente pelo sinal, agora nós o preenchemos.
            user.profile.full_name = self.cleaned_data.get('full_name')
            user.profile.cpf = self.cleaned_data.get('cpf')
            user.profile.phone_number = self.cleaned_data.get('phone_number')
            user.profile.save()
            
        return user