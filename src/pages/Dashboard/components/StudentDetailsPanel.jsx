import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function ProfileAvatar({ photo, name }) {
  return (
    <div className="dash-profile">
      <div className="dash-profile__avatar">
        <div className="dash-profile__avatarInner">
          <img src={photo} alt={name} style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} />
        </div>
      </div>
      <div className="dash-profile__name">{name}</div>
    </div>
  );
}

function InfoGrid({ profile }) {
  const gridRows = [
    [
      { label: 'T.C. Kimlik No', value: profile?.tc || '—' },
      { label: 'Okul İsmi', value: profile?.school || '—' },
    ],
    [
      { label: 'Doğum Tarihi', value: profile?.dob || '—' },
      { label: 'Sınıf No', value: profile?.grade || '—' },
    ],
    [
      { label: 'Sporcu Cep', value: profile?.phone || '—' },
      { label: 'Branşı', value: profile?.branch || '—' },
    ],
  ];

  return (
    <div className="dash-info">
      {gridRows.map((rowPair, idx) => (
        <div key={idx} className="dash-info__grid-row">
          <div className="dash-info__label">{rowPair[0].label}</div>
          <div className="dash-info__value">{rowPair[0].value}</div>
          <div className="dash-info__label">{rowPair[1].label}</div>
          <div className="dash-info__value">{rowPair[1].value}</div>
        </div>
      ))}
      <div className="dash-info__address-row">
        <span className="dash-info__address-label">Adres</span>
        <span className="dash-info__address-value">{profile?.address || '—'}</span>
      </div>
    </div>
  );
}

function ParentsCard({ mother, father }) {
  return (
    <>
      <div className="dash-parents">
        <div className="dash-parents__col">
          <div className="dash-parents__header">Anne Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              <div className="dash-parents__value">{mother?.name || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              <div className="dash-parents__value">{mother?.tc || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              <div className="dash-parents__value">{mother?.occupation || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              <div className="dash-parents__value">{mother?.phone || '—'}</div>
            </div>
          </div>
        </div>
        <div className="dash-parents__divider" />
        <div className="dash-parents__col">
          <div className="dash-parents__header">Baba Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              <div className="dash-parents__value">{father?.name || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              <div className="dash-parents__value">{father?.tc || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              <div className="dash-parents__value">{father?.occupation || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              <div className="dash-parents__value">{father?.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RelativesCard({ title, left, right }) {
  return (
    <div className="dash-rel">
      <div className="dash-rel__title">{title}</div>
      <div className="dash-rel__cols">
        <div className="dash-rel__col">
          <div className="dash-rel__header">{left?.title || 'Teyze Bilgileri'}</div>
          <div className="dash-rel__body">
            <div className="dash-rel__field">
              <div className="dash-rel__label">Ad Soyad</div>
              <div className="dash-rel__value">{left?.name || '—'}</div>
            </div>
            <div className="dash-rel__field">
              <div className="dash-rel__label">T.C. Kimlik No</div>
              <div className="dash-rel__value">{left?.tc || '—'}</div>
            </div>
          </div>
        </div>

        <div className="dash-rel__divider" />

        <div className="dash-rel__col">
          <div className="dash-rel__header">{right?.title || 'Amca Bilgileri'}</div>
          <div className="dash-rel__body">
            <div className="dash-rel__field">
              <div className="dash-rel__label">Ad Soyad</div>
              <div className="dash-rel__value">{right?.name || '—'}</div>
            </div>
            <div className="dash-rel__field">
              <div className="dash-rel__label">T.C. Kimlik No</div>
              <div className="dash-rel__value">{right?.tc || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailsPanel({ student }) {
  const [paymentStatus, setPaymentStatus] = useState(0); // 0: grey (default), 1: green, 2: red
  
  if (!student) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
          Öğrenci seçiniz
        </div>
      </section>
    );
  }

  const name = student?.name || '—';
  const photo = student?.photo || '/avatars/profile-large.svg';
  const parents = student?.parents || {};
  const relatives = student?.relatives || {};
  const training = student?.trainingParticipation ?? 60;

  const handlePaymentToggle = () => {
    setPaymentStatus((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
  };

  const getPaymentButtonClass = () => {
    switch (paymentStatus) {
      case 0: return 'dash-paid dash-paid--grey';
      case 1: return 'dash-paid dash-paid--green';
      case 2: return 'dash-paid dash-paid--red';
      default: return 'dash-paid dash-paid--grey';
    }
  };

  return (
    <section className="dash-right">
      <div className="dash-top">
        <ProfileAvatar photo={photo} name={name} />
        <div className="dash-top__info">
          <InfoGrid profile={student?.profile} />
        </div>
      </div>

      <ParentsCard mother={parents.mother} father={parents.father} />

      <RelativesCard title="Yakın Listesi" left={relatives.aunt} right={relatives.uncle} />

      <div className="dash-bottom">
        <div className="dash-attendance">
          <div className="dash-attendance__bar-wrapper" style={{ position: 'absolute', left: '2px', top: '-26px' }}>
            <div className="dash-attendance__label">Antrenman Katılımı %{training}</div>
            <div className="dash-attendance__bar-container">
              <div className="dash-attendance__bar">
                <div className="dash-attendance__fill" style={{ width: `${training}%` }} />
              </div>
              <ChevronDown size={14} className="dash-attendance__chevron-icon" />
            </div>
          </div>
        </div>

        <button type="button" className={getPaymentButtonClass()} onClick={handlePaymentToggle} style={{ position: 'absolute', left: '1305px', top: '692px' }}>
          Ödeme Alındı
        </button>
      </div>
    </section>
  );
}


