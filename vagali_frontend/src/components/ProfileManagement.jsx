// src/components/ProfileManagement.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Collapse,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  User,
  Repeat,
  Settings,
  MapPin,
  Camera,
  Heart,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  LogOut,
} from "lucide-react";

import MyDemandsSection from "./MyDemandsSection";
import { useAuth } from "./AuthContext";

const VIACEP_URL = "https://viacep.com.br/ws/";
const API_BASE_URL = "http://localhost:8000";
const DEFAULT_AVATAR =
  "https://via.placeholder.com/150/007bff/ffffff?text=FOTO";

const ProfileManagement = () => {
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  const {
    userRole,
    setUserRole,
    isUserProfessional,
    userId,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    profilePictureUrl: DEFAULT_AVATAR,
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState(null);

  const fetchAddressByCep = useCallback(async (cep) => {
    const cleanedCep = cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) {
      setCepError(null);
      return;
    }
    setCepLoading(true);
    setCepError(null);
    try {
      const response = await axios.get(`${VIACEP_URL}${cleanedCep}/json/`);
      const data = response.data;
      if (data.erro) {
        setCepError("CEP não encontrado.");
        setProfileData((prev) => ({
          ...prev,
          street: "",
          neighborhood: "",
          city: "",
          state: "",
        }));
      } else {
        setProfileData((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));
      }
    } catch (error) {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  }, []);

  // 🔹 CARREGA O PERFIL UMA ÚNICA VEZ AO MONTAR
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setLoadError(null);
      try {
        const resp = await axios.get("/api/v1/accounts/perfil/me/");
        const { email, profile } = resp.data || {};

        setProfileData((prev) => ({
          ...prev,
          fullName: profile?.full_name || "",
          email: email || "",
          phone: profile?.phone_number || "",
          cep: profile?.cep || "",
          street: profile?.address || "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          profilePictureUrl: profile?.photo
            ? profile.photo.startsWith("http")
              ? profile.photo
              : `${API_BASE_URL}${profile.photo}`
            : DEFAULT_AVATAR,
        }));
        // ⚠️ NÃO chamamos setUserRole aqui pra evitar loop
      } catch (err) {
        console.error("Erro ao carregar perfil:", err.response || err);
        setLoadError("Não foi possível carregar seus dados de perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []); // <-- array vazio: executa apenas 1 vez

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    if (name === "cep") {
      if (value.replace(/\D/g, "").length === 8) {
        fetchAddressByCep(value);
      }
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      await axios.post("/api/v1/accounts/perfil/me/photo/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const resp = await axios.get("/api/v1/accounts/perfil/me/");
      const { email, profile } = resp.data || {};
      setProfileData((prev) => ({
        ...prev,
        fullName: profile?.full_name || prev.fullName,
        email: email || prev.email,
        phone: profile?.phone_number || prev.phone,
        cep: profile?.cep || prev.cep,
        street: profile?.address || prev.street,
        profilePictureUrl: profile?.photo
          ? profile.photo.startsWith("http")
            ? profile.photo
            : `${API_BASE_URL}${profile.photo}`
          : prev.profilePictureUrl,
      }));

      alert("Foto de perfil atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar foto:", err.response || err);
      alert("Não foi possível salvar sua foto de perfil. Tente novamente.");
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setCepError(null);

    const {
      street,
      number,
      neighborhood,
      city,
      state,
      complement,
      cep,
      fullName,
      phone,
    } = profileData;

    const addressParts = [];
    if (street) addressParts.push(street);
    if (number) addressParts.push(`Nº ${number}`);
    if (neighborhood) addressParts.push(neighborhood);
    if (city || state) {
      addressParts.push(`${city || ""}${state ? "/" + state : ""}`);
    }
    if (complement) addressParts.push(complement);

    const composedAddress = addressParts.join(" - ");

    const payload = {
      is_professional: userRole === "Profissional",
      profile: {
        full_name: fullName,
        phone_number: phone,
        cep: cep,
        address: composedAddress,
      },
    };

    try {
      const resp = await axios.patch("/api/v1/accounts/perfil/me/", payload);
      const { email, is_professional, profile } = resp.data || {};

      setProfileData((prev) => ({
        ...prev,
        fullName: profile?.full_name || prev.fullName,
        email: email || prev.email,
        phone: profile?.phone_number || prev.phone,
        cep: profile?.cep || prev.cep,
        street: profile?.address || prev.street,
      }));

      if (typeof setUserRole === "function") {
        setUserRole(is_professional ? "Profissional" : "Cliente");
      }

      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err.response || err);
      alert("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      console.error("Função de logout não está disponível no AuthContext.");
    }
  };

  const toggleRole = () => {
    const newRole = userRole === "Profissional" ? "Cliente" : "Profissional";
    if (typeof setUserRole !== "function") {
      console.error(
        "ERRO CRÍTICO: A função setUserRole não está disponível no contexto."
      );
      return;
    }
    setUserRole(newRole);
  };

  const nextRole = userRole === "Profissional" ? "Cliente" : "Profissional";
  const currentRoleIcon =
    userRole === "Profissional" ? (
      <Briefcase size={20} className="me-2" />
    ) : (
      <User size={20} className="me-2" />
    );

  if (loadingProfile) {
    return (
      <Container className="my-5 d-flex justify-content-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1
        className="mb-4 d-flex align-items-center"
        style={{ color: "var(--primary-color)" }}
      >
        <Settings size={32} className="me-2" /> Gerenciamento de Perfil
      </h1>

      {loadError && (
        <Alert variant="danger" className="mb-4">
          {loadError}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          {/* FOTO DE PERFIL */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="d-flex align-items-center">
              <img
                src={profileData.profilePictureUrl || DEFAULT_AVATAR}
                alt="Foto de Perfil"
                className="rounded-circle me-4"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  border: "2px solid #007bff",
                }}
              />
              <div>
                <h5 className="mb-1">
                  {profileData.fullName || profileData.email || "Usuário"}
                </h5>
                <label
                  htmlFor="profile-picture-upload"
                  className="btn btn-outline-primary btn-sm mt-1"
                >
                  <Camera size={16} className="me-1" /> Alterar Foto
                </label>
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  style={{ display: "none" }}
                />
              </div>
            </Card.Body>
          </Card>

          {/* CARD DE INFORMAÇÕES BÁSICAS */}
          <Card className="shadow-sm mb-4">
            <Card.Header
              className="fw-bold bg-light d-flex justify-content-between align-items-center"
              style={{ color: "var(--dark-text)", cursor: "pointer" }}
              onClick={() => setIsInfoCollapsed(!isInfoCollapsed)}
              aria-controls="info-collapse-body"
              aria-expanded={!isInfoCollapsed}
            >
              Informações da Conta e Endereço
              {isInfoCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </Card.Header>

            <Collapse in={!isInfoCollapsed}>
              <div id="info-collapse-body">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <h5 className="mb-3 text-muted">Dados Pessoais</h5>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Nome Completo</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label>Email</Form.Label>
                        <div className="d-flex flex-column">
                          <Form.Control
                            readOnly
                            plaintext
                            value={profileData.email}
                            className="fw-bold"
                          />
                          <small className="text-danger mt-1">
                            Este é seu login principal e não pode ser
                            alterado.
                          </small>
                        </div>
                      </Col>
                    </Row>
                    <Form.Group className="mb-4">
                      <Form.Label>Telefone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <hr />
                    <h5 className="mb-3 text-muted d-flex align-items-center">
                      <MapPin size={20} className="me-2" /> Endereço
                    </h5>

                    <Row className="mb-3">
                      <Col md={4}>
                        <Form.Label>CEP</Form.Label>
                        <Form.Control
                          type="text"
                          name="cep"
                          value={profileData.cep}
                          onChange={handleChange}
                          maxLength={9}
                          placeholder="Ex: 00000-000"
                          required
                        />
                      </Col>
                      <Col md={8} className="d-flex align-items-end">
                        {cepLoading && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2 text-primary"
                          />
                        )}
                        {cepError && (
                          <Alert
                            variant="danger"
                            className="py-1 px-2 small m-0"
                          >
                            {cepError}
                          </Alert>
                        )}
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={8}>
                        <Form.Label>Rua / Avenida</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          value={profileData.street}
                          onChange={handleChange}
                          disabled={cepLoading}
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Label>Bairro</Form.Label>
                        <Form.Control
                          type="text"
                          name="neighborhood"
                          value={profileData.neighborhood}
                          onChange={handleChange}
                          disabled={cepLoading}
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={4}>
                        <Form.Label>Cidade</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleChange}
                          disabled={cepLoading}
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label>Estado (UF)</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleChange}
                          maxLength={2}
                          disabled={cepLoading}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                          type="text"
                          name="number"
                          value={profileData.number}
                          onChange={handleChange}
                          placeholder="Obrigatório"
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Complemento (Opcional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="complement"
                          value={profileData.complement}
                          onChange={handleChange}
                          placeholder="Apto/Bloco"
                        />
                      </Col>
                    </Row>

                    <Button
                      variant="success"
                      type="submit"
                      disabled={isSaving || cepLoading}
                    >
                      {isSaving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </div>
            </Collapse>
          </Card>

          {!isUserProfessional && <MyDemandsSection />}

          {isUserProfessional && (
            <Card className="shadow-sm mb-4 border-success">
              <Card.Header className="fw-bold bg-success text-white">
                Configurações de Profissional
              </Card.Header>
              <Card.Body>
                <p>
                  Gerencie suas especialidades, preços e disponibilidade.
                </p>
                <Button
                  as={Link}
                  to={`/professional/${userId}`}
                  variant="outline-success"
                  className="me-2"
                >
                  Editar Portfólio
                </Button>
                <Button
                  as={Link}
                  to={`/professional/${userId}/schedule`}
                  variant="outline-success"
                >
                  Gerenciar Agenda
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="shadow-lg mb-4 text-center">
            <Card.Body>
              <h5 className="mb-3">Seu Papel Atual:</h5>
              <Alert
                variant={userRole === "Profissional" ? "info" : "warning"}
                className="fw-bold d-flex justify-content-center align-items-center"
              >
                {currentRoleIcon} {userRole}
              </Alert>
              <p className="small text-muted">
                Altere seu papel e depois clique em{" "}
                <strong>Salvar Alterações</strong> para aplicar.
              </p>
              <Button
                variant="primary"
                className="w-100 mt-2 fw-bold d-flex justify-content-center align-items-center"
                onClick={toggleRole}
              >
                <Repeat size={18} className="me-2" />
                Mudar para: {nextRole}
              </Button>
            </Card.Body>
          </Card>

          {!isUserProfessional && (
            <Card className="shadow-sm mb-4 border-info">
              <Card.Body className="d-grid gap-2">
                <Button
                  as={Link}
                  to="/profissionais-seguidos"
                  variant="outline-info"
                  className="fw-bold"
                >
                  <Heart size={20} className="me-2" /> Profissionais Seguidos
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-lg mb-4 border-success">
            <Card.Body className="d-grid gap-2">
              <Button
                as={Link}
                to="/chat"
                variant="success"
                className="fw-bold"
              >
                <MessageSquare size={20} className="me-2" /> Minhas Mensagens
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Header
              className="fw-bold bg-light"
              style={{ color: "var(--dark-text)" }}
            >
              Segurança
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button
                as={Link}
                to="/change-password"
                variant="danger"
                className="w-100"
              >
                Mudar Senha
              </Button>
              <Button
                variant="outline-danger"
                className="w-100 d-flex justify-content-center align-items-center mt-2 fw-bold"
                onClick={handleLogout}
              >
                <LogOut size={20} className="me-2" /> Sair da Conta
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileManagement;
