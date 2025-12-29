import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <video className="landing__video" autoPlay loop muted playsInline>
        <source src={`${process.env.PUBLIC_URL}/1215.mp4`} type="video/mp4" />
      </video>

      <div className="landing__overlay" />

      <header className="landing__header">
        <img
          className="landing__logo"
          src={`${process.env.PUBLIC_URL}/zz.svg`}
          alt="Emek Spor"
        />
      </header>

      <main className="landing__content">
        <h1 className="landing__title">
          Yolculuğumuza
          <br />
          Birlikte Başlayalım
        </h1>

        <p className="landing__subtitle">
          Voleybol tutkunuzu bizimle paylaşın. Profesyonel antrenörlerimiz ve
          modern tesislerimizle size unutulmaz bir deneyim sunuyoruz.
        </p>

        <div className="landing__actions">
          <button
            type="button"
            className="landing__btn landing__btn--primary"
            onClick={() => navigate('/panel')}
          >
            Panele Git <span className="landing__arrow">→</span>
          </button>

          <button
            type="button"
            className="landing__btn landing__btn--secondary"
            onClick={() => navigate('/form')}
          >
            Kayıt Ol
          </button>
        </div>
      </main>
    </div>
  );
}


