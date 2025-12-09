// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import LogoBranco from "../assets/LOGOBRANCO.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);

  // Se já estiver autenticado, manda pro perfil
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/meu-perfil");
    }
  }, [isAuthenticated, navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoadingSubmit(true);

  try {
    await login(email, password);
    navigate("/meu-perfil");
  } catch (err) {
    console.error("Erro no login (front):", err.response || err);

    let message = "Credenciais inválidas. Verifique e tente novamente.";

    if (err.response && err.response.data) {
      const data = err.response.data;

      // casos comuns do DRF/Djoser
      if (data.detail) {
        message = data.detail;
      } else if (data.non_field_errors && data.non_field_errors.length > 0) {
        message = data.non_field_errors.join(" ");
      } else {
        // junta todas as mensagens de campo num texto só
        const msgs = [];
        for (const field in data) {
          if (Array.isArray(data[field])) {
            msgs.push(`${field}: ${data[field].join(" ")}`);
          } else {
            msgs.push(`${field}: ${data[field]}`);
          }
        }
        if (msgs.length > 0) {
          message = msgs.join(" | ");
        }
      }
    }

    setError(message);
  } finally {
    setLoadingSubmit(false);
  }
};


  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f2f2f2" }}
    >
      <Card
        className="p-4 shadow-lg card-login fade-in text-white"
        style={{ maxWidth: "440px", width: "100%" }}
      >
        {/* LOGO */}
        <div className="d-flex justify-content-center mb-3">
          <img src={LogoBranco} alt="logo" style={{ width: 70, height: 70 }} />
        </div>

        <h2 className="text-center mb-3 fw-bold" style={{ color: "#0d6efd" }}>
          Entrar no VagALI
        </h2>

        {error && (
          <Alert variant="danger" className="p-2 small mt-2">
            {error}
          </Alert>
        )}

        {(authLoading || loadingSubmit) && (
          <div className="text-center mb-2 small">
            <Spinner animation="border" size="sm" className="me-1" />
            Verificando seus dados...
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {/* E-MAIL */}
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="small">E-mail</Form.Label>
            <div
              className="d-flex align-items-center rounded px-2"
              style={{ background: "#1b212b" }}
            >
              <Mail size={18} className="text-primary me-2" />
              <Form.Control
                type="email"
                className="form-control-custom border-0"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </Form.Group>

          {/* SENHA */}
          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="small">Senha</Form.Label>
            <div
              className="d-flex align-items-center rounded px-2"
              style={{ background: "#1b212b" }}
            >
              <Lock size={18} className="text-primary me-2" />
              <Form.Control
                type="password"
                className="form-control-custom border-0"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </Form.Group>

          {/* LINK ESQUECEU A SENHA */}
          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="link-blue small">
              Esqueceu sua senha?
            </Link>
          </div>

          {/* BOTÃO LOGIN */}
          <Button
            type="submit"
            className="w-100 fw-bold py-2"
            variant="primary"
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Entrar"
            )}
          </Button>
        </Form>

        <p className="text-center small text-white-50 mt-4">
          Ainda não tem conta?{" "}
          <Link to="/register" className="link-blue fw-bold">
            Cadastre-se aqui
          </Link>
        </p>
      </Card>
    </Container>
  );
};

export default Login;
