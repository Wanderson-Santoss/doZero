import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Spinner } from 'react-bootstrap';

function Logout() {
    const navigate = useNavigate();
    
    // Endpoint do DRF para invalidar o token (Opcional, mas boa prática)
    // Se você estiver usando o Djoser ou um endpoint customizado, use-o aqui.
    // Se não, limpar o local storage já é suficiente.
    const LOGOUT_URL = '/api/v1/auth/logout/'; 

    useEffect(() => {
        const handleLogout = async () => {
            const token = localStorage.getItem('userToken');

            // 1. Enviar requisição de logout para o backend (Opcional)
            // Isso invalida o token no lado do servidor.
            if (token) {
                try {
                    // O backend já espera o token no header
                    await axios.post(LOGOUT_URL); 
                } catch (error) {
                    // Geralmente, ignoramos erros aqui, pois o objetivo principal é limpar o frontend.
                    console.error("Erro ao invalidar token no servidor (Não crítico):", error);
                }
            }

            // 2. Limpa o token do armazenamento local
            localStorage.removeItem('userToken');

            // 3. Remove o token do header global do Axios
            delete axios.defaults.headers.common['Authorization'];

            // 4. Redireciona para a tela de login
            navigate('/login');
        };

        handleLogout();
    }, [navigate]); 

    // Renderiza algo simples enquanto o redirecionamento acontece
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 text-center">
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="text-white-50 mt-3 mb-0">Saindo...</p>
            </Card>
        </Container>
    );
}

export default Logout;