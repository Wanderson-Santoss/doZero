import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button, Form, Row, Col } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        cpf: '',
        phone_number: '',
        is_professional: false, 
        // Dados do Profile, que virão aninhados ou não, dependendo do seu serializer
        bio: '',
        address: '',
        cnpj: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Endpoints (GET e PATCH/PUT)
    const PROFILE_URL = '/api/v1/accounts/perfil/me/'; 

    // --- LÓGICA DE CARREGAMENTO (GET) ---
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                // Configura o cabeçalho de autorização
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                
                const response = await axios.get(PROFILE_URL);
                const data = response.data;
                
                // Mapeia os dados da resposta para o estado do formulário
                setFormData({
                    email: data.email || '',
                    full_name: data.profile.full_name || '',
                    cpf: data.profile.cpf || '',
                    phone_number: data.profile.phone_number || '',
                    is_professional: data.is_professional || false,
                    // Campos específicos de Professional (se existirem)
                    bio: data.profile.bio || '',
                    address: data.profile.address || '',
                    cnpj: data.profile.cnpj || '',
                });
            } catch (err) {
                console.error("Erro ao carregar dados para edição:", err.response || err);
                // Token inválido? Limpa e redireciona.
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('userToken');
                    navigate('/login');
                } else {
                    setError("Não foi possível carregar os dados do perfil. Tente mais tarde.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // --- LÓGICA DE ALTERAÇÃO DO FORMULÁRIO ---
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [id]: finalValue
        }));
    };

    // --- LÓGICA DE ENVIO (PATCH/PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitLoading(true);

        const dataToSend = {
            // O backend espera o email no User, e o resto no Profile.
            // O FullProfileSerializer deve saber como lidar com isso.
            email: formData.email,
            is_professional: formData.is_professional,
            profile: {
                full_name: formData.full_name,
                cpf: formData.cpf,
                phone_number: formData.phone_number,
                bio: formData.bio,
                address: formData.address,
                cnpj: formData.cnpj,
            }
            // OBS: Não enviamos a senha aqui! Deve haver um formulário separado para senhas.
        };

        try {
            // Usamos PATCH para enviar apenas as alterações
            await axios.patch(PROFILE_URL, dataToSend);

            setSuccess("Perfil atualizado com sucesso!");
            
            // Opcional: Redirecionar de volta para a visualização do perfil após o sucesso
            setTimeout(() => navigate('/me'), 1500); 

        } catch (err) {
            console.error("Erro ao salvar perfil:", err.response || err);
            let errorMessage = "Erro ao salvar. Verifique se todos os campos estão corretos.";

            if (err.response && err.response.data) {
                // Lógica detalhada para mapear erros do serializer
                const errorData = err.response.data;
                let errorMessages = [];
                for (const field in errorData) {
                    const fieldName = field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
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
            setSubmitLoading(false);
        }
    };
    
    // --- RENDERIZAÇÃO ---

    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="mt-2 text-white">Carregando dados para edição...</p>
            </Container>
        );
    }
    
    // Se o loading terminou, mas houve erro de autenticação, o navigate já resolveu.
    if (!localStorage.getItem('userToken')) return <></>; 

    return (
        <Container className="py-5" style={{ minHeight: '100vh' }}>
            <h1 className="mb-4 text-white" style={{ color: 'var(--primary-color)' }}>
                <PencilSquare size={32} className="me-2" /> Editar Meu Perfil
            </h1>
            
            <Card className="p-4 shadow bg-vagali-dark-card text-white" style={{ maxWidth: '800px', margin: 'auto' }}>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    {/* Linha 1: Nome e Email (largura total) */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">Nome Completo:</Form.Label>
                        <Form.Control type="text" id="full_name" className="form-control-dark" value={formData.full_name} onChange={handleChange} required />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">E-mail:</Form.Label>
                        <Form.Control type="email" id="email" className="form-control-dark" value={formData.email} onChange={handleChange} required />
                    </Form.Group>

                    {/* Linha 2: CPF e Telefone (colunas) */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">CPF (apenas números):</Form.Label>
                                <Form.Control type="text" id="cpf" className="form-control-dark" value={formData.cpf} onChange={handleChange} required maxLength={11} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Telefone:</Form.Label>
                                <Form.Control type="tel" id="phone_number" className="form-control-dark" value={formData.phone_number} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Checkbox Profissional */}
                    <Form.Group className="mb-4 mt-3">
                        <Form.Check 
                            type="checkbox" 
                            id="is_professional"
                            label={<span className="form-check-label">Sou um **Profissional** (Permite preencher campos abaixo).</span>}
                            checked={formData.is_professional}
                            onChange={handleChange}
                            className="text-white-50"
                        />
                    </Form.Group>

                    {/* Blocos de Campos Profissionais (Condicional) */}
                    {formData.is_professional && (
                        <div className="professional-fields-block pt-3 border-top border-secondary mt-3">
                            <p className="text-center text-white-50 small mb-3 fw-bold">Dados do Perfil Profissional</p>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Sobre Mim (Bio):</Form.Label>
                                <Form.Control as="textarea" rows={3} id="bio" className="form-control-dark" placeholder="Fale sobre seus serviços..." value={formData.bio} onChange={handleChange} />
                            </Form.Group>
                            
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white-50">Cidade/Endereço de Atendimento:</Form.Label>
                                        <Form.Control type="text" id="address" className="form-control-dark" placeholder="Ex: Rio de Janeiro" value={formData.address} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white-50">CNPJ (Opcional):</Form.Label>
                                        <Form.Control type="text" id="cnpj" className="form-control-dark" placeholder="Apenas números, se aplicável" value={formData.cnpj} onChange={handleChange} maxLength={14} />
                                    </Form.Group>
                                </Col>
                            </Row>

                        </div>
                    )}
                    
                    {/* Botões */}
                    <div className="d-flex justify-content-between gap-2 mt-4">
                        <Button 
                            type="submit" 
                            className="flex-grow-1 fw-bold"
                            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                            disabled={submitLoading}
                        >
                            {submitLoading ? <Spinner animation="border" size="sm" /> : 'Salvar Alterações'}
                        </Button>
                        <Button 
                            type="button" 
                            className="fw-bold" 
                            variant="secondary"
                            onClick={() => navigate('/me')} // Volta para a visualização
                        >
                            Cancelar
                        </Button>
                    </div>

                </Form>
            </Card>
        </Container>
    );
};

export default EditProfile;