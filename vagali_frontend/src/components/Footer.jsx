import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import "./footer.css"

function Footer() {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
            <Container>

                {/* DIVISÃO EM COLUNAS */}
                <Row className="gy-4">

                    {/* COLUNA 1 – LOGO + DESCRIÇÃO */}
                    <Col md={4}>
                        <h4 className="fw-bold">VagALI</h4>
                        <p className="small mt-2 text-light">
                            Conectando clientes aos melhores profissionais da sua região.
                            Simples, rápido e seguro.
                        </p>
                    </Col>

                    {/* COLUNA 2 – LINKS RÁPIDOS */}
                    <Col md={4}>
                        <h6 className="fw-bold mb-3">Navegação</h6>
                        <ul className="list-unstyled small">
                            <li className="mb-2"><a href="/" className="text-light text-decoration-none">Início</a></li>
                            <li className="mb-2"><a href="/buscar" className="text-light text-decoration-none">Buscar Profissionais</a></li>
                            <li className="mb-2"><a href="/criar-demanda" className="text-light text-decoration-none">Criar Demanda</a></li>
                            <li className="mb-2"><a href="/login" className="text-light text-decoration-none">Entrar</a></li>
                        </ul>
                    </Col>

                    {/* COLUNA 3 – CONTATO + REDES SOCIAIS */}
                    <Col md={4}>
                        <h6 className="fw-bold mb-3">Contato</h6>

                        <p className="small d-flex align-items-center">
                            <Mail size={16} className="me-2" /> suporte@vagali.com
                        </p>

                        <p className="small d-flex align-items-center">
                            <Phone size={16} className="me-2" /> (11) 99999-9999
                        </p>

                        <p className="small d-flex align-items-center">
                            <MapPin size={16} className="me-2" /> São Paulo, Brasil
                        </p>

                        <div className="d-flex mt-3 gap-3">
                            <a href="#" className="text-white"><Facebook size={20} /></a>
                            <a href="#" className="text-white"><Instagram size={20} /></a>
                            <a href="#" className="text-white"><Linkedin size={20} /></a>
                        </div>
                    </Col>
                </Row>

                {/* LINHA DE COPYRIGHT */}
                <div className="text-center mt-4 pt-3 border-top border-secondary small">
                    &copy; {new Date().getFullYear()} <strong>VagALI</strong>. Todos os direitos reservados.
                </div>

            </Container>
        </footer>
    );
}

export default Footer;
