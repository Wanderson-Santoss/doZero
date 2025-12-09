// src/components/ProfessionalProfileView.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Star,
  MapPin,
  Mail,
  MessageCircle,
  Briefcase,
  Share2,
  Heart,
  Calendar,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./professionalProfile.css";
import { useAuth } from "./AuthContext";

const PROFESSIONALS_URL = "/api/v1/accounts/profissionais/";

const ProfessionalProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // paginação portfólio
  const [portfolioPage, setPortfolioPage] = useState(1);
  const ITEMS_PER_PAGE = 9; // 3x3

  // controle de colapso das seções
  const [sectionsOpen, setSectionsOpen] = useState({
    about: true,
    portfolio: true,
    info: true,
    feedbacks: true,
  });

  const toggleSection = (key) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!id) return;
    const fetchProfessional = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get(`${PROFESSIONALS_URL}${id}/`);
        setProfessional(resp.data);
      } catch (err) {
        console.error("Erro ao carregar profissional:", err);
        setError("Não foi possível carregar o perfil deste profissional.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [id]);

  const rating = useMemo(() => {
    if (!professional) return 0;
    return parseFloat(professional.rating ?? 0);
  }, [professional]);

  const ratingFormatted = rating.toFixed(1);

  // Satisfação aproximada (rating * 20)
  const satisfaction = useMemo(() => {
    if (!professional) return 0;
    const pct = Math.max(0, Math.min(100, rating * 20));
    return Math.round(pct);
  }, [rating, professional]);

  // número real vindo da API (ideal): professional.demands_count
  const demandsCount = professional?.demands_count ?? 0;

  const statusLabel = "Ativo"; // no futuro pode vir do backend

  // Profissão: no futuro virá de um campo próprio; por enquanto, fallback
  const professionLabel =
    professional?.profession ||
    (professional?.palavras_chave
      ? professional.palavras_chave.split(",")[0]?.trim()
      : "Profissional de serviços");

  const tags = useMemo(() => {
    if (!professional || !professional.palavras_chave) return [];
    return professional.palavras_chave
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [professional]);

  const handleFollow = () => {
    if (!isAuthenticated) {
      const go = window.confirm(
        "Você precisa estar logado para seguir profissionais. Deseja fazer login agora?"
      );
      if (go) navigate("/login");
      return;
    }
    // futura chamada de API:
    alert("Você agora está seguindo este profissional. (Simulação por enquanto)");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link do perfil copiado para a área de transferência.");
    } catch (err) {
      console.error(err);
      alert(`Não foi possível copiar automaticamente. Link: ${url}`);
    }
  };

  const handleReport = () => {
    // aqui no futuro pode abrir modal ou redirecionar para página de denúncia
    alert("Funcionalidade de denúncia será implementada em breve.");
  };

  if (loading) {
    return (
      <div className="prof-page-wrapper">
        <div className="prof-page-inner">
          <p className="loading-text">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="prof-page-wrapper">
        <div className="prof-page-inner">
          <p className="error-text">{error || "Profissional não encontrado."}</p>
          <button className="btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="me-1" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  const displayName = professional.full_name || professional.email;

  // PORTFÓLIO (mock até ter API)
  const rawPortfolio =
    professional.portfolio && Array.isArray(professional.portfolio)
      ? professional.portfolio
      : tags.length > 0
      ? tags.map((t, idx) => ({ id: idx, label: t }))
      : [
          { id: 1, label: "Projeto recente" },
          { id: 2, label: "Trabalho em destaque" },
          { id: 3, label: "Antes e depois" },
          { id: 4, label: "Reforma cozinha" },
          { id: 5, label: "Reparo emergencial" },
          { id: 6, label: "Projeto especial" },
          { id: 7, label: "Portfólio 1" },
          { id: 8, label: "Portfólio 2" },
          { id: 9, label: "Portfólio 3" },
          { id: 10, label: "Portfólio 4" },
        ];

  const totalPages = Math.max(1, Math.ceil(rawPortfolio.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(portfolioPage, totalPages);

  const portfolioItems = rawPortfolio.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setPortfolioPage(page);
  };

  return (
    <div className="prof-page-wrapper">
      <div className="prof-page-inner fade-in">
        {/* BOTÃO VOLTAR */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="me-2" />
          Voltar
        </button>

        {/* HEADER DO PERFIL */}
        <section className="prof-header-card">
          <div className="prof-header-main">
            {/* Avatar */}
            {professional.photo ? (
              <img
                src={professional.photo}
                alt={displayName}
                className="prof-avatar"
              />
            ) : (
              <div className="prof-avatar-initials">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Nome + info */}
            <div className="prof-header-info">
              {/* linha com nome + seguir + compartilhar */}
              <div className="prof-name-row">
                <div>
                  <h1 className="prof-name">{displayName}</h1>
                  <p className="prof-profession">{professionLabel}</p>
                </div>
                <div className="prof-name-actions">
                  <button
                    type="button"
                    className="btn-chip"
                    onClick={handleFollow}
                  >
                    <Heart size={14} className="me-1" />
                    Seguir
                  </button>
                  <button
                    type="button"
                    className="btn-chip ghost"
                    onClick={handleShare}
                  >
                    <Share2 size={14} className="me-1" />
                    Compartilhar
                  </button>
                </div>
              </div>

              <div className="prof-meta-row">
                <div className="rating-chip">
                  <Star size={16} className="star-icon" />
                  <span>{ratingFormatted}</span>
                </div>

                {professional.address && (
                  <div className="meta-item">
                    <MapPin size={14} className="me-1" />
                    <span>{professional.address}</span>
                  </div>
                )}
              </div>

              {professional.bio && (
                <p className="prof-short-bio">
                  {professional.bio.length > 160
                    ? professional.bio.slice(0, 160) + "..."
                    : professional.bio}
                </p>
              )}

              {tags.length > 0 && (
                <div className="prof-tags">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="prof-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ações rápidas (chat / calendário / email / denunciar) */}
          <div className="prof-header-actions">
            <button
              className="btn-primary"
              onClick={() => navigate(`/chat/${id}`)}
            >
              <MessageCircle size={16} className="me-1" />
              Iniciar conversa
            </button>

            <button
              className="btn-outline"
              onClick={() => navigate(`/professional/${id}/schedule`)}
            >
              <Calendar size={16} className="me-1" />
              Consultar agenda
            </button>

            <a href={`mailto:${professional.email}`} className="btn-outline">
              <Mail size={16} className="me-1" />
              Enviar e-mail
            </a>

            <button
              className="btn-outline danger"
              onClick={handleReport}
            >
              <Flag size={16} className="me-1" />
              Denunciar
            </button>
          </div>

          {/* LINHA DE ESTATÍSTICAS */}
          <div className="prof-stats-row">
            <div className="stat-card">
              <div className="stat-main stat-red">{satisfaction}%</div>
              <div className="stat-label">Satisfação</div>
            </div>
            <div className="stat-card">
              <div className="stat-main stat-orange">{demandsCount}</div>
              <div className="stat-label">Demandas</div>
            </div>
            <div className="stat-card">
              <div className="stat-main stat-green">{statusLabel}</div>
              <div className="stat-label">Status</div>
            </div>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="prof-content-grid">
          {/* COLUNA ESQUERDA: Sobre + Portfólio + Feedbacks */}
          <div className="prof-column">
            {/* SOBRE O PROFISSIONAL */}
            <section className="prof-card">
              <div
                className="prof-card-header"
                onClick={() => toggleSection("about")}
              >
                <h2 className="prof-section-title">
                  <Briefcase size={18} className="me-2" />
                  Sobre o profissional
                </h2>
                {sectionsOpen.about ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>

              {sectionsOpen.about && (
                <p className="prof-section-text">
                  {professional.bio
                    ? professional.bio
                    : "Este profissional ainda não adicionou uma descrição detalhada sobre seus serviços."}
                </p>
              )}
            </section>

            {/* PORTFÓLIO & MÍDIA */}
            <section className="prof-card">
              <div
                className="prof-card-header"
                onClick={() => toggleSection("portfolio")}
              >
                <h2 className="prof-section-title">Portfólio & Mídia</h2>
                {sectionsOpen.portfolio ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>

              {sectionsOpen.portfolio && (
                <>
                  <p className="prof-section-text">
                    Aqui o profissional pode destacar trabalhos realizados, fotos de
                    serviços, antes e depois, etc.
                  </p>

                  {/* GRID 3x3 */}
                  <div className="portfolio-grid">
                    {portfolioItems.map((item) => (
                      <div key={item.id ?? item.label} className="portfolio-item">
                        <div className="portfolio-label">
                          {item.label || item.titulo || "Projeto"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINAÇÃO */}
                  {totalPages > 1 && (
                    <div className="portfolio-pagination">
                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                      >
                        &lt;
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1;
                        return (
                          <button
                            key={page}
                            type="button"
                            className={`page-dot ${
                              page === currentPage ? "active" : ""
                            }`}
                            onClick={() => changePage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => changePage(currentPage + 1)}
                      >
                        &gt;
                      </button>
                    </div>
                  )}

                  <div className="hint-text" style={{ marginTop: "10px" }}>
                    Em uma próxima etapa, isso pode ser ligado a um cadastro real
                    de fotos e vídeos, como no Instagram.
                  </div>
                </>
              )}
            </section>

            {/* FEEDBACKS / AVALIAÇÕES */}
            <section className="prof-card">
              <div
                className="prof-card-header"
                onClick={() => toggleSection("feedbacks")}
              >
                <h2 className="prof-section-title">Feedbacks</h2>
                {sectionsOpen.feedbacks ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>

              {sectionsOpen.feedbacks && (
                <p className="prof-section-text">
                  Em breve você verá aqui as avaliações reais de clientes, com
                  comentários, datas e notas detalhadas.
                </p>
              )}
            </section>
          </div>

          {/* COLUNA DIREITA: Informações gerais */}
          <section className="prof-card">
            <div
              className="prof-card-header"
              onClick={() => toggleSection("info")}
            >
              <h2 className="prof-section-title">Informações gerais</h2>
              {sectionsOpen.info ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>

            {sectionsOpen.info && (
              <>
                <ul className="prof-info-list">
                  <li>
                    <span className="label">E-mail:</span>
                    <span className="value">{professional.email}</span>
                  </li>

                  {professional.address && (
                    <li>
                      <span className="label">Atende em:</span>
                      <span className="value">{professional.address}</span>
                    </li>
                  )}

                  <li>
                    <span className="label">Avaliação média:</span>
                    <span className="value">
                      <Star size={14} className="star-icon me-1" />
                      {ratingFormatted}
                    </span>
                  </li>
                </ul>

                <div className="hint-text">
                  Outras informações (CNPJ, modalidades de atendimento,
                  especialidades avançadas) podem ser adicionadas aqui depois.
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileView;
