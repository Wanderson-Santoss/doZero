// src/components/home/Categories.jsx
import React, { useState } from "react";
import {
  Hammer,
  PlugZap,
  ShowerHead,
  PaintRoller,
  Trees,
  Scissors,
  MonitorSmartphone,
  GraduationCap,
  HeartHandshake,
  CarFront,
  UserRound,
  MoreHorizontal,
} from "lucide-react";
import "./categories.css"; // se você já tiver um CSS, mantemos

// mesmas profissões que usamos em Minha Conta
const ALL_PROFESSIONS = [
  {
    key: "pedreiro",
    label: "Pedreiro",
    icon: Hammer,
    searchTerm: "Pedreiro",
  },
  {
    key: "carpinteiro",
    label: "Carpinteiro",
    icon: Hammer,
    searchTerm: "Carpinteiro",
  },
  {
    key: "barbeiro",
    label: "Barbeiro",
    icon: Scissors,
    searchTerm: "Barbeiro",
  },
  {
    key: "eletricista",
    label: "Eletricista",
    icon: PlugZap,
    searchTerm: "Eletricista",
  },
  {
    key: "encanador",
    label: "Encanador",
    icon: ShowerHead,
    searchTerm: "Encanador",
  },
  {
    key: "pintor",
    label: "Pintor",
    icon: PaintRoller,
    searchTerm: "Pintor",
  },
  {
    key: "marceneiro",
    label: "Marceneiro",
    icon: Hammer,
    searchTerm: "Marceneiro",
  },
  {
    key: "jardineiro",
    label: "Jardineiro",
    icon: Trees,
    searchTerm: "Jardineiro",
  },
  {
    key: "manicure",
    label: "Manicure / Pedicure",
    icon: Scissors,
    searchTerm: "Manicure",
  },
  {
    key: "cabeleireiro",
    label: "Cabeleireiro",
    icon: Scissors,
    searchTerm: "Cabeleireiro",
  },
  {
    key: "tecnico-informatica",
    label: "Técnico de Informática",
    icon: MonitorSmartphone,
    searchTerm: "Técnico de Informática",
  },
  {
    key: "prof-particular",
    label: "Professor Particular",
    icon: GraduationCap,
    searchTerm: "Professor Particular",
  },
  {
    key: "cuidador",
    label: "Cuidador(a)",
    icon: HeartHandshake,
    searchTerm: "Cuidador",
  },
  {
    key: "motorista",
    label: "Motorista",
    icon: CarFront,
    searchTerm: "Motorista",
  },
  {
    key: "outros",
    label: "Outros serviços",
    icon: UserRound,
    searchTerm: "",
  },
];

// algumas categorias em destaque na grade principal
const HIGHLIGHTED_KEYS = [
  "pedreiro",
  "eletricista",
  "encanador",
  "pintor",
  "jardineiro",
  "cabeleireiro",
  "manicure",
  "tecnico-informatica",
];

const Categories = ({ onSelectCategory }) => {
  const [showMore, setShowMore] = useState(false);

  const highlighted = ALL_PROFESSIONS.filter((p) =>
    HIGHLIGHTED_KEYS.includes(p.key)
  );
  const others = ALL_PROFESSIONS.filter(
    (p) => !HIGHLIGHTED_KEYS.includes(p.key)
  );

  const handleClick = (prof) => {
    if (!onSelectCategory) return;
    const term = prof.searchTerm || prof.label;
    onSelectCategory(term);
  };

  return (
    <section className="home-section categories-section">
      <div className="categories-header">
        <h2>Encontre o profissional ideal</h2>
        <p>Escolha uma categoria para ver profissionais perto de você.</p>
      </div>

      {/* grade principal */}
      <div className="categories-grid">
        {highlighted.map((prof) => {
          const Icon = prof.icon;
          return (
            <button
              key={prof.key}
              type="button"
              className="category-card"
              onClick={() => handleClick(prof)}
            >
              <div className="category-icon-wrapper">
                <Icon size={24} />
              </div>
              <span className="category-label">{prof.label}</span>
            </button>
          );
        })}

        {/* card "Mais serviços" */}
        <button
          type="button"
          className="category-card more-card"
          onClick={() => setShowMore((prev) => !prev)}
        >
          <div className="category-icon-wrapper">
            <MoreHorizontal size={24} />
          </div>
          <span className="category-label">
            {showMore ? "Fechar" : "Mais serviços"}
          </span>
        </button>
      </div>

      {/* menu cascata com todas as opções */}
      {showMore && (
        <div className="categories-more-panel">
          <p className="more-title">Todos os tipos de serviços</p>
          <div className="more-grid">
            {ALL_PROFESSIONS.map((prof) => {
              const Icon = prof.icon;
              return (
                <button
                  key={prof.key}
                  type="button"
                  className="more-item"
                  onClick={() => handleClick(prof)}
                >
                  <Icon size={18} className="more-icon" />
                  <span className="more-label">{prof.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Categories;
