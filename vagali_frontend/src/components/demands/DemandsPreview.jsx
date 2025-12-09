// src/components/demands/DemandsPreview.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import DemandCard from "./DemandCard";
import "./demandsCard.css";

const DemandsPreview = () => {
  const navigate = useNavigate();

  // ✅ MOCK (depois liga no backend)
  const demands = [
    {
      id: 1,
      title: "Serviço de pintor",
      description: "Pintura da sala e cozinha",
      city: "Belo Horizonte - MG",
      budget: "Valor a negociar",
      type: "pintura",
    },
    {
      id: 2,
      title: "Eletricista urgente",
      description: "Tomadas sem energia no quarto",
      city: "Rio de Janeiro - RJ",
      budget: "R$ 200",
      type: "eletricista",
    },
    {
      id: 3,
      title: "Limpeza de casa",
      description: "Limpeza completa para mudança",
      city: "São Paulo - SP",
      budget: "R$ 150",
      type: "limpeza",
    },
    {
      id: 4,
      title: "Montagem de móveis",
      description: "Guarda-roupa e rack",
      city: "Curitiba - PR",
      budget: "R$ 180",
      type: "montagem",
    },
  ];

  return (
    <section className="demands-section">
      <div className="demands-header">
        <h2>Demandas recentes</h2>
        <button onClick={() => navigate("/demandas")}>
          Ver todas
        </button>
      </div>

      <div className="demands-grid">
        {demands.map((demand) => (
          <DemandCard key={demand.id} demand={demand} />
        ))}
      </div>
    </section>
  );
};

export default DemandsPreview;
