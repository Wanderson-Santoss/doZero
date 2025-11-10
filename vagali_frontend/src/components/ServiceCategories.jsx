// ServiceCategories.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
// Importe o mapa e a função de limpeza
import { ICON_MAP, cleanServiceName } from './utils/IconMapping'; 
// Use a tag Link do seu roteador (react-router-dom) se precisar de navegação
// import { Link } from 'react-router-dom'; 

const ServiceCategories = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Seu endpoint de serviços
    const SERVICES_URL = '/api/v1/servicos/';

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Sua API retorna a lista completa de serviços
                const response = await axios.get(SERVICES_URL);
                setServices(response.data);
            } catch (err) {
                setError('Não foi possível carregar as categorias de serviço.');
                console.error('Erro ao buscar serviços:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" variant="secondary" /></div>;
    }

    if (error) {
        return <div className="text-center py-5 text-danger">{error}</div>;
    }
    
    // Mapeia os serviços para obter o ícone e a cor
    const categorizedServices = services.map(service => {
        const key = cleanServiceName(service.name);
        const mapping = ICON_MAP[key] || ICON_MAP['geral'];
        
        return {
            id: service.id,
            name: service.name,
            Icon: mapping.Icon,
            color: mapping.color.replace('text-', ''), // Remove 'text-' para usar como classe de cor
            url: `/search?service=${service.name}` // URL de exemplo para a pesquisa
        };
    });

    return (
        <div className="container my-4">
            <h3 className="text-white-50 text-center mb-3">Serviços Disponíveis</h3>
            <div 
                className="d-flex flex-wrap justify-content-center gap-4 py-3 px-2 rounded"
                style={{ backgroundColor: '#2b2b2b' }} // Cor de fundo suave para o dark mode
            >
                {/* Renderiza cada categoria como um ícone clicável */}
                {categorizedServices.map((service) => (
                    <a 
                        key={service.id} 
                        href={service.url} 
                        className="text-decoration-none text-center p-2"
                        style={{ minWidth: '80px', maxWidth: '100px' }}
                    >
                        <service.Icon 
                            size={32} 
                            className={`text-${service.color} mb-1 transition-transform hover-scale-110`}
                            // Estilo de exemplo (você pode precisar de CSS customizado para cores)
                            style={{ color: `var(--bs-${service.color})` }} 
                        />
                        <div className="text-white small fw-light">{service.name}</div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ServiceCategories;