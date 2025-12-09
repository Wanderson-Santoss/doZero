import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Mail, ArrowLeft } from "lucide-react";
import LogoBranco from "../assets/LOGOBRANCO.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const RESET_REQUEST_URL = "/api/v1/auth/password/reset/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await axios.post(RESET_REQUEST_URL, { email });

            setSuccess(`Se o e-mail existir, enviamos um link para ${email}.`);
            setEmail("");

        } catch (err) {
            setSuccess(`Se o e-mail existir, enviamos um link para ${email}.`);
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
                        border: "1px solid rgba(255,255,255,0.25)",
                        width: "75%",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <img
                        src={LogoBranco}
                        alt="logo"
                        style={{ width: 90, marginBottom: 20 }}
                    />

                    <h2 className="fw-bold">Recuperar Acesso</h2>
                    <p className="mt-2" style={{ opacity: 0.8 }}>
                        Envie seu e-mail e receba o link de redefinição.
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
                        <Mail size={40} className="text-primary" />
                        <h2 className="fw-bold mt-2" style={{ color: "#0d6efd" }}>
                            Recuperar Senha
                        </h2>
                    </div>

                    {success && (
                        <Alert variant="success" className="py-2 small">
                            {success}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* Campo de E-mail */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small">E-mail</Form.Label>
                            <div
                                className="d-flex align-items-center rounded px-2"
                                style={{ background: "#1b212b" }}
                            >
                                <Mail size={18} className="text-primary me-2" />
                                <Form.Control
                                    type="email"
                                    placeholder="seu.email@exemplo.com"
                                    className="form-control-custom border-0"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>

                        {/* Botão */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100 fw-bold py-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                "Enviar link de recuperação"
                            )}
                        </Button>
                    </Form>

                    {/* Voltar ao login */}
                    <p className="text-center small mt-4">
                        <Link to="/login" className="link-blue fw-bold">
                            <ArrowLeft size={16} className="me-1" />
                            Voltar para Login
                        </Link>
                    </p>
                </Card>
            </div>
        </Container>
    );
};

export default ForgotPassword;
