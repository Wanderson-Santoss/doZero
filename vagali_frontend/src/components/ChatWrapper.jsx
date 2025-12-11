// src/components/ChatWrapper.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "./Chat.css";

// exemplo de usuário logado id
const CURRENT_USER_ID = 1;

// contatos demo — você pode carregar da API
const DEMO_CONTACTS = [
  { id: 10, name: "Marcos Eletricista", last: "Amanhã estarei lá!", avatar: "M", unread: 1 },
  { id: 11, name: "Ana Pintora", last: "Gostei da cor 💙", avatar: "A", unread: 0 },
  { id: 12, name: "João Encanador", last: "Enviei o orçamento!", avatar: "J", unread: 0 },
];

const DEMO_MESSAGES = {
  10: [
    { id: 1, sender_id: 10, content: "Olá! Conseguiu ver o disjuntor?", type: "text", timestamp: "10:02" },
    { id: 2, sender_id: CURRENT_USER_ID, content: "Sim! Acho que precisa trocar!", type: "text", timestamp: "10:05" },
    { id: 3, sender_id: 10, content: "Acredito que sim. Vou amanhã ver!", type: "text", timestamp: "10:10" },
  ],
  11: [
    { id: 1, sender_id: 11, content: "Posso recomendar um tom?", type: "text", timestamp: "09:50" },
    { id: 2, sender_id: CURRENT_USER_ID, content: "Claro! Envia aí 😊", type: "text", timestamp: "09:55" },
  ],
};

const ChatWrapper = () => {
  const [contacts, setContacts] = useState(DEMO_CONTACTS);
  const [selected, setSelected] = useState(null);
  const [messagesMap, setMessagesMap] = useState(DEMO_MESSAGES); // mensagens armazenadas por contato id
  const [loadingConvs] = useState(false);

  // seleciona primeiro contato por padrão
  useEffect(() => {
    if (!selected && contacts.length > 0) {
      setSelected(contacts[0]);
    }
  }, [contacts, selected]);

  // selecionar conversa
  const handleSelect = (conv) => {
    setSelected(conv);
    // marca como lida (simples)
    setContacts((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
    );
  };

  // apagar conversa (optimista)
  const handleDeleteConversation = (convId) => {
    setContacts((prev) => prev.filter((c) => c.id !== convId));
    setMessagesMap((prev) => {
      const copy = { ...prev };
      delete copy[convId];
      return copy;
    });
    if (selected?.id === convId) setSelected(null);
  };

  // enviar mensagem de texto
  const handleSendMessage = (contactId, text) => {
    if (!text?.trim()) return;

    const msg = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      content: text,
      type: "text",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => {
      const arr = prev[contactId] ? [...prev[contactId], msg] : [msg];
      return { ...prev, [contactId]: arr };
    });

    // atualiza preview na lista e move para topo
    setContacts((prev) => {
      const updated = prev.map((c) =>
        c.id === contactId ? { ...c, last: text, updated_at: msg.timestamp } : c
      );
      // move o contato para topo
      const moved = updated.filter((c) => c.id === contactId);
      const others = updated.filter((c) => c.id !== contactId);
      return [...moved, ...others];
    });

    // Simular resposta do profissional
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender_id: selected?.id || contactId,
        content: "Recebido! Em breve te retorno 👍",
        type: "text",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessagesMap((prev) => {
        const arr = prev[contactId] ? [...prev[contactId], reply] : [reply];
        return { ...prev, [contactId]: arr };
      });

      // atualiza preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId ? { ...c, last: reply.content, updated_at: reply.timestamp } : c
        )
      );
    }, 1200);
  };

  // envio de arquivo (img / video / audio)
  const handleSendFile = (contactId, file, fileType) => {
    if (!file) return;

    const msg = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      type: fileType,
      fileURL: URL.createObjectURL(file),
      filename: file.name,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => {
      const arr = prev[contactId] ? [...prev[contactId], msg] : [msg];
      return { ...prev, [contactId]: arr };
    });

    setContacts((prev) => {
      const updated = prev.map((c) =>
        c.id === contactId ? { ...c, last: `[${fileType}] ${file.name}`, updated_at: msg.timestamp } : c
      );
      const moved = updated.filter((c) => c.id === contactId);
      const others = updated.filter((c) => c.id !== contactId);
      return [...moved, ...others];
    });

    // opcional: pode enviar para backend aqui
  };

  // enviar áudio simulado (blob data can be used to send to backend)
  const handleSendAudioBlob = (contactId, blob, durationLabel) => {
    if (!blob) return;
    const fileURL = URL.createObjectURL(blob);

    const msg = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      type: "audio",
      fileURL,
      filename: `audio-${Date.now()}.webm`,
      duration: durationLabel || "0:05",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => {
      const arr = prev[contactId] ? [...prev[contactId], msg] : [msg];
      return { ...prev, [contactId]: arr };
    });

    setContacts((prev) => {
      const updated = prev.map((c) =>
        c.id === contactId ? { ...c, last: `[Áudio] ${msg.duration}`, updated_at: msg.timestamp } : c
      );
      const moved = updated.filter((c) => c.id === contactId);
      const others = updated.filter((c) => c.id !== contactId);
      return [...moved, ...others];
    });
  };

  return (
    <Container fluid className="p-0">
      <Row g={0}>
        <ChatList
          loading={loadingConvs}
          conversations={contacts}
          onSelect={handleSelect}
          selectedId={selected?.id}
          setConversations={setContacts}
          onDelete={handleDeleteConversation}
        />

        <Col md={8} className="p-0">
          <ChatWindow
            currentUserId={CURRENT_USER_ID}
            contact={selected}
            messages={selected ? messagesMap[selected.id] || [] : []}
            onSendText={(text) => selected && handleSendMessage(selected.id, text)}
            onSendFile={(file, fileType) => selected && handleSendFile(selected.id, file, fileType)}
            onSendAudioBlob={(blob, durationLabel) => selected && handleSendAudioBlob(selected.id, blob, durationLabel)}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatWrapper;
