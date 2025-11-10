import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { Search, Tools, Wrench, Building, Truck, Lightbulb } from 'react-bootstrap-icons';
import ProfileCard from './ProfileCard';

// 1. Definição das Categorias (Nome e Ícone do react-bootstrap-icons)
const CATEGORIES = [
    { name: 'Todos', icon: Tools },
    { name: 'Mecânica', icon: Wrench },
    { name: 'Construção', icon: Building },
    { name: 'Transporte', icon: Truck },
    { name: 'Elétrica', icon: Lightbulb },
    // Adicione mais categorias conforme necessário, usando ícones do react-bootstrap-icons
];

const MainFeed = () => {
    // Estados para dados da API
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADO 1: Termo de busca (Nome/Email)
    const [searchTerm, setSearchTerm] = useState('');

    // ESTADO 2: Categoria selecionada. 'Todos' por padrão.
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const PROFESSIONALS_URL = '/api/v1/accounts/profissionais/';

    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                const response = await axios.get(PROFESSIONALS_URL);
                // 🚨 SUPOSIÇÃO: Para testar o filtro, adicionamos um campo 'service_category'
                // Você deve garantir que a sua API retorne este campo no futuro.
                const dataWithCategories = response.data.map(prof => ({
                    ...prof,
                    // Distribui categorias de exemplo para visualização
                    service_category: prof.id % 4 === 0 ? 'Mecânica' :
                                      prof.id % 4 === 1 ? 'Construção' :
                                      prof.id % 4 === 2 ? 'Elétrica' :
                                      'Transporte' 
                }));
                setProfessionals(dataWithCategories); 
            } catch (err) {
                console.error("Erro ao carregar profissionais:", err);
                setError("Não foi possível carregar a lista de profissionais no momento.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfessionals();
    }, []);

    // 🚨 LÓGICA DE FILTRO COMBINADA: Busca + Categoria
    const filteredProfessionals = professionals.filter(prof => {
        // 1. Filtro por Categoria
        const categoryMatch = selectedCategory === 'Todos' || prof.service_category === selectedCategory;

        // 2. Filtro por Termo de Busca (Nome ou Email)
        const name = prof.full_name ? prof.full_name.toLowerCase() : '';
        const email = prof.email ? prof.email.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const searchMatch = name.includes(search) || email.includes(search);

        // O profissional deve atender a AMBOS os critérios
        return categoryMatch && searchMatch;
    });

    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="mt-2 text-white">Buscando profissionais...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5" style={{ minHeight: '80vh' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
                Encontre o Profissional Ideal
            </h1>

            {/* 🚨 NOVO BLOCO: Filtro por Categorias */}
            <Row className="mb-5 justify-content-center g-4">
                {CATEGORIES.map(({ name, icon: IconComponent }) => (
                    <Col xs={4} sm={3} md={2} key={name}>
                        <div 
                            className="categoria-btn"
                            onClick={() => setSelectedCategory(name)}
                            style={{
                                // Aplica estilo de destaque se a categoria estiver selecionada
                                backgroundColor: selectedCategory === name ? 'var(--primary-color)' : 'white',
                                borderColor: selectedCategory === name ? 'var(--primary-color)' : '#e2e8f0',
                                color: selectedCategory === name ? 'white' : 'var(--dark-text)',
                            }}
                        >
                            <IconComponent 
                                size={32} 
                                style={{
                                    // Ícone muda de cor junto com o botão
                                    color: selectedCategory === name ? 'white' : 'var(--primary-color)',
                                }}
                            />
                            <small className="mt-2 fw-bold" style={{ whiteSpace: 'nowrap' }}>
                                {name}
                            </small>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* CAMPO DE BUSCA */}
            <Row className="mb-5 justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Form.Group className="position-relative">
                        <Search 
                            size={20} 
                            className="text-white-50 position-absolute" 
                            style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} 
                        />
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nome, e-mail ou serviço..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-3 ps-5 shadow-sm search-input"
                            style={{ 
                                borderRadius: '30px'
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <h2 className="mt-5 mb-3 text-white">
                {selectedCategory === 'Todos' ? 'Profissionais em Destaque' : `Profissionais de ${selectedCategory}`}
            </h2>

            <Row>
                {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.map(prof => (
                        <Col key={prof.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <ProfileCard professional={prof} /> 
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="info" className="text-center">
                            Nenhum profissional encontrado.
                        </Alert>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default MainFeed;