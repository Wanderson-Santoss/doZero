import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { UnlockFill } from 'react-bootstrap-icons'; // Ícone corrigido: UnlockFill

const PasswordResetConfirm = () => {
    const navigate = useNavigate();
    
    // Captura os parâmetros uid e token da URL (vindo do link de e-mail)
    const [searchParams] = useSearchParams();
    const uid = searchParams.get('uid'); 
    const token = searchParams.get('token') || searchParams.get('confirm_token');

    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: '', // Confirmação da nova senha
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Endpoint do DRF para confirmar o reset de senha
    const RESET_CONFIRM_URL = '/api/v1/auth/password/reset/confirm/'; 

    // Efeito para checar se os parâmetros obrigatórios existem na URL
    useEffect(() => {
        if (!uid || !token) {
            setError("Link de redefinição inválido ou incompleto. Certifique-se de que copiou o link inteiro do seu e-mail.");
        }
    }, [uid, token]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // --- LÓGICA DE ENVIO (POST) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const { new_password, re_new_password } = formData;
        
        if (!uid || !token) {
            setError("UID ou Token ausente na URL.");
            setLoading(false);
            return;
        }

        if (new_password !== re_new_password) {
            setError("As novas senhas não coincidem.");
            setLoading(false);
            return;
        }

        // Você pode adicionar uma validação de comprimento ou complexidade da senha aqui
        if (new_password.length < 6) { 
             setError("A nova senha deve ter no mínimo 6 caracteres.");
             setLoading(false);
             return;
        }

        try {
            // Envia UID, Token e as novas senhas
            const dataToSend = {
                uid: uid,
                token: token,
                new_password: new_password,
                re_new_password: re_new_password,
            };

            const response = await axios.post(RESET_CONFIRM_URL, dataToSend);

            if (response.status === 204 || response.status === 200) {
                setSuccess("Sua senha foi redefinida com sucesso! Você será redirecionado(a) para o login.");
                
                // Redireciona para o login após o sucesso
                setTimeout(() => navigate('/login'), 3000); 
            }

        } catch (err) {
            console.error("Erro ao confirmar reset de senha:", err.response || err);
            
            let errorMessage = "Erro na redefinição. O link pode ter expirado ou ter sido usado.";

            if (err.response && err.response.data) {
                const errorData = err.response.data;
                // Mapeamento de erros comuns: link expirado/inválido
                if (errorData.token || errorData.uid || errorData.detail) {
                    errorMessage = "Este link é inválido ou expirou. Por favor, solicite um novo link.";
                } else if (errorData.new_password) {
                    errorMessage = `Nova Senha: ${errorData.new_password.join(' ')}`;
                } else if (errorData.non_field_errors) {
                    errorMessage = errorData.non_field_errors.join(' ');
                }
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };
    
    // --- RENDERIZAÇÃO ---
    
    // Se a URL não tiver os parâmetros necessários, exibe uma mensagem de erro
    if (!uid || !token) {
        return (
             <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
                <Alert variant="danger" style={{ maxWidth: '450px' }}>
                    <h5 className="mb-2">Link Incompleto 😔</h5>
                    {error} <Link to="/forgot-password" className="alert-link">Clique aqui para solicitar um novo link.</Link>
                </Alert>
            </Container>
        );
    }
    
    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <UnlockFill className="me-2 text-warning" /> Nova Senha
                </h2>
                <p className="text-white-50 text-center small mb-4">
                    Digite e confirme sua nova senha.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    {/* NOVA SENHA */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">Nova Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            id="new_password"
                            className="form-control-dark" 
                            placeholder="Mínimo 6 caracteres"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* CONFIRMAÇÃO DA NOVA SENHA */}
                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50">Confirme a Nova Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            id="re_new_password"
                            className="form-control-dark" 
                            placeholder="Repita a nova senha"
                            value={formData.re_new_password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* BOTÕES */}
                    <Button 
                        type="submit" 
                        className="w-100 fw-bold py-2 mt-2"
                        variant="warning"
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Redefinir Senha'}
                    </Button>

                </Form>
            </Card>
        </Container>
    );
};

export default PasswordResetConfirm;