import React from "react";
import { motion } from "framer-motion";
import "./hero.css";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero-section">

            {/* Overlay escuro para melhorar contraste */}
            <div className="hero-overlay"></div>

            {/* Conteúdo do Hero */}
            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Encontre os Melhores  
                    <span className="highlight"> Profissionais</span><br />
                    Para o seu projeto
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Profissionais avaliados, serviços confiáveis e preços acessíveis.
                    Tudo em um só lugar.
                </motion.p>

                <motion.button
                    className="hero-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 160 }}
                    onClick={() => navigate("/")}
                >
                    Encontrar profissionais <ArrowRight size={18} className="ms-2" />
                </motion.button>
            </motion.div>

        </section>
    );
};

export default Hero;
