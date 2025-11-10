import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Clock, ArrowRightCircle, Calendar as CalendarIcon } from 'react-bootstrap-icons';
import axios from 'axios';

// Importa o componente de calendário e seus estilos
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

const SCHEDULE_API_URL = '/api/v1/agenda/disponibilidade/'; // URL da sua API

const ProfessionalSchedule = () => {
    const { id } = useParams(); 

    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Formata a data para YYYY-MM-DD
    const formatApiDate = (date) => date.toISOString().split('T')[0];

    // Função que busca a disponibilidade (Você precisa implementar este endpoint no Django)
    const fetchAvailability = async (date) => {
        setLoading(true);
        setError(null);
        setAvailability(null);

        const formattedDate = formatApiDate(date);
        
        try {
            // Requisição GET (deve ser ajustada para sua API real)
            const response = await axios.get(`${SCHEDULE_API_URL}${id}/${formattedDate}/`);
            
            // Simulação de dados (Substitua esta linha pela sua lógica de API)
            const apiData = response.data.available_slots || [
                 "09:00", "10:30", "14:00", "15:30", "17:00" 
            ];
            
            setAvailability(apiData);

        } catch (err) {
            console.error("Erro ao buscar agenda:", err.response || err);
            setError("Não foi possível carregar a agenda. Verifique o ID e o endpoint da API."); 
            setAvailability([]); 

        } finally {
            setLoading(false);
        }
    };
    
    // Chamado ao clicar em um dia no calendário
    const handleDateChange = (value) => {
        const newDate = Array.isArray(value) ? value[0] : value;
        
        if (newDate instanceof Date && !isNaN(newDate)) {
            setSelectedDate(newDate);
            setSelectedSlot(null); 
            fetchAvailability(newDate);
        }
    };

    const handleSlotSelection = (slot) => {
        setSelectedSlot(slot);
    };
    
    useEffect(() => {
        fetchAvailability(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); 

    // Renderiza os horários disponíveis
    const renderAvailability = () => {
        if (loading) {
            return <div className="text-center py-4"><Spinner animation="border" variant="warning" size="sm" /> Carregando slots...</div>;
        }

        if (error) {
            return <Alert variant="danger" className="text-center">{error}</Alert>;
        }
        
        if (!availability || availability.length === 0) {
            return <Alert variant="info" className="text-center">Nenhum horário disponível para esta data.</Alert>;
        }

        return (
            <ListGroup>
                {availability.map((slot) => (
                    <ListGroup.Item 
                        key={slot} 
                        action 
                        onClick={() => handleSlotSelection(slot)} 
                        active={selectedSlot === slot}
                        className="d-flex justify-content-between align-items-center bg-vagali-dark-card text-white border-secondary"
                    >
                        <Clock className="me-2 text-warning" /> 
                        {slot}
                        {selectedSlot === slot && <ArrowRightCircle className="text-success" />}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        );
    };


    return (
        <Container className="py-5 text-white" style={{minHeight: '80vh'}}>
            <h2 className="mb-4 text-warning"><CalendarIcon className="me-3" /> Agenda do Profissional ID: {id}</h2>

            <Row>
                <Col md={6}>
                    <Card className="bg-vagali-dark-card p-4 shadow mb-4">
                        <h4 className="border-bottom border-primary pb-2 mb-3">Selecione o Dia</h4>
                        
                        <Calendar 
                            onChange={handleDateChange} 
                            value={selectedDate} 
                            locale="pt-BR"
                            className="w-100 border-0 bg-transparent text-white"
                        />

                        <div className="text-center mt-3">
                            <span className="fs-5 fw-bold">
                                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="bg-vagali-dark-card p-4 shadow">
                        <h4 className="border-bottom border-primary pb-2 mb-3">Horários Disponíveis</h4>
                        {renderAvailability()}
                        
                        <div className="mt-4 text-center">
                            <Button 
                                variant="success" 
                                size="lg" 
                                className="w-75 fw-bold"
                                disabled={!selectedSlot}
                            >
                                Agendar {selectedSlot ? `às ${selectedSlot}` : ''}
                            </Button>
                            <p className="small text-white-50 mt-2">Você será redirecionado para a confirmação.</p>
                        </div>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalSchedule;