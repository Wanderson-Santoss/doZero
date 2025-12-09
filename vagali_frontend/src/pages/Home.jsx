// src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import Categories from "../components/home/Categories";
import ProfessionalsCarousel from "../components/home/ProfessionalsCarousel";
import FilterBar from "../components/home/FilterBar";
import DemandsPreview from "../components/demands/DemandsPreview";

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
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = useMemo(() => {
    let list = [...professionals];

    if (filters.city) {
      list = list.filter((p) =>
        (p.address || "").toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.ratingMin > 0) {
      list = list.filter(
        (p) => parseFloat(p.rating ?? 0) >= filters.ratingMin
      );
    }

    return list;
  }, [professionals, filters]);

  return (
    <div style={{ backgroundColor: "#f0f4ff", minHeight: "100vh" }}>
      <Hero />

      <SearchBar onSearch={fetchProfessionals} />
      <Categories onSelectCategory={fetchProfessionals} />
      <FilterBar filters={filters} onChange={setFilters} />



      <motion.div style={{ marginTop: "40px" }}>
        <ProfessionalsCarousel
          professionals={filteredProfessionals}
          loading={loading}
        />
      </motion.div>

      {/* DEMANDAS */}
      <DemandsPreview />
    </div>
  );
};

export default Home;
