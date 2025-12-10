// src/components/Login.jsx
import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
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
      let message =
        "Credenciais inválidas. Verifique seu e-mail e senha.";

      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      }

      setError(message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f2f2f2" }}
    >
      <Row className="w-100" style={{ maxWidth: "1300px" }}>
        {/* ==========================
            COLUNA ESQUERDA (BRANDING)
        =========================== */}
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
              src={LogoBranco}
              alt="Logo"
              style={{ width: "180px", height: "auto" }}
            />
          </div>

          <h3 className="fw-bold mt-4" style={{ fontSize: "28px" }}>
            Bem-vindo de volta
          </h3>

          <p style={{ maxWidth: "80%", opacity: 0.9 }}>
            Entre na sua conta e continue usando a plataforma VagALI.
          </p>
        </Col>

        {/* ==========================
            COLUNA DIREITA (FORM)
        =========================== */}
        <Col md={6} className="d-flex align-items-center justify-content-center">
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
              Entrar no VagALI
            </h2>

            {error && (
              <Alert variant="danger" className="p-2 small">
                {error}
              </Alert>
            )}

            {(authLoading || loadingSubmit) && (
              <div className="text-center mb-3 small">
                <Spinner animation="border" size="sm" className="me-1" />
                Verificando seus dados...
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50">E-mail</Form.Label>
                <div
                  className="d-flex align-items-center rounded px-2"
                  style={{ background: "#1b212b" }}
                >
                  <Mail size={18} className="text-primary me-2" />
                  <Form.Control
                    type="email"
                    className="form-control-dark border-0"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>

              {/* SENHA */}
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50">Senha</Form.Label>
                <div
                  className="d-flex align-items-center rounded px-2"
                  style={{ background: "#1b212b" }}
                >
                  <Lock size={18} className="text-primary me-2" />
                  <Form.Control
                    type="password"
                    className="form-control-dark border-0"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>

              <div className="d-flex justify-content-end mb-3">
                <Link to="/forgot-password" className="link-blue small">
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-100 fw-bold py-2"
                style={{
                  backgroundColor: "#4da3ff",
                  borderColor: "#4da3ff",
                }}
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
              <Link to="/register" style={{ color: "#4da3ff" }}>
                Cadastre-se
              </Link>
            </p>
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
};

export default Login;
