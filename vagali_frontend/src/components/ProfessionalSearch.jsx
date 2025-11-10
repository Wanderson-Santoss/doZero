import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Form, FormControl, Button, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search } from 'react-bootstrap-icons';

// URL base para buscar profissionais
const PROFESSIONALS_API_URL = '/api/v1/accounts/profissionais/';

// Componente de card simplificado
const ProfessionalCard = ({ professional }) => (
    <Col md={4} className="mb-4">
        <Card className="bg-vagali-dark-card text-white shadow">
            <Card.Body>
                <Card.Title className="text-warning">{professional.full_name || professional.nome_completo || 'Profissional'}</Card.Title>
                <Card.Text>
                    <strong>Serviço:</strong> {professional.servico_principal || 'Não definido'}
                </Card.Text>
                <Card.Text>
                    <strong>Localização:</strong> {professional.cidade || 'Não informada'}
                </Card.Text>
                
                {/* O ID está no objeto retornado pela API */}
                <Link 
                    to={`/professional/${professional.id}`} 
                    className="btn btn-warning btn-sm" 
                >
                    Ver Perfil
                </Link>
            </Card.Body>
        </Card>
    </Col>
);


const ProfessionalSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false); 

    const fetchProfessionals = useCallback(async (query = '') => {
        setLoading(true);
        setError(null);
        setHasAttemptedSearch(true);
        
        const searchUrl = query 
            ? `${PROFESSIONALS_API_URL}?search=${encodeURIComponent(query)}`
            : PROFESSIONALS_API_URL; 

        try {
            const response = await axios.get(searchUrl);
            
            // Trata a resposta do DRF (paginada ou não)
            const results = response.data.results || response.data;
            setProfessionals(Array.isArray(results) ? results : []); 
            
        } catch (err) {
            console.error("Erro ao buscar profissionais:", err.response || err);
            // Mensagem de erro que você viu no console, indicando falha na API (500)
            setError("Não foi possível carregar os profissionais. Verifique a API (erro 500 no Django).");
            setProfessionals([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!hasAttemptedSearch) {
            fetchProfessionals('');
        }
    }, [fetchProfessionals, hasAttemptedSearch]); 

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProfessionals(searchTerm);
    };

    return (
        <Container className="py-5">
            <Form onSubmit={handleSearchSubmit} className="mb-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <div className="d-flex">
                            <FormControl
                                type="text"
                                placeholder="Busque por nome, e-mail ou tipo de serviço..."
                                className="form-control-dark me-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="warning" type="submit" disabled={loading}>
                                <Search className="me-1" /> Buscar
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>

            <h3 className="text-white mb-4">
                {searchTerm && hasAttemptedSearch && !loading ? `Resultados para "${searchTerm}"` : 'Profissionais em Destaque'}
            </h3>
            
            {loading && (
                <div className="text-center text-white my-5">
                    <Spinner animation="border" variant="warning" className="me-2" />
                    Carregando profissionais...
                </div>
            )}

            {/* Exibe erro se a requisição falhou (500) */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Exibe mensagem se não houver resultados */}
            {!loading && professionals.length === 0 && hasAttemptedSearch && !error && (
                <Alert variant="info" className="text-center">
                    {searchTerm ? `Nenhum profissional encontrado para o termo "${searchTerm}".` : 'Nenhum profissional cadastrado para exibir.'}
                </Alert>
            )}

            <Row>
                {professionals.map(p => (
                    <ProfessionalCard key={p.id} professional={p} /> 
                ))}
            </Row>
        </Container>
    );
};

export default ProfessionalSearch;