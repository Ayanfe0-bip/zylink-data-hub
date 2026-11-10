const networks = [
{ name: "MTN", color: "mtn", mark: "M" },
{ name: "Airtel", color: "airtel", mark: "A" },
{ name: "Glo", color: "glo", mark: "G" },
{ name: "9mobile", color: "nine", mark: "9" }
];

const services = [
{
icon: "▤",
title: "Buy Data",
detail: "Affordable data bundles",
tone: "blue"
},
{
icon: "◉",
title: "Buy Airtime",
detail: "Top up any network",
tone: "cyan"
},
{
icon: "↗",
title: "Transactions",
detail: "Track your purchases",
tone: "purple"
}
];

export default function Home() {
return (
<main className="page-shell">
<header className="topbar">
<a className="brand" href="/" aria-label="Zylink home">
<span className="brand-mark">Z</span>
<span className="brand-name">
zy<span>link</span>
</span>
</a>

    <nav className="top-actions">
      <a className="help-link" href="#support">Help</a>
      <a className="login-button" href="/login">Log in</a>
    </nav>
  </header>

  <section className="hero">
    <div className="hero-copy">
      <span className="eyebrow">
        <span className="live-dot" />
        YOUR CONNECTION, SIMPLIFIED
      </span>

      <h1>
        Stay connected.
        <br />
        <span>Spend less.</span>
      </h1>

      <p>
        Get your data and airtime without the stress.
        Simple, quick and reliable — all in one place.
      </p>

      <a className="primary-button" href="/signup">
        Get started <span>→</span>
      </a>

      <div className="trust-note">
        <span className="shield">✓</span>
        Easy purchases. Clear transactions.
      </div>
    </div>

    <div className="hero-card-wrap" aria-label="Zylink service preview">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />

      <div className="balance-card">
        <div className="card-top">
          <span>zylink wallet</span>
          <span className="card-chip">•••</span>
        </div>

        <div className="balance-label">Your balance</div>

        <div className="balance-amount">
          ₦ 5,000<span>.00</span>
        </div>

        <div className="card-bottom">
          <span>Available balance</span>
          <span className="mini-logo">Z</span>
        </div>
      </div>

      <div className="float-badge badge-data">
        <span className="badge-icon">▤</span>
        <span>
          <b>Data purchase</b>
          <small>Fast and simple</small>
        </span>
        <i>✓</i>
      </div>

      <div className="float-badge badge-airtime">
        <span className="badge-icon phone-icon">◉</span>
        <span>
          <b>Airtime top-up</b>
          <small>All networks</small>
        </span>
      </div>
    </div>
  </section>

  <section className="network-section">
    <div className="section-heading">
      <div>
        <span className="section-kicker">ALL YOUR NETWORKS</span>
        <h2>One place. Every network.</h2>
      </div>

      <p>
        Choose your network when you’re ready to make a purchase.
      </p>
    </div>

    <div className="network-grid">
      {networks.map((network) => (
        <div className="network-item" key={network.name}>
          <span className={`network-logo ${network.color}`}>
            {network.mark}
          </span>
          <span>{network.name}</span>
        </div>
      ))}
    </div>
  </section>

  <section className="services-section" id="get-started">
    <div className="section-heading">
      <div>
        <span className="section-kicker">MADE FOR EVERYDAY LIFE</span>
        <h2>Everything you need to stay online.</h2>
      </div>

      <span className="coming-soon">Your digital hub</span>
    </div>

    <div className="service-grid">
      {services.map((service) => (
        <article className="service-card" key={service.title}>
          <span className={`service-icon ${service.tone}`}>
            {service.icon}
          </span>

          <h3>{service.title}</h3>
          <p>{service.detail}</p>
          <span className="service-arrow">→</span>
        </article>
      ))}
    </div>

    <div className="notice">
      <span>ⓘ</span>
      We’re preparing the Zylink experience. Live purchases will be
      enabled after our payment and network-provider integrations
      are ready.
    </div>
  </section>

  <footer className="footer" id="support">
    <a className="brand footer-brand" href="/">
      <span className="brand-mark">Z</span>
      <span className="brand-name">
        zy<span>link</span>
      </span>
    </a>

    <p>Connect More. Spend Less.</p>

    <span>
      © {new Date().getFullYear()} Zylink Data Hub.
      A product of Ayanfe Innovation Labs Limited.
    </span>
  </footer>
</main>

);
}
