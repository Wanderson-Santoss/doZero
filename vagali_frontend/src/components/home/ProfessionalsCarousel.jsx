import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import "./carousel.css";

const defaultPhoto = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ProfessionalsCarousel = ({ professionals, loading }) => {
  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const renderSkeleton = () => (
    <div className="carousel-container">
      <h2 className="section-title">Profissionais em Destaque</h2>
      <div className="skeleton-row">
        {[1, 2, 3].map((i) => (
          <div key={i} className="professional-card skeleton-card">
            <div className="skeleton-photo" />
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-40" />
            <div className="skeleton-line w-80" />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  if (!professionals || professionals.length === 0) {
    return (
      <div className="carousel-container">
        <h2 className="section-title">Profissionais em Destaque</h2>
        <p className="empty-text">Nenhum profissional encontrado no momento.</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <h2 className="section-title">Profissionais em Destaque</h2>

      <Slider {...settings}>
        {professionals.map((prof) => {
          const rating = typeof prof.rating === "number"
            ? prof.rating.toFixed(1)
            : "0.0";

          const tags = (prof.palavras_chave || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

          return (
            <motion.div
              key={prof.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
            >
              <div className="professional-card">

                {/* FOTO */}
                <img
                  src={prof.photo || defaultPhoto}
                  alt={prof.full_name || prof.email}
                  className="professional-photo"
                />

                {/* NOME */}
                <h3 className="professional-name">
                  {prof.full_name || prof.email}
                </h3>

                {/* CIDADE */}
                {prof.address && (
                  <div className="professional-address">
                    <MapPin size={15} className="me-1" />
                    {prof.address}
                  </div>
                )}

                {/* RATING */}
                <div className="rating-box">
                  <Star size={18} className="star-icon" />
                  <span>{rating}</span>
                </div>

                {/* BIO */}
                {prof.bio && (
                  <p className="professional-bio">
                    {prof.bio.length > 110
                      ? prof.bio.slice(0, 110) + "..."
                      : prof.bio}
                  </p>
                )}

                {/* TAGS */}
                {tags.length > 0 && (
                  <div className="tags-container">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* BOTÃO */}
                <Link
                  to={`/perfil/${prof.id}`}
                  className="view-profile-btn"
                >
                  Ver perfil
                </Link>
              </div>
            </motion.div>
          );
        })}
      </Slider>
    </div>
  );
};

export default ProfessionalsCarousel;
