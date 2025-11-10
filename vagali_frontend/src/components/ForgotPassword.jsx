import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Endpoint do DRF para solicitar o reset de senha
    const RESET_REQUEST_URL = '/api/v1/auth/password/reset/'; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        
        // O DRF espera o campo 'email'
        const dataToSend = { email };

        try {
            // O backend deve enviar um e-mail com um link para o usuário
            const response = await axios.post(RESET_REQUEST_URL, dataToSend);

            if (response.status === 204 || response.status === 200) {
                setSuccess(`Se um e-mail correspondente foi encontrado, as instruções de recuperação de senha foram enviadas para ${email}. Verifique sua caixa de spam.`);
                setEmail('');
            }

        } catch (err) {
            console.error("Erro ao solicitar reset de senha:", err.response || err);
            
            // O DRF geralmente retorna 204 mesmo que o e-mail não exista, para evitar enumerar usuários.
            // Aqui, exibimos uma mensagem genérica de sucesso para manter a segurança.
            setSuccess(`Se um e-mail correspondente foi encontrado, as instruções de recuperação de senha foram enviadas para ${email}. Verifique sua caixa de spam.`);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <Envelope className="me-2 text-warning" /> Recuperar Senha
                </h2>
                <p className="text-white-50 text-center small mb-4">
                    Digite seu e-mail para receber um link de redefinição de senha.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50">E-mail:</Form.Label>
                        <Form.Control 
                            type="email" 
                            id="email"
                            className="form-control-dark" 
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button 
                        type="submit" 
                        className="w-100 fw-bold py-2"
                        variant="warning"
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Enviar Link de Reset'}
                    </Button>

                    <p className="text-center small text-white-50 mt-4">
                        <Link to="/login" className="text-vagali-link">Lembrou da senha? Voltar para Login</Link>
                    </p>
                </Form>
            </Card>
        </Container>
    );
};

export default ForgotPassword;