import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Importando Link
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { StarFill, PersonCircle, CalendarCheck, ShareFill, ChatText } from 'react-bootstrap-icons';

// Endpoint para buscar o perfil 
const BASE_PROFILE_URL = '/api/v1/accounts/profissionais/';

const ProfessionalProfileView = () => {
    // Captura o 'id' da rota /professional/:id
    const { id } = useParams(); 
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareMessage, setShareMessage] = useState(null); 

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                // Requisição GET para /api/v1/accounts/profissionais/ID/
                const response = await axios.get(`${BASE_PROFILE_URL}${id}/`);
                setProfessional(response.data); 
            } catch (err) {
                console.error("Erro ao carregar perfil:", err.response || err);
                
                // Exibe uma mensagem de erro mais amigável.
                const status = err.response ? err.response.status : null;
                if (status === 404) {
                    setError(`Perfil ID: ${id} não encontrado.`);
                } else if (status === 500) {
                    // MENSAGEM DO ERRO DE BACKEND (500)
                    setError("Erro interno do servidor. A API pode estar inacessível ou o ID está incorreto.");
                } else {
                    setError("Não foi possível carregar o perfil. Verifique a conexão.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const showShareMessage = (message, variant = 'success') => {
        setShareMessage({ message, variant });
        setTimeout(() => {
            setShareMessage(null);
        }, 3000); 
    };

    // Dados de Exemplo (Estes campos devem existir no JSON retornado pela sua API)
    const rating = professional?.rating || 4.8; 
    const feedbackCount = professional?.feedback_count || 15;
    const isClientLoggedIn = localStorage.getItem('userToken'); // Simulação de login
    const satisfactionRate = Math.round((rating / 5) * 100); 
    const demandsCompleted = professional?.demands_completed || 42; 
    
    // Função de Compartilhamento
    const handleShare = () => {
        const profileUrl = window.location.href;
        if (navigator.clipboard) {
            // NOTE: document.execCommand('copy') é preferível em iframes
            document.execCommand('copy', false, profileUrl);
            showShareMessage('Link do perfil copiado para a área de transferência!', 'info');
        } else {
            showShareMessage('Seu navegador não suporta cópia automática.', 'warning');
        }
    };
    
    // Simulação da Galeria de Mídia
    const media = [
        'Foto 1', 'Foto 2', 'Foto 3', 
        'Vídeo 1', 'Foto 4', 'Foto 5'
    ];

    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="warning" />
                <p className="text-white-50 mt-2">Carregando perfil do profissional...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5" style={{ minHeight: '80vh' }}>
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    if (!professional) return null;

    return (
        <Container className="py-5 text-white">
            
            {shareMessage && (
                <Alert variant={shareMessage.variant} onClose={() => setShareMessage(null)} dismissible className="sticky-top mb-4" style={{ top: '20px', zIndex: 10 }}>
                    {shareMessage.message}
                </Alert>
            )}

            {/* CABEÇALHO DO PERFIL */}
            <Card className="bg-vagali-dark-card mb-4 p-4 shadow-lg">
                <Row className="align-items-center">
                    
                    <Col md={8} className="d-flex align-items-center">
                        <PersonCircle size={80} className="me-4 text-warning" /> 
                        <div>
                            <h2 className="fw-bold mb-0 text-white">{professional.full_name || 'Profissional Sem Nome'}</h2>
                            <p className="text-primary fs-5 mb-1">{professional.servico_principal || 'Serviço Principal'}</p>
                            <p className="text-white-50 mb-0">{professional.cidade || 'Cidade não informada'}, {professional.estado || 'Estado'}</p>
                        </div>
                    </Col>
                    
                    <Col md={4} className="text-end d-flex flex-column align-items-end">
                        <div className="mb-2">
                            {[...Array(5)].map((_, i) => (
                                <StarFill key={i} color={i < Math.floor(rating) ? "gold" : "#555"} size={20} className="mx-0" />
                            ))}
                            <span className="ms-2 fs-5 text-white-50">({rating.toFixed(1)}/5)</span>
                        </div>
                        
                        {isClientLoggedIn && (
                            <Button variant="outline-primary" className="mb-2 w-50">
                                + SEGUIR
                            </Button>
                        )}
                        
                        <Button variant="outline-light" onClick={handleShare} className="w-50">
                            <ShareFill className="me-2" /> Compartilhar URL
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* CONTEÚDO PRINCIPAL */}
            <Row>
                
                <Col md={8}>
                    
                    {/* Seção de Estatísticas Rápidas */}
                    <Row className="mb-4">
                         <Col xs={12} md={4} className="mb-3 mb-md-0">
                            <Card className="bg-vagali-dark-card p-3 text-center h-100">
                                <h4 className="text-warning mb-0">{satisfactionRate}%</h4>
                                <p className="small text-white-50">Taxa de Satisfação</p>
                            </Card>
                        </Col>
                         <Col xs={12} md={4} className="mb-3 mb-md-0">
                            <Card className="bg-vagali-dark-card p-3 text-center h-100">
                                <h4 className="text-primary mb-0">{demandsCompleted}</h4>
                                <p className="small text-white-50">Demandas Atendidas</p>
                            </Card>
                        </Col>
                         <Col xs={12} md={4} className="mb-3 mb-md-0">
                            <Card className="bg-vagali-dark-card p-3 text-center h-100">
                                <h4 className="text-success mb-0">Ativo</h4> 
                                <p className="small text-white-50">Status na Plataforma</p>
                            </Card>
                        </Col>
                    </Row>
                    
                    {/* Seção de Portfólio/Mídia */}
                    <Card className="bg-vagali-dark-card mb-4 p-4">
                        <h3 className="text-primary border-bottom border-primary pb-2 mb-3">Portfólio & Mídia</h3>
                        <Row>
                            {media.map((item, i) => (
                                <Col xs={4} className="mb-3" key={i}>
                                    <div 
                                        style={{ height: '100px', backgroundColor: '#333', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        className="text-white-50 small"
                                    >
                                        {item}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                    
                    {/* Seção Sobre o Profissional */}
                    <Card className="bg-vagali-dark-card p-4 mb-4">
                        <h3 className="text-warning border-bottom border-warning pb-2 mb-3">Sobre o Profissional</h3>
                        <p className="text-white-50">
                            {professional.descricao_servicos || "Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos."}
                        </p>
                        <p className="small text-muted">CNPJ: {professional.cnpj || 'Não Informado'}</p>
                    </Card>
                    
                    {/* Seção de Feedbacks */}
                    <Card className="bg-vagali-dark-card p-4">
                        <h3 className="text-warning border-bottom border-warning pb-2 mb-3">Feedbacks ({feedbackCount})</h3>
                        <p className="text-white-50">Aqui serão exibidos os comentários dos clientes com estrelas e datas.</p>
                    </Card>

                </Col>
                
                {/* Coluna das Ações Flutuantes (Sticky) */}
                <Col md={4}>
                    <Card className="bg-vagali-dark-card p-3 sticky-top" style={{ top: '20px' }}>
                        <h4 className="text-center text-white mb-3">Entre em Contato</h4>
                        
                        <Button variant="primary" size="lg" className="w-100 mb-3 fw-bold">
                            SOLICITAR SERVIÇOS
                        </Button>
                        
                        {/* BOTÃO ATUALIZADO COM LINK PARA A AGENDA */}
                        <Button 
                            as={Link} // Usa o Button como um Link
                            to={`/professional/${id}/schedule`} // Rota da Agenda
                            variant="outline-warning" 
                            size="lg" 
                            className="w-100 mb-3"
                        >
                            <CalendarCheck className="me-2" /> CONSULTAR AGENDA
                        </Button>
                        
                        <Button variant="outline-light" size="lg" className="w-100 mb-3">
                            <ChatText className="me-2" /> ENVIAR MENSAGEM
                        </Button>
                        
                        <Button variant="link" className="text-danger small w-100 mt-3">
                            DENUNCIAR CONTA
                        </Button>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalProfileView;