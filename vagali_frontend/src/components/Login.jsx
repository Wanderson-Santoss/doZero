import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../components/AuthContext';
import LogoBranco from '../assets/LOGOBRANCO.png';

// Ícones
import { Mail, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/meu-perfil');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/meu-perfil');
            } else {
                setError("Erro desconhecido. Tente novamente.");
            }
        } catch (err) {
            const message = err.response?.data?.detail || "Credenciais inválidas.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container 
            fluid 
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{ backgroundColor: "#f2f2f2" }}
        >
            <Card 
                className="p-4 shadow card-login fade-in text-white"
                style={{ maxWidth: '420px', width: '100%' }}
            >
                {/* LOGO */}
                <div className="d-flex justify-content-center mb-3">
                    <img 
                        src={LogoBranco} 
                        alt="logo" 
                        style={{ width: 80, height: 80 }}
                    />
                </div>

                <h2 className="text-center mb-4 fw-bold" style={{ color: "#0d6efd" }}>
                    Entrar no VagALI
                </h2>

                {error && (
                    <Alert variant="danger" className="p-2 text-center small">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>

                    {/* E-MAIL */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-light">E-mail</Form.Label>
                        <div className="d-flex align-items-center rounded px-2" 
                            style={{ background: "#1b212b" }}>
                            
                            <Mail size={18} className="text-primary me-2" />
                            <Form.Control
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control-custom border-0"
                            />
                        </div>
                    </Form.Group>

                    {/* SENHA */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-light">Senha</Form.Label>
                        <div className="d-flex align-items-center rounded px-2"
                            style={{ background: "#1b212b" }}>
                            
                            <Lock size={18} className="text-primary me-2" />
                            <Form.Control
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control-custom border-0"
                            />
                        </div>
                    </Form.Group>

                    {/* ESQUECEU A SENHA */}
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/forgot-password" className="link-blue small">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-100 fw-bold py-2"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Entrar"}
                    </Button>
                </Form>

                {/* LINK CADASTRO */}
                <p className="text-center small mt-4">
                    Ainda não tem conta?{" "}
                    <Link to="/register" className="link-blue fw-bold">
                        Cadastre-se aqui
                    </Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;
