import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import "./searchbar.css";

const PROFESSIONALS_SEARCH_URL = "/api/v1/accounts/profissionais/"; // usa o SearchFilter do backend

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // fecha o dropdown quando clicar fora
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // debounce: espera 350ms depois da última tecla
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      // esvazia sugestões para queries muito curtas
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchSuggestions = async (q) => {
    setLoading(true);
    try {
      // O backend tem SearchFilter; passamos ?search=
      const resp = await axios.get(PROFESSIONALS_SEARCH_URL, {
        params: { search: q, page_size: 6 }, // page_size se seu backend suportar (opcional)
      });

      // espera um array de profissionais (ProfessionalSerializer)
      const items = Array.isArray(resp.data) ? resp.data : resp.data.results ?? [];
      setSuggestions(items.slice(0, 6));
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.full_name || item.email);
    setOpen(false);
    setActiveIndex(-1);
    if (onSearch) onSearch(item);
    // navegar para o perfil poderia ser feito aqui (window.location = `/perfil/${item.id}`)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    if (onSearch) onSearch(query);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        // se não houver seleção, dispara busca geral
        if (onSearch) onSearch(query);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <motion.div
      className="searchbar-container"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      viewport={{ once: true }}
      ref={containerRef}
    >
      <form className="searchbar-box" onSubmit={handleSubmit} role="search" aria-label="Buscar profissionais">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar profissionais, serviços ou categorias..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
        />

        <button type="submit" className="search-btn" aria-label="Buscar">
          Buscar
        </button>
      </form>

      {/* DROPDOWN DE SUGESTÕES */}
      {open && (
        <div className="suggestions-dropdown" id="search-suggestions" role="listbox">
          {loading && <div className="suggestion-item loading">Buscando...</div>}

          {!loading && suggestions.length === 0 && (
            <div className="suggestion-item empty">Nenhum resultado</div>
          )}

          {!loading && suggestions.map((s, i) => (
            <div
              key={s.id || `${s.email}-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              className={`suggestion-item ${activeIndex === i ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
              onMouseDown={(ev) => { ev.preventDefault(); handleSelect(s); }} // onMouseDown para evitar perda de foco antes do click
            >
              <div className="suggestion-left">
                <img
                  src={s.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt={s.full_name || s.email}
                  className="suggestion-avatar"
                />
              </div>
              <div className="suggestion-body">
                <div className="suggestion-name">{s.full_name || s.email}</div>
                {s.address && <div className="suggestion-meta">{s.address}</div>}
                {s.bio && <div className="suggestion-bio">{s.bio}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SearchBar;
