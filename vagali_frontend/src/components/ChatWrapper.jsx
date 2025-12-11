import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, InputGroup, Form } from "react-bootstrap";
import { Send, ChevronLeft } from "lucide-react";
import "./Chat.css";

import logoWhite from "../assets/LOGOBRANCO.png";

const CURRENT_USER_ID = 1;

// Contatos iniciais demonstrativos
const DEMO_CONTACTS = [
    { id: 10, name: "Marcos Eletricista", last: "Tudo certo! Vou amanhã.", avatar: "M" },
    { id: 11, name: "Ana Pintora", last: "Gostei da cor escolhida 😊", avatar: "A" },
    { id: 12, name: "João Encanador", last: "Passei o orçamento!", avatar: "J" },
];

// Mensagens de demonstração
const DEMO_MESSAGES = {
    10: [
        { id: 1, sender_id: 10, content: "Olá! Conseguiu ver o disjuntor?", timestamp: "10:02" },
        { id: 2, sender_id: 1, content: "Sim! Precisa trocar?", timestamp: "10:05" },
        { id: 3, sender_id: 10, content: "Acredito que sim. Vou amanhã ver!", timestamp: "10:10" },
    ],
    11: [
        { id: 1, sender_id: 11, content: "Posso sugerir um novo tom de azul?", timestamp: "09:50" },
        { id: 2, sender_id: 1, content: "Claro! Envia aí 😊", timestamp: "09:55" },
    ]
};

const ChatBubble = ({ message }) => {
    const sent = message.sender_id === CURRENT_USER_ID;

    return (
        <div className={`d-flex ${sent ? "justify-content-end" : "justify-content-start"}`}>
            <div className={`chat-bubble ${sent ? "sent" : "received"}`}>
                {message.content}
                <div className="timestamp">{message.timestamp}</div>
            </div>
        </div>
    );
};

const ChatWrapper = () => {
    const [contacts, setContacts] = useState(DEMO_CONTACTS);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (selected) {
            setMessages(DEMO_MESSAGES[selected.id] || []);
        }
    }, [selected]);

    return (
        <Container fluid className="p-0">
            <Row g={0}>
                {/* LISTA DE CONTATOS */}
                <Col md={4} className="chat-sidebar">

                    <div className="chat-sidebar-header">
                        <img src={logoWhite} alt="logo" />
                        <h5>Mensagens</h5>
                    </div>

                    <div className="chat-search">
                        <InputGroup>
                            <Form.Control placeholder="Buscar..." className="chat-input" />
                        </InputGroup>
                    </div>

                    {contacts.map(c => (
                        <div
                            key={c.id}
                            className={`chat-contact ${selected?.id === c.id ? "active" : ""}`}
                            onClick={() => setSelected(c)}
                        >
                            <div className="chat-avatar">{c.avatar}</div>
                            <div>
                                <strong>{c.name}</strong>
                                <div className="text-light small">{c.last}</div>
                            </div>
                        </div>
                    ))}
                </Col>

                {/* JANELA DO CHAT */}
                <Col md={8} className="chat-main">
                    {!selected ? (
                        <div className="text-center mt-5" style={{ color: "#777" }}>
                            <Send size={36} className="mb-3" />
                            <h4>Selecione um chat</h4>
                        </div>
                    ) : (
                        <>
                            {/* HEADER */}
                            <div className="chat-header">
                                <Button variant="link" className="text-white me-3">
                                    <ChevronLeft size={26} />
                                </Button>

                                <div className="chat-header-avatar">{selected.avatar}</div>

                                <div>
                                    <strong>{selected.name}</strong>
                                    <div className="small">online</div>
                                </div>
                            </div>

                            {/* MENSAGENS */}
                            <div className="chat-body">
                                {messages.map(m => (
                                    <ChatBubble key={m.id} message={m} />
                                ))}
                            </div>

                            {/* INPUT */}
                            <div className="chat-input-area">
                                <InputGroup>
                                    <Form.Control placeholder="Digite sua mensagem..." className="chat-input" />

                                    <Button className="chat-send-btn">
                                        <Send size={22} />
                                    </Button>
                                </InputGroup>
                            </div>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ChatWrapper;
