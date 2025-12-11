// src/components/MyDemandsSection.jsx
import React, { useState, useEffect } from "react";
import { Card, Button, ListGroup, Spinner, Alert, Badge } from "react-bootstrap";
import api from "../config/axiosConfig";
import { Link } from "react-router-dom";

const STATUS_VARIANT = {
  pendente: "danger",
  aceita: "warning",
  em_andamento: "info",
  concluida: "success",
  cancelada: "secondary",
};

const MyDemandsSection = () => {
  const [loading, setLoading] = useState(true);
  const [demands, setDemands] = useState([]);
  const [error, setError] = useState(null);

  // -----------------------------------------
  // 1) BUSCAR DEMANDAS
  // -----------------------------------------
  const fetchDemands = async () => {
    console.log("🔎 Carregando demandas...");

    setLoading(true);
    setError(null);

    try {
      const res = await api.get("demandas/");

      console.log("📌 Resposta backend:", res.data);

      setDemands(res.data);
    } catch (err) {
      console.error("❌ Erro ao carregar demandas:", err);
      setError(err?.response?.data || "Erro ao carregar demandas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  // -----------------------------------------
  // 2) EXCLUIR DEMANDA
  // -----------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta demanda?")) return;

    try {
      await api.delete(`demandas/${id}/`);
      setDemands((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Erro ao excluir demanda.");
      console.error(err);
    }
  };

  // -----------------------------------------
  // 3) RENDER
  // -----------------------------------------
  return (
    <Card className="shadow-lg mb-4 border-primary">
      <Card.Header className="fw-bold bg-primary text-white d-flex justify-content-between align-items-center">
        Suas Demandas
        <Button as={Link} to="/criar-demanda" variant="warning" size="sm">
          Criar Nova
        </Button>
      </Card.Header>

      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{JSON.stringify(error)}</Alert>
        ) : demands.length === 0 ? (
          <Alert variant="info">Você não tem demandas ainda.</Alert>
        ) : (
          <ListGroup variant="flush">
            {demands.map((d) => (
              <ListGroup.Item
                key={d.id}
                className="d-flex justify-content-between align-items-start"
              >
                <div>
                  <h6 className="mb-1">{d.titulo}</h6>
                  <small className="text-muted d-block">{d.descricao}</small>
                  <small className="text-muted">CEP: {d.cep}</small>

                  <div className="mt-1">
                    {d.photos && (
                      <a href={d.photos} target="_blank" rel="noreferrer" className="me-2">
                        Ver foto
                      </a>
                    )}
                    {d.videos && (
                      <a href={d.videos} target="_blank" rel="noreferrer" className="me-2">
                        Ver vídeo
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  <Badge bg={STATUS_VARIANT[d.status] || "secondary"} className="mb-2">
                    {d.status}
                  </Badge>
                  <div>
                    <Button
                      as={Link}
                      to={`/editar-demanda/${d.id}`}
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                    >
                      Editar
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(d.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyDemandsSection;
