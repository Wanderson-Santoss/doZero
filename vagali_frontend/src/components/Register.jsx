// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import axios from "axios";
import { PersonPlusFill } from "react-bootstrap-icons";
import { HelpCircle } from "lucide-react";
import Logo from "../assets/LOGOBRANCO.png"; // SUA LOGO

// 🔹 Opções de profissão com emoji
const PROFESSION_OPTIONS = [
  { label: "🧱 Pedreiro", value: "Pedreiro" },
  { label: "⚡ Eletricista", value: "Eletricista" },
  { label: "🚿 Encanador", value: "Encanador" },
  { label: "🎨 Pintor", value: "Pintor" },
  { label: "💇 Barbeiro", value: "Barbeiro" },
  { label: "💻 Técnico em Informática", value: "Técnico de Informática" },
  { label: "🌳 Jardineiro", value: "Jardineiro" },
  { label: "🚗 Motorista", value: "Motorista" },
  { label: "📚 Professor Particular", value: "Professor Particular" },
  { label: "🛠️ Outro", value: "Outro" },
];

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    is_professional: false,
    full_name: "",
    cpf: "",
    phone_number: "",
    bio: "",
    // antes "address" como cidade solta; agora usamos CEP + cidade/UF
    cep: "",
    city: "",
    state: "",
    cnpj: "",
    profession: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const REGISTER_URL = "/api/v1/accounts/cadastro/";

  // 🔹 Popover com vantagens do CNPJ
  const cnpjPopover = (
    <Popover id="popover-cnpj">
      <Popover.Header as="h3">Vantagens do CNPJ</Popover.Header>
      <Popover.Body>
        <ul className="mb-2">
          <li>Menor porcentagem por serviço;</li>
          <li>Perfil em vitrine de destaques;</li>
          <li>Mais visibilidade para seus serviços.</li>
        </ul>
        <hr />
        <small className="text-muted">
          Sem CNPJ o perfil não aparece como destaque.
        </small>
      </Popover.Body>
    </Popover>
  );

  // 🔹 Atualizar campos
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Máscara CNPJ
  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");

    setFormData((prev) => ({ ...prev, cnpj: value }));
  };

  // 🔹 Buscar CEP → cidade/UF
  const fetchCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const res = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );

      if (!res.data.erro) {
        setFormData((prev) => ({
          ...prev,
          city: res.data.localidade,
          state: res.data.uf,
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.password2) {
      setError("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // Se o backend ainda espera "address", você pode montar aqui:
      const payload = {
        ...formData,
        address:
          formData.city && formData.state
            ? `${formData.city}/${formData.state}`
            : "",
      };

      const response = await axios.post(REGISTER_URL, payload);
      if (response.status === 201) navigate("/login");
    } catch (err) {
      let msg = "Erro ao cadastrar.";

      if (err.response?.data) {
        const data = err.response.data;
        let list = [];
        for (const field in data) {
          list.push(`${field}: ${data[field]}`);
        }
        msg = list.join(" | ");
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f2f2f2" }}
    >
      <Row className="w-100" style={{ maxWidth: "1300px" }}>
        {/* ================================
            COLUNA ESQUERDA (LOGO + FRASE)
        ================================= */}
        <Col
          md={6}
          className="d-none d-md-flex flex-column justify-content-center align-items-center text-center"
          style={{
            background: "linear-gradient(135deg, #003d7a, #007bff)",
            borderRadius: "12px",
            padding: "40px",
            color: "white",
            animation: "fadeInLeft 0.6s ease",
          }}
        >
          {/* CARD DA LOGO */}
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "25px 35px",
              borderRadius: "14px",
              backdropFilter: "blur(6px)",
              boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={Logo}
              alt="Logo"
              style={{ width: "180px", height: "auto" }}
            />
          </div>

          <h3 className="fw-bold mt-4" style={{ fontSize: "28px" }}>
            Conectamos Profissionais e Clientes
          </h3>

          <p style={{ maxWidth: "80%", opacity: 0.9 }}>
            Cadastre-se agora e comece a usar nossa plataforma.
          </p>
        </Col>

        {/* ================================
            COLUNA DIREITA (FORMULÁRIO)
        ================================= */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center"
        >
          <Card
            className="p-4 shadow-lg border-0"
            style={{
              width: "90%",
              maxWidth: "520px",
              background: "#1c1f26",
              color: "white",
              borderRadius: "14px",
              animation: "fadeIn 0.7s ease",
            }}
          >
            <h2
              className="text-center mb-4 fw-bold"
              style={{ color: "#4da3ff" }}
            >
              <PersonPlusFill className="me-2" size={26} />
              Criar Conta no VagALI
            </h2>

            <Form onSubmit={handleRegister}>
              {/* NOME */}
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50">
                  Nome Completo
                </Form.Label>
                <Form.Control
                  type="text"
                  id="full_name"
                  placeholder="Seu nome completo"
                  className="form-control-dark"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* EMAIL */}
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50">E-mail</Form.Label>
                <Form.Control
                  type="email"
                  id="email"
                  placeholder="email@exemplo.com"
                  className="form-control-dark"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* CPF | TELEFONE */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">CPF</Form.Label>
                    <Form.Control
                      type="text"
                      id="cpf"
                      placeholder="00000000000"
                      maxLength={11}
                      className="form-control-dark"
                      value={formData.cpf}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">Telefone</Form.Label>
                    <Form.Control
                      type="tel"
                      id="phone_number"
                      placeholder="(00) 90000-0000"
                      className="form-control-dark"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* SENHA | CONFIRMAÇÃO */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">Senha</Form.Label>
                    <Form.Control
                      type="password"
                      id="password"
                      placeholder="Mínimo 6 caracteres"
                      className="form-control-dark"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">
                      Confirmar Senha
                    </Form.Label>
                    <Form.Control
                      type="password"
                      id="password2"
                      placeholder="Repita a senha"
                      className="form-control-dark"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* CHECKBOX PROFISSIONAL */}
              <Form.Group className="mb-4 mt-2">
                <Form.Check
                  type="checkbox"
                  id="is_professional"
                  className="text-white-50"
                  label="Sou um profissional e quero oferecer meus serviços"
                  checked={formData.is_professional}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* CAMPOS PROFISSIONAIS */}
              {formData.is_professional && (
                <div className="border-top border-secondary pt-3">
                  <p className="text-center text-white-50 fw-bold small mb-3">
                    Informações Profissionais
                  </p>

                  {/* BIO */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      id="bio"
                      rows={3}
                      placeholder="Conte um pouco sobre sua experiência..."
                      className="form-control-dark"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* PROFISSÃO */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50">
                      Profissão principal
                    </Form.Label>
                    <Form.Select
                      id="profession"
                      className="form-control-dark"
                      value={formData.profession}
                      onChange={handleChange}
                    >
                      <option value="">Selecione...</option>
                      {PROFESSION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* CEP / CIDADE / UF */}
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">CEP</Form.Label>
                        <Form.Control
                          type="text"
                          id="cep"
                          placeholder="00000-000"
                          maxLength={9}
                          className="form-control-dark"
                          value={formData.cep}
                          onChange={(e) => {
                            handleChange(e);
                            fetchCep(e.target.value);
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">
                          Cidade
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="city"
                          className="form-control-dark"
                          value={formData.city}
                          disabled
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">UF</Form.Label>
                        <Form.Control
                          type="text"
                          id="state"
                          className="form-control-dark"
                          value={formData.state}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* CNPJ + POPUP INFO */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-white-50 d-flex align-items-center">
                          CNPJ (Opcional)
                          <OverlayTrigger
                            trigger="click"
                            placement="right"
                            overlay={cnpjPopover}
                            rootClose
                          >
                            <span
                              className="ms-2"
                              style={{ cursor: "pointer", color: "#4da3ff" }}
                            >
                              <HelpCircle size={18} />
                            </span>
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          className="form-control-dark"
                          value={formData.cnpj}
                          onChange={handleCnpjChange}
                          maxLength={18}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              {error && (
                <Alert
                  variant="danger"
                  className="mt-3 text-center p-2 small"
                >
                  {error}
                </Alert>
              )}

              {/* BOTÕES */}
              <div className="d-flex gap-2 mt-4">
                <Button
                  type="submit"
                  className="flex-grow-1 fw-bold py-2"
                  style={{
                    backgroundColor: "#4da3ff",
                    borderColor: "#4da3ff",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Cadastrar"
                  )}
                </Button>

                <Button
                  variant="secondary"
                  className="flex-grow-1 fw-bold py-2"
                  onClick={() => navigate("/login")}
                >
                  Voltar
                </Button>
              </div>

              <p className="text-center small text-white-50 mt-3">
                Já tem conta?{" "}
                <Link to="/login" style={{ color: "#4da3ff" }}>
                  Faça login
                </Link>
              </p>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* ANIMAÇÕES */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Container>
  );
}

export default Register;
