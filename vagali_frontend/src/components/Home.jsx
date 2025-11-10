import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';

const Home = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Endpoint protegido para buscar o perfil do usuário logado
    const PROFILE_URL = '/api/v1/accounts/perfil/me/'; 

    const handleLogout = () => {
        // Remove o token do localStorage
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/login'); // Redireciona para o login após o logout
        window.location.reload(); // Garante que o Header e outros componentes atualizem
    };
    
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        
        if (token) {
            setIsLoggedIn(true);
            fetchUserData(token);
        } else {
            setIsLoggedIn(false);
            setLoading(false); 
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await axios.get(PROFILE_URL, {
                headers: {
                    // ESSENCIAL: Enviar o token no cabeçalho Authorization
                    'Authorization': `Token ${token}` 
                }
            });
            // O FullProfileSerializer retorna os dados do User e o Profile aninhado
            setUserData(response.data);
            setIsLoggedIn(true);

        } catch (err) {
            // Se o token for inválido/expirado (ex: erro 401 Unauthorized), limpa o token.
            console.error("Erro ao buscar dados do usuário:", err.response || err);
            localStorage.removeItem('userToken');
            setIsLoggedIn(false);
            setError("Sessão expirada ou inválida. Por favor, faça login novamente.");
            
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" role="status" style={{ color: 'var(--primary-color)' }}>
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
                <p className="mt-2">Verificando autenticação...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4" style={{ color: 'var(--primary-color)' }}>Página Inicial (Home)</h1>
            
            <Card className="p-4 shadow">
                {isLoggedIn && userData ? (
                    <div>
                        <Alert variant="success">
                            **Autenticado com sucesso.**
                        </Alert>
                        {/* Acessa o nome completo dentro do objeto 'profile' */}
                        <p>Bem-vindo(a), **{userData.profile.full_name || userData.email}**!</p>
                        <p>Você é um(a) **{userData.is_professional ? 'Profissional' : 'Cliente'}**.</p>
                        
                        <details style={{ marginTop: '15px' }}>
                            <summary>Ver Dados do Perfil (Debugging)</summary>
                            <pre style={{ overflowX: 'auto', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px', fontSize: '12px' }}>
                                {JSON.stringify(userData, null, 2)}
                            </pre>
                        </details>
                        
                        <button 
                            onClick={handleLogout} 
                            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Sair (Logout)
                        </button>
                    </div>
                ) : (
                    <div>
                        <Alert variant="warning">
                            ⚠️ **Você não está logado.**
                        </Alert>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <button 
                            onClick={() => navigate('/login')}
                            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Ir para Login
                        </button>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default Home;