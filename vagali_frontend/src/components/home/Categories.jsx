// src/components/home/Categories.jsx
import React from "react";
import { motion } from "framer-motion";
import { Wrench, Paintbrush, Home, Car, Scissors, Dog } from "lucide-react";
import "./categories.css";

const categoriesList = [
  { name: "Consertos", icon: <Wrench size={32} />, search: "conserto" },
  { name: "Beleza", icon: <Scissors size={32} />, search: "cabelo beleza estética" },
  { name: "Doméstico", icon: <Home size={32} />, search: "faxina diarista limpeza" },
  { name: "Automotivo", icon: <Car size={32} />, search: "carro mecanico auto" },
  { name: "Pets", icon: <Dog size={32} />, search: "pet cachorro gato banho tosa" },
  { name: "Pintura", icon: <Paintbrush size={32} />, search: "pintor pintura parede" },
];

const Categories = ({ onSelectCategory }) => {
  const handleClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat.search || cat.name);
    }
  };

  return (
    <div className="categories-wrapper">
      <h2 className="categories-title">Categorias Populares</h2>

      <div className="categories-container">
        {categoriesList.map((cat, index) => (
          <motion.button
            key={cat.name}
            type="button"
            className="category-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            onClick={() => handleClick(cat)}
          >
            <div className="category-icon">{cat.icon}</div>
            <p className="category-name">{cat.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
