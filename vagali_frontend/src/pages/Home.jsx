// src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import Categories from "../components/home/Categories";
import ProfessionalsCarousel from "../components/home/ProfessionalsCarousel";
import FilterBar from "../components/home/FilterBar";

const PROFESSIONALS_URL = "/api/v1/accounts/profissionais/";

const Home = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    ratingMin: 0,
    sort: "relevance",
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async (search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(PROFESSIONALS_URL, {
        params: search ? { search } : {},
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results ?? [];

      setProfessionals(data);
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value) return;

    if (typeof value === "object" && value.id) {
      setProfessionals([value]);
      return;
    }

    if (typeof value === "string") {
      fetchProfessionals(value);
    }
  };

  // 🧠 Aqui aplicamos os filtros em cima da lista vinda do backend
  const filteredProfessionals = useMemo(() => {
    let list = [...professionals];

    // filtro por cidade
    if (filters.city) {
      const cityLower = filters.city.toLowerCase();
      list = list.filter((p) =>
        (p.address || "").toLowerCase().includes(cityLower)
      );
    }

    // filtro por rating mínima
    if (filters.ratingMin && filters.ratingMin > 0) {
      list = list.filter((p) => {
        const rating = parseFloat(p.rating ?? 0);
        return rating >= filters.ratingMin;
      });
    }

    // ordenação
    if (filters.sort === "rating") {
      list.sort((a, b) => {
        const ra = parseFloat(a.rating ?? 0);
        const rb = parseFloat(b.rating ?? 0);
        return rb - ra;
      });
    }

    return list;
  }, [professionals, filters]);

  return (
    <div style={{ backgroundColor: "#f0f4ff", minHeight: "100vh" }}>
      <Hero />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Categories onSelectCategory={handleSearch} />
      </motion.div>

      {/* 🎯 NOVO: barra de filtro avançado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FilterBar filters={filters} onChange={setFilters} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        style={{ marginTop: "40px" }}
      >
        <ProfessionalsCarousel
          professionals={filteredProfessionals}
          loading={loading}
        />
      </motion.div>
    </div>
  );
};

export default Home;
