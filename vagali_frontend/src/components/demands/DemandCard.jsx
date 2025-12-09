// src/components/demands/DemandCard.jsx
import React from "react";
import { MapPin } from "lucide-react";
import "./demandsCard.css";

// 🔥 IMPORT CORRETO (utils fora de components)
import { demandIcons, DefaultIcon } from "../../utils/demandIcons";

const DemandCard = ({ demand }) => {
  const IconComponent =
    demandIcons[demand.type?.toLowerCase()] || DefaultIcon;

  return (
    <div className="demand-card">
      <div className="demand-header">
        <IconComponent size={22} className="demand-icon" />
        <h4>{demand.title}</h4>
      </div>

      <p className="demand-description">{demand.description}</p>

      <div className="demand-info">
        <span>
          <MapPin size={14} /> {demand.city}
        </span>
        <strong>{demand.budget}</strong>
      </div>

      <button className="demand-btn">Propor serviço</button>
    </div>
  );
};

export default DemandCard;
