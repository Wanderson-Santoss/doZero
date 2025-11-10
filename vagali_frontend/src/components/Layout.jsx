import React from 'react';
import Header from './Header'; 
import Footer from './Footer'; 

const Layout = ({ children }) => {
    return (
        // Garante que o container principal tenha altura mínima e use o fundo do body (definido em App.css)
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;