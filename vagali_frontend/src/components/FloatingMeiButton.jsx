import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Briefcase } from "lucide-react";
import "./FloatingMeiButton.css";

const FloatingMeiButton = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* Botão Flutuante */}
            <button 
                className="mei-floating-btn"
                onClick={() => setShowModal(true)}
                title="Aprenda como criar seu MEI"
            >
                <Briefcase size={28} color="#fff" />
            </button>

            {/* Modal com vídeo */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Como criar seu MEI</Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    <div className="video-container">
                        <iframe
                            width="100%"
                            height="400"
                            src="https://www.youtube.com/embed/y7OVwLCd0ag"
                            title="Como criar MEI"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default FloatingMeiButton;
