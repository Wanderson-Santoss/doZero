import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Mail } from 'lucide-react';
import LogoBranco from '../assets/LOGOBRANCO.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const RESET_REQUEST_URL = '/api/v1/auth/password/reset/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await axios.post(RESET_REQUEST_URL, { email });

            setSuccess(
                `Se o e-mail existir, enviamos um link para ${email}. Verifique também a caixa de spam.`
            );
            setEmail('');
        } catch (err) {
            // Mesmo erro -> mensagem amigável e segura
            setSuccess(
                `Se o e-mail existir, enviamos um link para ${email}. Verifique também a caixa de spam.`
            );
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
                className="p-4 shadow-lg card-login fade-in text-white"
                style={{ maxWidth: "440px", width: "100%" }}
            >
                {/* LOGO */}
                <div className="d-flex justify-content-center mb-3">
                    <img 
                        src={LogoBranco} 
                        alt="logo" 
                        style={{ width: 70, height: 70 }}
                    />
                </div>

                <h2 className="text-center mb-3 fw-bold" style={{ color: "#0d6efd" }}>
                    <Mail className="me-2" size={28} /> Recuperar Senha
                </h2>

                <p className="text-center text-white-50 small mb-4">
                    Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>

                {success && <Alert variant="success" className="text-dark">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>

                    {/* CAMPO DE E-MAIL */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50 small">E-mail</Form.Label>
                        <div className="d-flex align-items-center rounded px-2" 
                            style={{ background: "#1b212b" }}>
                            
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

                    {/* BOTÃO ENVIAR */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 fw-bold py-2"
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Enviar Link de Recuperação"}
                    </Button>
                </Form>

                {/* VOLTAR AO LOGIN */}
                <p className="text-center small mt-4">
                    <Link to="/login" className="link-blue fw-bold">
                        Voltar para Login
                    </Link>
                </p>
            </Card>
        </Container>
    );
};

export default ForgotPassword;
