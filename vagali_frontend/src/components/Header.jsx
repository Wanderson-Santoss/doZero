import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

// Auth Context
import { useAuth } from './AuthContext';

// Ícones Lucide
import { LogOut, User, Briefcase, LogIn, UserPlus } from 'lucide-react';

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
                        style={{
                            height: "100px",     // ⬅ aumenta só a logo
                            width: "auto",      // mantém proporção natural
                            marginRight: "12px"
                        }}
                    />

                    VagAli
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    
                    <Nav className="ms-auto d-flex align-items-center">

                        {/* BOTÃO INÍCIO */}
                        <NavLink 
                            to="/"
                            className={({ isActive }) =>
                                "nav-link fw-bold me-3 " +
                                (isActive ? "text-primary border-bottom border-primary pb-1" : "text-light")
                            }
                        >
                            Início
                        </NavLink>

                        {/* ------------------ USUÁRIO LOGADO ------------------ */}
                        {isAuthenticated ? (
                            <>
                                {/* MINHA CONTA */}
                                <NavLink 
                                    to="/meu-perfil"
                                    className={({ isActive }) =>
                                        "nav-link fw-bold me-3 d-flex align-items-center " +
                                        (isActive ? "text-primary border-bottom border-primary pb-1" : "text-light")
                                    }
                                >
                                    <User size={18} className="me-1" /> Minha Conta
                                </NavLink>

                                {/* MEU PORTFÓLIO (SÓ PROFISSIONAL) */}
                                {isUserProfessional && (
                                    <NavLink 
                                        to={`/professional/${userId}`}
                                        className={({ isActive }) =>
                                            "nav-link fw-bold me-3 d-flex align-items-center " +
                                            (isActive ? "text-primary border-bottom border-primary pb-1" : "text-light")
                                        }
                                    >
                                        <Briefcase size={18} className="me-1" /> Meu Portfólio
                                    </NavLink>
                                )}

                                {/* BOTÃO SAIR */}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="fw-bold d-flex align-items-center"
                                    onClick={logout}
                                >
                                    <LogOut size={16} className="me-1" /> Sair
                                </Button>
                            </>

                        ) : (
                        /* ------------------ USUÁRIO DESLOGADO ------------------ */
                            <>
                                {/* LOGIN */}
                                <NavLink 
                                    to="/login"
                                    className={({ isActive }) =>
                                        "nav-link fw-bold me-3 d-flex align-items-center " +
                                        (isActive ? "text-primary border-bottom border-primary pb-1" : "text-warning")
                                    }
                                >
                                    <LogIn size={18} className="me-1" /> Login
                                </NavLink>

                                {/* CADASTRO */}
                                <Button 
                                    as={Link} 
                                    to="/register" 
                                    variant="primary"
                                    className="fw-bold d-flex align-items-center"
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
