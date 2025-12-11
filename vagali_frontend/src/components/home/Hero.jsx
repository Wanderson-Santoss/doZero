import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactTyped } from "react-typed"; // ✅ IMPORTAÇÃO CORRETA
import "./hero.css";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero-section">

            {/* Overlay */}
            <div className="hero-overlay"></div>

            {/* Partículas animadas */}
            <ul className="particles">
                <li></li><li></li><li></li><li></li><li></li>
            </ul>

            {/* Conteúdo */}
            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                >
                    <span className="highlight">VAGALI</span><br />

                    {/* DIGITAÇÃO FUNCIONANDO */}
                    <ReactTyped
                        strings={[
                            "A vida muda quando alguém acredita em você.",
                            "Cada conexão importa.",
                            "Seu talento merece oportunidade."
                        ]}
                        typeSpeed={70}
                        backSpeed={40}
                        loop
                    />
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                >
                    Conectamos você aos melhores profissionais — rápidos, confiáveis e avaliados.
                </motion.p>

                <motion.button
                    className="hero-button"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 180 }}
                    onClick={() => navigate("/")}
                >
                    Explorar serviços <ArrowRight size={18} className="ms-2" />
                </motion.button>
            </motion.div>

        </section>
    );
};

export default Hero;
