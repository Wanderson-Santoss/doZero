# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile

# 1. Inline para exibir o Profile dentro da página de edição do User
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Perfil'
    fields = ('full_name', 'cpf', 'phone_number', 'bio', 'address', 'cnpj', 'profile_picture')


# 2. Admin customizado para o User
class UserAdmin(BaseUserAdmin):
    # Campos que você quer ver na lista
    list_display = ('email', 'is_professional', 'is_staff', 'is_active')
    
    # Campos que você quer editar (Customizando o fields do BaseUserAdmin)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('is_professional',)}), # Adicionamos o nosso campo aqui
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Adicionamos o Profile como um "inline"
    inlines = (ProfileInline,)
    
    # O campo de login é o e-mail, não o username
    ordering = ('email',)


# 3. Registre o modelo customizado
admin.site.register(User, UserAdmin)