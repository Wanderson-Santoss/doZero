import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, Image, Video, Paperclip } from "lucide-react";
import "./Chat.css";

const ChatWindow = ({ professional }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    // Enviar texto
    const sendMessage = () => {
        if (input.trim() === "") return;

        const newMsg = {
            id: Date.now(),
            type: "text",
            sent: true,
            content: input,
            timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, newMsg]);
        setInput("");

        // Simula resposta
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    type: "text",
                    sent: false,
                    content: "Recebido! Em breve te respondo 👍",
                    timestamp: new Date().toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                },
            ]);
        }, 1500);
    };

    // Enter envia mensagem
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    // Enviar arquivos (foto / vídeo / audio)
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let fileType = "file";

        if (file.type.startsWith("image/")) fileType = "image";
        if (file.type.startsWith("video/")) fileType = "video";
        if (file.type.startsWith("audio/")) fileType = "audio";

        const newMsg = {
            id: Date.now(),
            sent: true,
            type: fileType,
            fileURL: URL.createObjectURL(file),
            timestamp: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, newMsg]);
    };

    return (
        <div className="chat-main">
            {/* HEADER DO CHAT */}
            <div className="chat-header">
                <div className="chat-header-avatar">
                    {professional.full_name[0]}
                </div>
                <h5 className="m-0">{professional.full_name}</h5>
            </div>

            {/* MENSAGENS */}
            <div className="chat-body">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-bubble ${msg.sent ? "sent" : "received"}`}
                    >
                        {msg.type === "text" && msg.content}

                        {msg.type === "image" && (
                            <img src={msg.fileURL} className="bubble-media" alt="img" />
                        )}

                        {msg.type === "video" && (
                            <video className="bubble-media" controls src={msg.fileURL} />
                        )}

                        {msg.type === "audio" && (
                            <audio controls src={msg.fileURL} style={{ width: "220px" }} />
                        )}

                        <div className="timestamp">{msg.timestamp}</div>
                    </div>
                ))}

                {typing && (
                    <div className="typing-indicator">
                        {professional.full_name} está digitando...
                    </div>
                )}

                <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="chat-input-area d-flex align-items-center gap-2">
                
                {/* Upload de Imagem */}
                <label>
                    <Image size={22} color="#0077FF" style={{ cursor: "pointer" }} />
                    <input type="file" accept="image/*" hidden onChange={handleFile} />
                </label>

                {/* Upload de Vídeo */}
                <label>
                    <Video size={22} color="#0077FF" style={{ cursor: "pointer" }} />
                    <input type="file" accept="video/*" hidden onChange={handleFile} />
                </label>

                {/* Upload de Áudio */}
                <label>
                    <Mic size={22} color="#0077FF" style={{ cursor: "pointer" }} />
                    <input type="file" accept="audio/*" hidden onChange={handleFile} />
                </label>

                {/* Campo de texto */}
                <textarea
                    className="form-control chat-input"
                    rows={1}
                    placeholder="Digite uma mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                />

                {/* Botão enviar */}
                <button className="chat-send-btn" onClick={sendMessage}>
                    <Send size={22} color="#000" />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
