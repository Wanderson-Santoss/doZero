import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

// Auth Context
import { useAuth } from './AuthContext';

// Ícones Lucide
import { LogOut, User, Briefcase, LogIn, UserPlus } from 'lucide-react';

// CSS de animação do Header
import "./HeaderAnimation.css";

// Logo
import LogoBranco from '../assets/LOGOBRANCO.png';

const Header = () => {
    const { 
        isAuthenticated, 
        isUserProfessional, 
        userId,
        logout
    } = useAuth();

    return (
        <Navbar 
            bg="dark" 
            variant="dark" 
            expand="lg" 
            className="shadow-sm border-bottom border-primary"
        >
            <Container>

                {/* LOGO + NOME */}
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="fw-bold fs-4 d-flex align-items-center text-primary"
                >
                    <img 
                        src={LogoBranco}
                        alt="logo"
                        className="header-logo"  // ⬅ classe de animação
                        style={{
                            height: "100px",  // ⬅ tamanho maior, sem mexer no bloco
                            width: "auto",
                            marginRight: "12px"
                        }}
                    />
                    VagAli
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    
                    <Nav className="ms-auto d-flex align-items-center">

                        {/* INÍCIO */}
                        <NavLink 
                            to="/"
                            className={({ isActive }) =>
                                "nav-link nav-animated fw-bold me-3 " +
                                (isActive ? "active-link" : "text-light")
                            }
                        >
                            Início
                        </NavLink>

                        {/* --- USUÁRIO LOGADO --- */}
                        {isAuthenticated ? (
                            <>
                                {/* MINHA CONTA */}
                                <NavLink 
                                    to="/meu-perfil"
                                    className={({ isActive }) =>
                                        "nav-link nav-animated fw-bold me-3 d-flex align-items-center " +
                                        (isActive ? "active-link" : "text-light")
                                    }
                                >
                                    <User size={18} className="me-1" /> Minha Conta
                                </NavLink>

                                {/* MEU PORTFÓLIO (PROFISSIONAL) */}
                                {isUserProfessional && (
                                    <NavLink 
                                        to={`/professional/${userId}`}
                                        className={({ isActive }) =>
                                            "nav-link nav-animated fw-bold me-3 d-flex align-items-center " +
                                            (isActive ? "active-link" : "text-light")
                                        }
                                    >
                                        <Briefcase size={18} className="me-1" /> Meu Portfólio
                                    </NavLink>
                                )}

                                {/* SAIR */}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="fw-bold d-flex align-items-center nav-animated"
                                    onClick={logout}
                                >
                                    <LogOut size={16} className="me-1" /> Sair
                                </Button>
                            </>
                        ) : (
                        /* --- USUÁRIO DESLOGADO --- */
                            <>
                                {/* LOGIN */}
                                <NavLink 
                                    to="/login"
                                    className={({ isActive }) =>
                                        "nav-link nav-animated fw-bold me-3 d-flex align-items-center " +
                                        (isActive ? "active-link" : "text-warning")
                                    }
                                >
                                    <LogIn size={18} className="me-1" /> Login
                                </NavLink>

                                {/* CADASTRO */}
                                <Button 
                                    as={Link} 
                                    to="/register" 
                                    variant="primary"
                                    className="fw-bold d-flex align-items-center nav-animated"
                                >
                                    <UserPlus size={18} className="me-1" /> Cadastro
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
