import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button, Row, Col } from 'react-bootstrap';
import { PersonCircle, PencilSquare, LockFill } from 'react-bootstrap-icons';

const ProfileUser = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Endpoint protegido para buscar o perfil do usuário logado
    const PROFILE_URL = '/api/v1/accounts/perfil/me/'; 

    const handleLogout = () => {
        // 1. Remove o token do localStorage
        localStorage.removeItem('userToken');
        
        // 2. Remove o token do header global do Axios (boa prática)
        delete axios.defaults.headers.common['Authorization'];
        
        // 3. Limpa estados e redireciona
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/'); 
        
        // 4. Força um recarregamento para que o Header mude instantaneamente
        window.location.reload(); 
    };
    
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        
        if (token) {
            setIsLoggedIn(true);
            fetchUserData(token);
        } else {
            // Se não houver token, redireciona imediatamente para o login
            setIsLoggedIn(false);
            setLoading(false); 
            navigate('/login');
        }
    }, [navigate]); 

    const fetchUserData = async (token) => {
        try {
            // Garante que o Axios está configurado para esta requisição
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;

            const response = await axios.get(PROFILE_URL);
            
            // Assume que o FullProfileSerializer retorna os dados do User e o Profile aninhado
            setUserData(response.data);
            setIsLoggedIn(true);

        } catch (err) {
            // Se o token for inválido/expirado (ex: erro 401 Unauthorized), limpa o token.
            console.error("Erro ao buscar dados do usuário:", err.response || err);
            localStorage.removeItem('userToken');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
            setError("Sessão expirada ou inválida. Por favor, faça login novamente.");
            navigate('/login'); 
            
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO DE ESTADOS ---

    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" role="status" style={{ color: 'var(--primary-color)' }}>
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
                <p className="mt-2 text-white-50">Carregando dados do perfil...</p>
            </Container>
        );
    }
    
    // Se não está logado ou houve erro, e o navigate não funcionou por algum motivo, não renderiza nada.
    if (!isLoggedIn || error) {
        return <></>; 
    }

    // --- RENDERIZAÇÃO DO PERFIL ---
    return (
        <Container className="py-5" style={{ minHeight: '80vh' }}>
            <h1 className="mb-4 text-white" style={{ color: 'var(--primary-color)' }}>
                <PersonCircle size={32} className="me-2" /> Meu Painel
            </h1>
            
            <Card className="p-4 shadow bg-vagali-dark-card text-white">
                
                {error && <Alert variant="danger" className="text-dark">{error}</Alert>}
                
                {userData && (
                    <div>
                        <Alert variant="success" className="text-dark">
                            ✅ **Autenticação bem-sucedida.** Você está logado(a).
                        </Alert>
                        
                        <h3 className="mb-3">{userData.profile.full_name || 'Usuário'}</h3>
                        <hr className="text-secondary" />

                        <Row className="mb-3">
                            <Col md={6}>
                                <p className="mb-1 text-white-50">E-mail:</p>
                                <p className="fw-bold">{userData.email}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1 text-white-50">Status:</p>
                                <p className="fw-bold text-info">{userData.is_professional ? 'PROFISSIONAL' : 'CLIENTE'}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1 text-white-50">CPF:</p>
                                <p className="fw-bold">{userData.profile.cpf || 'Não informado'}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1 text-white-50">Telefone:</p>
                                <p className="fw-bold">{userData.profile.phone_number || 'Não informado'}</p>
                            </Col>
                        </Row>

                        {/* Informações Profissionais */}
                        {userData.is_professional && (
                            <Card className="p-3 mt-4 mb-3 bg-dark border-secondary">
                                <h4 className="text-warning">Dados Profissionais</h4>
                                <p className="mb-1 text-white-50">Bio:</p>
                                <p>{userData.profile.bio || 'Adicione uma descrição dos seus serviços.'}</p>
                                <p className="mb-1 text-white-50">Endereço:</p>
                                <p>{userData.profile.address || 'Não informado'}</p>
                                <p className="mb-1 text-white-50">CNPJ:</p>
                                <p>{userData.profile.cnpj || 'Não informado'}</p>
                            </Card>
                        )}

                        {/* BOTÕES DE AÇÃO */}
                        <div className="d-flex gap-3 mt-4 flex-wrap">
                            <Button 
                                onClick={() => navigate('/edit-profile')} 
                                variant="info"
                                className="fw-bold py-2 flex-grow-1"
                            >
                                <PencilSquare className="me-2" /> Editar Dados
                            </Button>
                            <Button 
                                onClick={() => navigate('/change-password')} 
                                variant="warning"
                                className="fw-bold py-2 flex-grow-1"
                            >
                                <LockFill className="me-2" /> Trocar Senha
                            </Button>
                            <Button 
                                onClick={handleLogout} 
                                variant="danger"
                                className="fw-bold py-2 flex-grow-1"
                            >
                                Sair (Logout)
                            </Button>
                        </div>
                        
                        <details style={{ marginTop: '30px' }}>
                            <summary className="text-white-50 small cursor-pointer">Ver Dados Brutos (Debugging)</summary>
                            <pre style={{ overflowX: 'auto', padding: '10px', backgroundColor: '#333', borderRadius: '5px', fontSize: '12px', color: '#ccc' }}>
                                {JSON.stringify(userData, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default ProfileUser;