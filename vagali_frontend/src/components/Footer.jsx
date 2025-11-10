import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
    return (
        // Adicionando mt-auto garante que ele se alinhe ao fundo se o conteúdo for curto
        <footer className="bg-dark text-white py-4 mt-auto"> 
            <Container className="text-center">
                <p className="mb-0 small">&copy; {new Date().getFullYear()} VagALI. Todos os direitos reservados.</p>
            </Container>
        </footer>
    );
}

export default Footer;