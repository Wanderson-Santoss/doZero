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
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { HelpCircle } from "lucide-react";
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

// opções prontas de profissão
const PROFESSION_OPTIONS = [
  "Pedreiro",
  "Carpinteiro",
  "Barbeiro",
  "Eletricista",
  "Encanador",
  "Pintor",
  "Marceneiro",
  "Jardineiro",
  "Manicure / Pedicure",
  "Cabeleireiro",
  "Técnico de Informática",
  "Professor Particular",
  "Cuidador(a)",
  "Motorista",
  "Outra profissão",
];

const ProfileManagement = () => {
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);

  const { userRole, setUserRole, isUserProfessional, userId, logout } =
    useAuth();

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
    profession: "",
    cnpj: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState(null);

  // -------------------- CNPJ HELP --------------------

// Popover com informações
const cnpjPopover = (
  <Popover id="cnpj-popover">
    <Popover.Header as="h6">Vantagens do CNPJ</Popover.Header>
    <Popover.Body>
      ✔ Taxas menores por serviço <br />
      ✔ Perfil em destaque na vitrine <br />
      
      <hr className="my-2" />
      Sem CNPJ, o perfil <strong>não aparece como destaque</strong>.
    </Popover.Body>
  </Popover>
);

// Máscara de CNPJ
const formatCnpj = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

// Handler exclusivo do CNPJ
const handleChangeCnpj = (e) => {
  setProfileData((prev) => ({
    ...prev,
    cnpj: formatCnpj(e.target.value),
  }));
};


  useEffect(() => {
    if (!window.bootstrap) return;

    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.forEach((el) => {
      new window.bootstrap.Tooltip(el);
    });
  }, [userRole]);
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

  // carrega o perfil 1x
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setLoadError(null);
      try {
        const resp = await axios.get("/api/v1/accounts/perfil/me/");
        const { email, is_professional, profile } = resp.data || {};

        setProfileData((prev) => ({
          ...prev,
          fullName: profile?.full_name || "",
          email: email || "",
          phone: profile?.phone_number || "",
          cep: profile?.cep || "",
          street: profile?.address || "",
          profilePictureUrl: profile?.photo
            ? profile.photo.startsWith("http")
              ? profile.photo
              : `${API_BASE_URL}${profile.photo}`
            : DEFAULT_AVATAR,
          profession: profile?.profession || "",
          cnpj: profile?.cnpj ? formatCnpj(profile.cnpj) : "",
        }));

        // opcional: alinhar papel do contexto ao backend
        if (typeof setUserRole === "function") {
          setUserRole(is_professional ? "Profissional" : "Cliente");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err.response || err);
        setLoadError("Não foi possível carregar seus dados de perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []); // só uma vez

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
      profession,
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
        profession: profession,
        cnpj: profileData.cnpj
          ? profileData.cnpj.replace(/\D/g, "")
          : null,
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
        profession: profile?.profession || prev.profession,
        cnpj: profile?.cnpj ? formatCnpj(profile.cnpj) : "",
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
                    {/* DADOS PESSOAIS */}
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
                            Este é seu login principal e não pode ser alterado.
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

                    {/* 🔴 INFORMAÇÕES PROFISSIONAIS (apenas se papel = Profissional) */}
                    {userRole === "Profissional" && (
                      <>
                        <hr />
                        <h5 className="mb-3 text-muted d-flex align-items-center">
                          <Briefcase size={20} className="me-2" /> Informações profissionais
                        </h5>

                        {/* PROFISSÃO */}
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Label>Profissão principal</Form.Label>
                            <Form.Select
                              name="profession"
                              value={profileData.profession}
                              onChange={handleChange}
                            >
                              <option value="">Selecione...</option>
                              {PROFESSION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </Form.Select>
                          </Col>


                          {/* CNPJ */}
                          <Col md={6}>
                            <Form.Label className="d-flex align-items-center">
                              CNPJ (opcional)

                              <OverlayTrigger
                                trigger="click"
                                placement="right"
                                overlay={cnpjPopover}
                                rootClose
                              >
                                <span className="ms-2 text-primary" style={{ cursor: "pointer" }}>
                                  <HelpCircle size={18} />
                                </span>
                              </OverlayTrigger>
                            </Form.Label>

                            <Form.Control
                              type="text"
                              name="cnpj"
                              placeholder="00.000.000/0000-00"
                              value={profileData.cnpj}
                              onChange={handleChangeCnpj}
                              maxLength={18}
                            />
                          </Col>


                        </Row>
                      </>
                    )}


                    {/* ENDEREÇO */}
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
          {/* PAPEL ATUAL */}
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
                onClick={async () => {
                  if (userRole === "Cliente") {
                    try {
                      // 1️⃣ Vira profissional no backend
                      await axios.patch("/api/v1/accounts/perfil/me/", {
                        is_professional: true,
                      });

                      // 2️⃣ Atualiza contexto
                      setUserRole("Profissional");

                      // 3️⃣ NÃO vai pro perfil público
                      // Fica na tela para editar dados
                      alert(
                        "Agora complete seu perfil profissional (profissão, endereço, etc) antes de aparecer publicamente."
                      );
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao mudar para profissional.");
                    }
                  } else {
                    toggleRole();
                  }
                }}
              >
                <Repeat size={18} className="me-2" />
                Mudar para: {nextRole}
              </Button>

            </Card.Body>
          </Card>

          {/* MENSAGENS */}
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

          {/* 🔴 NOVO: SEGUINDO */}
          <Card className="shadow-sm mb-4 border-info">
            <Card.Body className="d-grid gap-2">
              <Button
                as={Link}
                to="/profissionais-seguidos"
                variant="outline-info"
                className="fw-bold"
              >
                <Heart size={20} className="me-2" /> Seguindo
              </Button>
            </Card.Body>
          </Card>

          {/* SEGURANÇA */}
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