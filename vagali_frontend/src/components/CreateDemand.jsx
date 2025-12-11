// src/components/CreateDemand.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../config/axiosConfig"; // sua instância axios
import { Send, Image, Video, MapPin, FileText } from "lucide-react";

const SERVICE_OPTIONS = [
  // se você tiver endpoints para listar services, prefira buscar eles. Aqui um fallback
  { id: 1, name: "Eletricidade" },
  { id: 2, name: "Pintura" },
  { id: 3, name: "Hidráulica" },
  { id: 4, name: "Alvenaria" },
  { id: 5, name: "Limpeza" },
  { id: 99, name: "Outros" },
];

const CreateDemand = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const professionalData = location.state?.professional || null;

  const [formData, setFormData] = useState({
    service: professionalData?.service_id || SERVICE_OPTIONS[0].id,
    titulo: "",
    descricao: "",
    cep: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    // Se quiser carregar opções reais de serviços pelo endpoint: api.get('servicos/')
    // Exemplo comentado:
    // api.get("servicos/").then(resp => setServiceOptions(resp.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePhoto = (e) => {
    setPhotoFile(e.target.files[0] || null);
  };

  const handleVideo = (e) => {
    setVideoFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorObj(null);
    setSuccessMsg(null);

    try {
      // Monta multipart/form-data
      const payload = new FormData();
      // campos primários que o serializer espera
      payload.append("service", String(formData.service)); // IMPORTANT: campo deve ser 'service'
      payload.append("titulo", formData.titulo);
      payload.append("descricao", formData.descricao);
      payload.append("cep", formData.cep);

      // anexos (só adiciona se existir arquivo)
      if (photoFile) {
        payload.append("photos", photoFile); // campo name = photos (modelo FileField)
      }
      if (videoFile) {
        payload.append("videos", videoFile); // campo name = videos
      }

      // Se você quiser enviar um profissional pre-selecionado (APENAS se o backend aceitar):
      // if (professionalData?.id) payload.append("professional", String(professionalData.id));

      // Nota: não setamos explicitamente Content-Type: multipart/form-data
      // O axios faz isso automaticamente (com boundary) se você passar FormData.

      const resp = await api.post("demandas/", payload, {
        headers: {
          // Authorization já é injetado pela instância api, se configurado.
          // 'Content-Type' NÃO deve ser fixado aqui — deixe o axios cuidar.
        },
      });

      setSuccessMsg("Demanda criada com sucesso!");
      // Exibe resposta para debug (id, etc.)
      console.log("Create demanda response:", resp.data);

      // opcional: redireciona para perfil ou lista de demandas
      setTimeout(() => navigate("/meu-perfil"), 1000);
    } catch (err) {
      // Mostra o erro completo no console (útil para debug)
      console.error("Erro ao criar demanda:", err);

      // Se o backend retornou validação, exiba:
      if (err.response && err.response.data) {
        setErrorObj(err.response.data);
        console.log("Resposta backend:", err.response.data); // <-- aqui você verá o JSON com os campos inválidos
      } else {
        setErrorObj({ non_field_errors: ["Erro de conexão ou inesperado. Veja o console."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4 fw-bold">
              <Send size={20} className="me-2" /> {isEditing ? "Editar Demanda" : "Criar Nova Demanda"}
            </h2>

            {errorObj && (
              <Alert variant="danger" className="small">
                <strong>Erros:</strong>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(errorObj, null, 2)}</pre>
                <small>Verifique os campos indicados e tente novamente.</small>
              </Alert>
            )}

            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label><FileText size={16} className="me-1" /> Serviço</Form.Label>
                {professionalData ? (
                  <Form.Control type="text" value={professionalData?.service_name || "Serviço"} readOnly />
                ) : (
                  <Form.Select name="service" value={formData.service} onChange={handleChange} required>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><FileText size={16} className="me-1" /> Título</Form.Label>
                <Form.Control
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Instalação de ventilador"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><FileText size={16} className="me-1" /> Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Descreva o serviço..."
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label><MapPin size={16} className="me-1" /> CEP</Form.Label>
                  <Form.Control name="cep" value={formData.cep} onChange={handleChange} placeholder="24230000" />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label><Image size={16} className="me-1" /> Foto (opcional)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handlePhoto} />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label><Video size={16} className="me-1" /> Vídeo (opcional)</Form.Label>
                <Form.Control type="file" accept="video/*" onChange={handleVideo} />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="secondary" onClick={() => navigate("/meu-perfil")} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : isEditing ? "Salvar" : "Criar Demanda"}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateDemand;
 