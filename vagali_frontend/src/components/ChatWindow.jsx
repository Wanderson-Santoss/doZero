// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button, InputGroup, Form } from "react-bootstrap";
import { Send, Mic, Image, Video, Smile } from "lucide-react";
import "./Chat.css";

/**
 * ChatWindow
 * props:
 * - contact: contato selecionado {id, name, avatar}
 * - messages: array de mensagens do contato
 * - onSendText(text)
 * - onSendFile(file, fileType)
 * - onSendAudioBlob(blob, durationLabel)
 */
const EMOJIS = [
  "😀","😃","😊","😁","😂","😍","😉","🤝","👍","🙏","😅","😮","😢","😡","🎉","🔥","💡","✅"
];

const ChatWindow = ({ contact, messages = [], onSendText, onSendFile, onSendAudioBlob, currentUserId }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // gravação simulada
  const [isRecording, setIsRecording] = useState(false);
  const [recStartTs, setRecStartTs] = useState(null);
  const [recElapsed, setRecElapsed] = useState(0);
  const recTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const messagesEndRef = useRef(null);
  const fileImgRef = useRef(null);
  const fileVideoRef = useRef(null);
  const fileAudioRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Enter enviar (Shift+Enter nova linha)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendText && onSendText(text);
    setInput("");
    setShowEmoji(false);
  };

  // emoji insert
  const handleInsertEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // upload handlers
  const handleFileChange = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    onSendFile && onSendFile(file, type);
    e.target.value = "";
  };

  // gravação de áudio simulada (usa MediaRecorder se suportado) — tentamos usar, se não, simulamos blob vazio
  const startRecording = async () => {
    // tenta usar MediaRecorder para gerar blob real
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      // falha: fallback para simulação (não grava mic)
      mediaRecorderRef.current = null;
    }

    setIsRecording(true);
    setRecStartTs(Date.now());
    setRecElapsed(0);

    recTimerRef.current = setInterval(() => {
      setRecElapsed((prev) => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    // Pausa lógica: se MediaRecorder suportar, pausamos; senão apenas paramos o timer (simulação)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording" && mediaRecorderRef.current.pause) {
      mediaRecorderRef.current.pause();
    }
    clearInterval(recTimerRef.current);
    recTimerRef.current = null;
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    recordedChunksRef.current = [];
    clearInterval(recTimerRef.current);
    recTimerRef.current = null;
    setIsRecording(false);
    setRecElapsed(0);
  };

  const finishRecordingAndSend = async () => {
    clearInterval(recTimerRef.current);
    recTimerRef.current = null;

    // se MediaRecorder gravou dados, crie blob
    if (mediaRecorderRef.current) {
      // se estiver pausado, resume e stop para finalizar
      try {
        if (mediaRecorderRef.current.state === "paused" && mediaRecorderRef.current.resume) {
          mediaRecorderRef.current.resume();
        }
      } catch {}
      // aguarda small timeout para garantir dataavailable
      await new Promise((r) => setTimeout(r, 200));
      mediaRecorderRef.current.stop();

      // aguarda evento onstop para compor blob: vamos criar um pequeno delay
      await new Promise((resolve) => {
        const check = () => {
          // quando chunks existirem, resolve
          if (recordedChunksRef.current.length > 0) return resolve();
          setTimeout(check, 100);
        };
        check();
      });

      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const minutes = Math.floor(recElapsed / 60);
      const seconds = recElapsed % 60;
      const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

      onSendAudioBlob && onSendAudioBlob(blob, label);

      // limpar
      recordedChunksRef.current = [];
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecElapsed(0);
      return;
    }

    // fallback: simulação de blob vazio (não-gravado)
    // criamos um small silent blob (WebAudio would be better; here we fake)
    const arr = new Uint8Array([0]);
    const fakeBlob = new Blob([arr], { type: "audio/webm" });
    const minutes = Math.floor(recElapsed / 60);
    const seconds = recElapsed % 60;
    const label = `${minutes}:${String(seconds).padStart(2, "0")}`;

    onSendAudioBlob && onSendAudioBlob(fakeBlob, label);
    setIsRecording(false);
    setRecElapsed(0);
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="d-flex flex-column h-100">
      {!contact ? (
        <div className="text-center mt-5" style={{ color: "#777" }}>
          <Send size={36} className="mb-3" />
          <h4>Selecione um chat</h4>
        </div>
      ) : (
        <>
          <div className="chat-header d-flex align-items-center">
            <div className="chat-header-avatar">{contact.avatar || contact.name?.[0]}</div>
            <div>
              <strong style={{ color: "#fff" }}>{contact.name}</strong>
              <div className="small text-white">online</div>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble ${m.sender_id === currentUserId ? "sent" : "received"}`}>
                {m.type === "text" && m.content}
                {m.type === "image" && <img src={m.fileURL} alt="img" className="bubble-media" />}
                {m.type === "video" && <video src={m.fileURL} controls className="bubble-media" />}
                {m.type === "audio" && (
                  <div>
                    <audio controls src={m.fileURL} />
                    {m.duration && <div className="small text-muted">Duração: {m.duration}</div>}
                  </div>
                )}
                <div className="timestamp">{m.timestamp}</div>
              </div>
            ))}

            {isTyping && <div className="typing-indicator">{contact.name} está digitando...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* gravação - pequeno painel */}
          {isRecording && (
            <div className="recording-indicator">
              🔴 Gravando... {formatDuration(recElapsed)}
              <div style={{ marginTop: 6 }}>
                <Button size="sm" variant="outline-dark" onClick={pauseRecording} className="me-2">Pausar</Button>
                <Button size="sm" variant="outline-danger" onClick={cancelRecording} className="me-2">Cancelar</Button>
                <Button size="sm" variant="success" onClick={finishRecordingAndSend}>Enviar</Button>
              </div>
            </div>
          )}

          <div className="chat-input-area d-flex align-items-center gap-2 p-3">
            <div style={{ position: "relative" }}>
              <button className="emoji-btn" onClick={() => setShowEmoji((s) => !s)} title="Emoji">
                <Smile size={22} color="#0077FF" />
              </button>
              {showEmoji && (
                <div className="emoji-popup card p-2">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                    {EMOJIS.map((em) => (
                      <button key={em} className="btn btn-sm btn-light" onClick={() => handleInsertEmoji(em)}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label title="Enviar imagem" style={{ cursor: "pointer" }}>
              <Image size={22} color="#0077FF" />
              <input ref={fileImgRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, "image")} />
            </label>

            <label title="Enviar vídeo" style={{ cursor: "pointer" }}>
              <Video size={22} color="#0077FF" />
              <input ref={fileVideoRef} type="file" accept="video/*" hidden onChange={(e) => handleFileChange(e, "video")} />
            </label>

            {/* gravação via microfone: inicia / cancela / enviar */}
            <div>
              <button
                className="mic-btn"
                title={isRecording ? "Gravando..." : "Gravar áudio"}
                onClick={() => {
                  if (!isRecording) startRecording();
                  else finishRecordingAndSend();
                }}
              >
                <Mic size={22} color={isRecording ? "#d9534f" : "#0077FF"} />
              </button>
            </div>

            <textarea
              className="form-control chat-input"
              rows={1}
              placeholder="Digite uma mensagem... (Enter enviar, Shift+Enter quebra)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowEmoji(false)}
              style={{ resize: "none" }}
            />

            <button className="chat-send-btn" onClick={handleSend} title="Enviar">
              <Send size={20} color="#000" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
