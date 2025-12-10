import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert
} from "react-bootstrap";
import { Briefcase, BadgeCheck } from "lucide-react";
import { PROFESSIONS } from "../utils/professions";

const BecomeProfessionalModal = ({
  show,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(1);
  const [hasCnpj, setHasCnpj] = useState(null);
  const [cnpj, setCnpj] = useState("");
  const [profession, setProfession] = useState("");

  // 🔁 sempre que abrir o modal, resetar tudo
  useEffect(() => {
    if (show) {
      setStep(1);
      setHasCnpj(null);
      setCnpj("");
      setProfession("");
    }
  }, [show]);

  const canGoNextStep1 = true;
  const canGoNextStep2 = hasCnpj !== null;
  const canFinish =
    profession &&
    (hasCnpj === false || (hasCnpj === true && cnpj.length >= 11));

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Briefcase className="me-2" />
          Tornar-se Profissional
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <p>
              Deseja se tornar <strong>profissional</strong> na plataforma?
            </p>

            <Alert variant="info">
              Você pode voltar a ser cliente a qualquer momento.
            </Alert>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            <p>
              Você possui <strong>CNPJ (MEI)</strong>?
            </p>

            <Alert variant="success" className="d-flex align-items-center">
              <BadgeCheck className="me-2" />
              Profissionais com MEI têm destaque e menor taxa.
            </Alert>

            <Form.Check
              type="radio"
              id="cnpj-sim"
              label="Sim, possuo CNPJ"
              className="mb-2"
              checked={hasCnpj === true}
              onChange={() => setHasCnpj(true)}
            />

            <Form.Check
              type="radio"
              id="cnpj-nao"
              label="Não possuo CNPJ"
              checked={hasCnpj === false}
              onChange={() => setHasCnpj(false)}
            />

            {hasCnpj === true && (
              <Form.Control
                className="mt-3"
                placeholder="Digite seu CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            )}
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <>
            <p>Selecione sua profissão principal:</p>

            <Row>
              {PROFESSIONS.map((item) => (
                <Col xs={6} md={4} key={item.label} className="mb-2">
                  <Button
                    variant={
                      profession === item.label
                        ? "primary"
                        : "outline-primary"
                    }
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => setProfession(item.label)}
                  >
                    {item.icon}
                    <span className="ms-2">{item.label}</span>
                  </Button>
                </Col>
              ))}
            </Row>

            {profession && (
              <Alert variant="info" className="mt-3">
                Profissão selecionada: <strong>{profession}</strong>
              </Alert>
            )}
          </>
        )}

      </Modal.Body>

      <Modal.Footer>
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        )}

        {step === 1 && (
          <Button
            variant="primary"
            onClick={() => setStep(2)}
            disabled={!canGoNextStep1}
          >
            Continuar
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="primary"
            onClick={() => setStep(3)}
            disabled={!canGoNextStep2}
          >
            Continuar
          </Button>
        )}

        {step === 3 && (
          <Button
            variant="success"
            disabled={!canFinish}
            onClick={() =>
              onConfirm({
                hasCnpj,
                cnpj: hasCnpj ? cnpj : "",
                profession,
              })
            }
          >
            Editar meu portfólio
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BecomeProfessionalModal;
