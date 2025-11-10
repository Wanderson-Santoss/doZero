// MainFeed.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import ProfileCard from './ProfileCard';

// CORREÇÃO DE CAMINHO: '../utils/'
import { ICON_MAP, cleanServiceName } from '../utils/IconMapping'; 

const MainFeed = () => {
    // --- ESTADOS ---
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('Todos');

    const PROFESSIONALS_URL = '/api/v1/accounts/profissionais/';
    const SERVICES_URL = '/api/v1/servicos/'; 

    // --- EFEITO 1: CARREGAR DADOS ---
    useEffect(() => {
        const fetchData = async () => {
            console.log("[DEBUG 1] Iniciando busca de dados..."); // Log de Início
            try {
                // 1. Busca de Profissionais
                const professionalsResponse = await axios.get(PROFESSIONALS_URL);
                
                // 2. Busca de Serviços
                const servicesResponse = await axios.get(SERVICES_URL);

                // --- DEBUG CRÍTICO ---
                console.log("[DEBUG 2] Profissionais recebidos:", professionalsResponse.data.length);
                console.log("[DEBUG 3] Serviços recebidos:", servicesResponse.data); // O que está realmente chegando aqui?
                // ---------------------

                // 3. Simulação de atribuição de serviço para demonstração
                const serviceCount = servicesResponse.data.length;
                const dataWithService = professionalsResponse.data.map(prof => ({
                    ...prof,
                    service_id: serviceCount > 0 ? servicesResponse.data[prof.id % serviceCount].id : null,
                })).filter(prof => prof.service_id !== null);

                setServices(servicesResponse.data);
                setProfessionals(dataWithService); 

            } catch (err) {
                console.error("[ERRO FATAL DE API] Não foi possível carregar os dados:", err); // Log de Erro
                setError("Não foi possível carregar os dados de profissionais ou serviços no momento.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LÓGICA DE FILTRO COMBINADA: Busca + Categoria (agora por ID) ---
    const filteredProfessionals = professionals.filter(prof => {
        // ... (lógica de filtro, mantida) ...
        const serviceMatch = selectedServiceId === 'Todos' || prof.service_id === selectedServiceId;
        const name = prof.full_name ? prof.full_name.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        const searchMatch = name.includes(search) || (prof.email && prof.email.toLowerCase().includes(search));
        return serviceMatch && searchMatch;
    });

    if (loading) {
        // ... (mantido) ...
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="mt-2 text-white">Buscando...</p>
            </Container>
        );
    }

    if (error) {
        // ... (mantido) ...
        return (
            <Container className="py-5" style={{ minHeight: '80vh' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    
    // --- FUNÇÃO AUXILIAR PARA RENDERIZAR O ÍCONE ---
    const getServiceIcon = (serviceName) => {
        const key = cleanServiceName(serviceName);
        console.log(`[DEBUG 4] Mapeando Serviço: ${serviceName} -> Chave: ${key}`); // Log de Mapeamento
        return ICON_MAP[key] || ICON_MAP['geral'];
    };


    return (
        <Container className="py-5">
            <h1 className="mb-4 text-center text-white" style={{ color: 'var(--primary-color)' }}>
                Encontre o Profissional Ideal
            </h1>

            {/* DEBUG CRÍTICO: Mostra o número de serviços disponíveis no DOM */}
            <p className="text-center text-light small mb-3">
                [DEBUG] Serviços disponíveis para mapeamento: {services.length}
            </p> 

            {/* BLOCO DOS ÍCONES: Filtro por Categorias (Dinâmico) */}
            <div className="text-center mb-5">
                <Row className="justify-content-center g-3">
                    {/* 1. Botão TODOS (Fixo) */}
                    <Col xs={4} sm={3} md={2} className="d-flex justify-content-center">
                         <ServiceIconButton
                            name="Todos"
                            IconComponent={getServiceIcon('geral').Icon} 
                            isSelected={'Todos' === selectedServiceId}
                            onClick={() => setSelectedServiceId('Todos')}
                        />
                    </Col>
                    
                    {/* 2. Mapeia os serviços da API */}
                    {services.map(service => {
                        const iconData = getServiceIcon(service.name);
                        const IconComponent = iconData?.Icon;

                        // Se o IconComponent não for encontrado, pulamos este item.
                        if (!IconComponent) {
                            console.warn(`[AVISO] Ícone não encontrado para o serviço: ${service.name}`);
                            return null;
                        }

                        return (
                            <Col xs={4} sm={3} md={2} key={service.id} className="d-flex justify-content-center">
                                <ServiceIconButton
                                    name={service.name}
                                    IconComponent={IconComponent}
                                    isSelected={service.id === selectedServiceId}
                                    onClick={() => setSelectedServiceId(service.id)}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </div>
            
            {/* ... (restante do código MainFeed) ... */}

        </Container>
    );
};

export default MainFeed;


// --- COMPONENTE AUXILIAR (ServiceIconButton - Completo no MainFeed.jsx) ---

const ServiceIconButton = ({ name, IconComponent, isSelected, onClick }) => (
    <div 
        className="text-center p-3 rounded shadow-sm cursor-pointer border-2"
        onClick={onClick}
        style={{
            backgroundColor: isSelected ? 'var(--primary-color, #ffaa00)' : '#212529', 
            borderColor: isSelected ? 'var(--primary-color, #ffaa00)' : '#495057', 
            borderStyle: 'solid',
            transition: 'all 0.3s',
            cursor: 'pointer',
            minWidth: '80px',
            maxWidth: '100%',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
        <IconComponent 
            size={30} 
            className="mb-1"
            style={{ color: isSelected ? 'white' : 'var(--primary-color, #ffaa00)' }}
        />
        <div 
            className="small fw-bold mt-1" 
            style={{ 
                whiteSpace: 'nowrap', 
                color: isSelected ? 'white' : '#dee2e6' 
            }}
        >
            {name}
        </div>
    </div>
);