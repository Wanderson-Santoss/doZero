import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { LogIn } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import LogoBranco from "../assets/LOGOBRANCO.png";

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Se já está logado, manda direto pro painel
    useEffect(() => {
        if (isAuthenticated) navigate("/meu-perfil");
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const success = await login(email, password);

            if (success) {
                navigate("/meu-perfil");
            } else {
                setError("Erro desconhecido ao autenticar. Tente novamente.");
            }
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                "Credenciais inválidas. Tente novamente.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            fluid
            className="d-flex min-vh-100 p-0 fade-in"
            style={{ backgroundColor: "#f2f2f2" }}
        >
            {/* COLUNA ESQUERDA */}
            <div
                className="d-none d-md-flex flex-column justify-content-center align-items-center text-white p-4"
                style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #0d47a1, #1565c0, #1e88e5)",
                }}
            >
                <Card
                    className="p-4 shadow-lg text-center"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.12)",
                        borderRadius: "15px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        width: "75%",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <img
                        src={LogoBranco}
                        alt="logo"
                        style={{ width: 90, marginBottom: 20 }}
                    />

                    <h2 className="fw-bold">Bem-vindo de volta!</h2>
                    <p className="mt-2" style={{ opacity: 0.8 }}>
                        Entre em sua conta e continue explorando profissionais incríveis.
                    </p>
                </Card>
            </div>

            {/* COLUNA DIREITA */}
            <div
                className="d-flex flex-column justify-content-center align-items-center p-4"
                style={{ flex: 1.2 }}
            >
                <Card
                    className="p-4 shadow-lg card-login"
                    style={{
                        width: "100%",
                        maxWidth: "420px",
                        backgroundColor: "rgba(11, 12, 16, 0.95)",
                        borderRadius: "12px",
                    }}
                >
                    <div className="text-center mb-3">
                        <LogIn size={40} className="text-primary" />
                        <h2 className="fw-bold mt-2" style={{ color: "#0d6efd" }}>
                            Fazer Login
                        </h2>
                    </div>

                    {error && (
                        <Alert variant="danger" className="py-2 small">
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* E-mail */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small">E-mail</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                className="form-control-custom"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Senha */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small">Senha</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Sua senha"
                                className="form-control-custom"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Esqueceu a senha */}
                        <div className="text-end mb-3">
                            <Link to="/forgot-password" className="link-blue small fw-bold">
                                Esqueceu sua senha?
                            </Link>
                        </div>

                        {/* Botão Login */}
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 fw-bold py-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </Form>

                    {/* Link cadastro */}
                    <p className="text-center small mt-4 text-white-50">
                        Ainda não tem conta?{" "}
                        <Link to="/register" className="link-blue fw-bold">
                            Criar conta
                        </Link>
                    </p>
                </Card>
            </div>
        </Container>
    );
};

export default Login;
