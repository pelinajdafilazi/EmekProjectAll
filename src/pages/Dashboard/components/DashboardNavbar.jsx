import React from 'react';

export default function DashboardNavbar({ activeItem = 'Öğrenciler', onNavigate }) {
  const menuItems = ['Öğrenciler', 'Gruplar', 'Dersler', 'Ödemeler', 'Yoklamalar'];

  return (
    <header className="dash-nav">
      <div className="dash-nav__brand">
        <img src={`${process.env.PUBLIC_URL}/zz.svg`} alt="EMEK Logo" />
        EMEK SPOR KULÜBÜ
      </div>

      <nav className="dash-nav__links" aria-label="Dashboard navigation">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`dash-nav__link ${activeItem === item ? 'dash-nav__link--active' : ''}`}
            onClick={() => onNavigate?.(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <button type="button" className="dash-nav__cta">
        SPORCU EKLE
      </button>
    </header>
  );
}


