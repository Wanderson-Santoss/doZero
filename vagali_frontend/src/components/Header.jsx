import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 1. IMPORTAR O LOGO
import logoBranco from '../assets/LOGOBRANCO.png'; // Ajuste o caminho conforme a sua estrutura de pastas

const Header = () => {
    // ... (Seu código de estado e useEffect para checar o login)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    // ...

    // Função de checagem (essencial para o header mudar)
    useEffect(() => {
        // Checa o token no localStorage
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token); 
        // Esta função deve ser mais robusta, mas o '!!token' é o mínimo.
    }, [navigate]); // Adicione 'navigate' se ele for usado em alguma função de clique

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        navigate('/');
        window.location.reload(); // Força o recarregamento da tela inicial
    };

    return (
        <Navbar expand="lg" className="bg-vagali-header shadow-sm" sticky="top">
            <Container>
                {/* 🚨 2. INCLUSÃO DA IMAGEM NO NAVBAR.BRAND */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-4">
                    <img
                        src={logoBranco} // Usa a importação do logo
                        height="30" // Define a altura da imagem
                        className="d-inline-block align-top me-2" // Adiciona margem à direita
                        alt="Logo Vagali"
                    />
                    <span style={{ color: 'var(--primary-color)' }}>VagALI</span> 
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/" className="me-3 nav-link-custom">
                            Início
                        </Nav.Link>
                        {/* Se estiver logado, mostra Perfil e Sair */}
                        {isLoggedIn ? (
                            <>
                                <Nav.Link as={Link} to="/me" className="me-3 nav-link-custom">
                                    Meu Perfil
                                </Nav.Link>
                                <Button 
                                    variant="outline-danger" 
                                    onClick={handleLogout}
                                    className="fw-bold"
                                >
                                    Sair
                                </Button>
                            </>
                        ) : (
                            // Se não estiver logado, mostra Login e Cadastro
                            <>
                                <Nav.Link as={Link} to="/login" className="me-3 nav-link-custom">
                                    Entrar
                                </Nav.Link>
                                <Button 
                                    as={Link} 
                                    to="/register" 
                                    className="fw-bold"
                                    style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                >
                                    Cadastre-se
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;