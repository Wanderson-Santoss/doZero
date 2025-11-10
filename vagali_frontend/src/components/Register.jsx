import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios'; 

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // CAMPOS OBRIGATÓRIOS/COMUNS
        email: '',
        password: '',
        password2: '',
        is_professional: false, 
        full_name: '', 
        cpf: '', 
        phone_number: '', 
        // CAMPOS DO PROFILE (APENAS PARA PROFISSIONAIS)
        bio: '',
        address: '',
        cnpj: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Endpoint de Cadastro customizado
    const REGISTER_URL = '/api/v1/accounts/cadastro/';

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [id]: finalValue
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        const { password, password2 } = formData;
        
        if (password !== password2) {
            setError("A senha e a confirmação de senha não coincidem.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            setLoading(false);
            return;
        }
        
        const dataToSend = {
            ...formData,
            is_professional: formData.is_professional === true,
        };

        try {
            const response = await axios.post(REGISTER_URL, dataToSend);

            if (response.status === 201) {
                alert("Cadastro realizado com sucesso! Você já pode fazer login.");
                navigate('/login');
            }

        } catch (err) {
            console.error("Erro no cadastro:", err.response || err);
            
            let errorMessage = "Ocorreu um erro desconhecido no servidor. Tente mais tarde.";

            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessages = [];

                for (const field in errorData) {
                    const fieldName = field === 'password2' ? 'Confirmação de Senha' : field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
                    errorMessages.push(`${fieldName}: ${Array.isArray(errorData[field]) ? errorData[field].join(' ') : errorData[field]}`);
                }

                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join(' | ');
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            {/* Aumentamos a largura do Card e permitimos que ele se ajuste melhor em colunas */}
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ maxWidth: '700px', width: '90%' }}> 
                <h2 className="text-center mb-4 text-white fw-bold">Cadastre-se no VagALI</h2>

                <Form onSubmit={handleRegister}>
                    
                    {/* CAMPO NOME COMPLETO (Largura total) */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">Nome Completo:</Form.Label>
                        <Form.Control 
                            type="text" 
                            id="full_name"
                            className="form-control-dark" 
                            placeholder="Seu nome completo"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    
                    {/* CAMPO E-MAIL (Largura total) */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">E-mail:</Form.Label>
                        <Form.Control 
                            type="email" 
                            id="email"
                            className="form-control-dark" 
                            placeholder="seu.email@exemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    
                    {/* 🚨 PRIMEIRA LINHA DE COLUNAS: CPF E TELEFONE */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">CPF (apenas números):</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    id="cpf"
                                    className="form-control-dark" 
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    required
                                    maxLength={11}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Telefone (opcional):</Form.Label>
                                <Form.Control 
                                    type="tel" 
                                    id="phone_number"
                                    className="form-control-dark" 
                                    placeholder="(00) 90000-0000"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* 🚨 SEGUNDA LINHA DE COLUNAS: SENHA E CONFIRMAÇÃO */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Senha:</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    id="password"
                                    className="form-control-dark" 
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Confirme a Senha:</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    id="password2"
                                    className="form-control-dark" 
                                    placeholder="Confirme sua senha"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>


                    {/* CHECKBOX PROFISSIONAL (Largura total) */}
                    <Form.Group className="mb-4 mt-3">
                        <Form.Check 
                            type="checkbox" 
                            id="is_professional"
                            label={<span className="form-check-label">Desejo me cadastrar como **Profissional** e oferecer meus serviços.</span>}
                            checked={formData.is_professional}
                            onChange={handleChange}
                            className="text-white-50"
                        />
                    </Form.Group>
                    
                    {/* 🚨 BLOCO DE CAMPOS PROFISSIONAIS (Dinâmico e com Colunas) */}
                    {formData.is_professional && (
                        <div className="professional-fields-block pt-3 border-top border-secondary mt-3">
                            <p className="text-center text-white-50 small mb-3 fw-bold">Dados do Perfil Profissional</p>
                            
                            {/* CAMPO BIO (Largura total para textarea) */}
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Sobre Mim (Bio):</Form.Label>
                                <Form.Control 
                                    as="textarea"
                                    rows={3}
                                    id="bio"
                                    className="form-control-dark" 
                                    placeholder="Fale um pouco sobre seus serviços e experiência..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {/* ENDEREÇO E CNPJ EM COLUNAS */}
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white-50">Cidade/Endereço de Atendimento:</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            id="address"
                                            className="form-control-dark" 
                                            placeholder="Ex: Rio de Janeiro, Botafogo"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white-50">CNPJ (Opcional):</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            id="cnpj"
                                            className="form-control-dark" 
                                            placeholder="Apenas números, se aplicável"
                                            value={formData.cnpj}
                                            onChange={handleChange}
                                            maxLength={14}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    )}


                    {error && (
                        <Alert variant="danger" className="p-2 small mt-4">
                            {error}
                        </Alert>
                    )}

                    {/* BOTÕES */}
                    <div className="d-flex justify-content-between gap-2 mb-3 mt-4">
                        <Button 
                            type="submit" 
                            className="flex-grow-1 fw-bold"
                            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                            disabled={loading}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Cadastrar'}
                        </Button>
                        <Button 
                            type="button" 
                            className="flex-grow-1 fw-bold" 
                            variant="secondary"
                            onClick={() => navigate('/login')}
                        >
                            Voltar para Login
                        </Button>
                    </div>

                    <p className="text-center small text-white-50 mt-3">
                        Já tem conta? Faça seu <Link to="/login" className="text-vagali-link" style={{ color: 'var(--vagali-link)' }}>Login aqui</Link>.
                    </p>
                </Form>
            </Card>
        </Container>
    );
}

export default Register;