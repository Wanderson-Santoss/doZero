import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { BoxArrowInRight } from 'react-bootstrap-icons';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Endpoint de login (CustomAuthToken)
    const LOGIN_URL = '/api/v1/auth/login/'; 

    // Efeito para verificar se o usuário já está logado
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            navigate('/me'); 
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 🚨 LÓGICA CORRIGIDA: Enviamos APENAS 'email' e 'password', conforme esperado pelo CustomAuthToken.
            const response = await axios.post(LOGIN_URL, {
                email: email,
                username:email,
                password: password
            });

            // O backend CustomAuthToken retorna o token na chave 'auth_token' (ou 'token' se for o DRF padrão).
            const token = response.data.auth_token || response.data.token;
            
            if (token) {
                localStorage.setItem('userToken', token);
                // Configura o token para requisições futuras
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                
                navigate('/me'); 
                // window.location.reload(); // Removido: Pode ser desnecessário se o App está bem configurado.
            } else {
                setError("O servidor não retornou um token de autenticação.");
            }

        } catch (err) {
            console.error("Erro no login:", err.response || err);
            
            let errorMessage = "Falha na comunicação com o servidor.";

            if (err.response && err.response.status === 400) {
                 // 400 Bad Request: Credenciais inválidas
                 errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
            } else if (err.response && err.response.data && err.response.data.non_field_errors) {
                errorMessage = err.response.data.non_field_errors.join(' ');
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <BoxArrowInRight className="me-2 text-primary" /> Acesso
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    {/* E-MAIL */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">E-mail:</Form.Label>
                        <Form.Control 
                            type="email" 
                            className="form-control-dark" 
                            placeholder="Seu e-mail de cadastro"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* SENHA */}
                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50">Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            className="form-control-dark" 
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    {/* 🚨 NOVO: LINK ESQUECEU A SENHA */}
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/forgot-password" className="text-vagali-link small">
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    {/* BOTÃO DE LOGIN */}
                    <Button 
                        type="submit" 
                        className="w-100 fw-bold py-2"
                        variant="primary" // Usando 'primary' se houver a cor configurada, senão ajuste para 'warning' ou similar
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Entrar'}
                    </Button>
                </Form>

                <p className="text-center small text-white-50 mt-4">
                    Ainda não tem conta? <Link to="/register" className="text-vagali-link">Cadastre-se aqui</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;