// src/components/ChatList.jsx
import React from "react";
import { Col, Card, ListGroup, Spinner, Button, Badge } from "react-bootstrap";
import { MessageSquare, Trash2, ChevronRight } from "lucide-react";
import logoWhite from "../assets/LOGOBRANCO.png";

const ChatList = ({ loading, conversations, onSelect, selectedId, setConversations, onDelete }) => {
  const handleDelete = (e, conv) => {
    e.stopPropagation();
    if (!window.confirm(`Remover conversa com ${conv.name}?`)) return;
    onDelete(conv.id);
  };

  return (
    <Col md={4} className="p-0">
      <Card className="h-100 border-0 chat-sidebar">
        <div className="chat-sidebar-header d-flex align-items-center">
          <img src={logoWhite} alt="logo" className="chat-logo" />
          <h5 className="ms-2 mb-0" style={{ color: "#fff" }}>Mensagens</h5>
          <div className="ms-auto pe-2">
            <Button variant="link" className="text-white p-0" title="Nova conversa">
              <MessageSquare color="#fff" />
            </Button>
          </div>
        </div>

        <div className="chat-search">
          <input className="form-control form-control-dark" placeholder="Buscar profissional..." />
        </div>

        <div className="chat-list-body px-2">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4 text-muted">Você não tem conversas.</div>
          ) : (
            <ListGroup variant="flush">
              {conversations.map((c) => (
                <ListGroup.Item
                  key={c.id}
                  action
                  className={`d-flex align-items-center px-3 py-2 ${selectedId === c.id ? "active-conv chat-contact active" : "chat-contact"}`}
                  onClick={() => onSelect(c)}
                >
                  <div className="chat-avatar me-3">{(c.avatar || c.name || "U").charAt(0).toUpperCase()}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <strong className="me-2">{c.name}</strong>
                      <small className="text-muted ms-auto">{c.updated_at ? c.updated_at : ""}</small>
                    </div>
                    <div className="text-truncate small text-muted">{c.last}</div>
                  </div>
                  <div className="d-flex align-items-center ms-3">
                    {c.unread > 0 && <Badge bg="primary" className="me-2">{c.unread}</Badge>}
                    <Button variant="link" className="text-danger p-0" onClick={(e) => handleDelete(e, c)}>
                      <Trash2 />
                    </Button>
                    <ChevronRight className="ms-2" />
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Card>
    </Col>
  );
};

export default ChatList;
