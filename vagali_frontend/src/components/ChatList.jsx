import React from "react";
import { Col, Card, ListGroup, Spinner, Button, Badge } from "react-bootstrap";
import { MessageSquare, Trash2, ChevronRight } from "lucide-react";

/**
 * ChatList: lateral esquerda com conversa + search + logo
 */
const ChatList = ({ loading, conversations, onSelect, selectedId, setConversations }) => {
  const handleDelete = (e, conv) => {
    e.stopPropagation();
    if (!window.confirm(`Remover conversa com ${conv.name}?`)) return;
    // otimista
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    // chamar API se quiser
  };

  return (
    <Col md={4} className="chat-list-col p-0">
      <Card className="chat-list-card h-100 border-0">
        <div className="chat-list-top d-flex align-items-center px-3 py-2">
          <img src="/assets/LOGOBRANCO.png" alt="logo" className="chat-logo" />
          <h5 className="ms-2 mb-0">Mensagens</h5>
          <div className="ms-auto">
            <Button variant="link" className="text-muted p-0" title="Nova conversa">
              <MessageSquare />
            </Button>
          </div>
        </div>

        <div className="chat-search px-3">
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
                  className={`d-flex align-items-center px-3 py-2 ${selectedId === c.id ? "active-conv" : ""}`}
                  onClick={() => onSelect(c)}
                >
                  <div className="conv-avatar me-3">{(c.name || "U").charAt(0).toUpperCase()}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <strong className="me-2">{c.name}</strong>
                      <small className="text-muted ms-auto">{c.updated_at ? c.updated_at : ""}</small>
                    </div>
                    <div className="text-truncate small text-muted">{c.lastMessage}</div>
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
