/* =============================================================
   content.js — Sensation Group content loader
   Used by template pages (portfolio-item, evento-item,
   insight-item) and listing pages (portfolio.html,
   eventos.html, insights.html) to render dynamic content.
============================================================= */

const ContentLoader = {

  // -----------------------------------------------------------
  // Get ?id= slug from current URL
  // -----------------------------------------------------------
  getSlug() {
    return new URLSearchParams(window.location.search).get('id');
  },

  // -----------------------------------------------------------
  // Get current language (falls back to 'pt')
  // -----------------------------------------------------------
  getLang() {
    return localStorage.getItem('sg-lang') || 'pt';
  },

  // -----------------------------------------------------------
  // Translate a multilingual field { pt, en, fr, es }
  // Returns the string as-is if it is already a plain string.
  // -----------------------------------------------------------
  t(field) {
    if (!field || typeof field === 'string') return field || '';
    const lang = this.getLang();
    return field[lang] || field['pt'] || '';
  },

  // -----------------------------------------------------------
  // Format a date string (YYYY-MM-DD or YYYY-MM) for display
  // -----------------------------------------------------------
  formatDate(dateStr, lang) {
    if (!dateStr) return '';
    const months = {
      pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    };
    const [year, month, day] = dateStr.split('-');
    const m = months[lang || this.getLang()] || months['pt'];
    return day
      ? `${parseInt(day)} ${m[parseInt(month) - 1]} ${year}`
      : `${m[parseInt(month) - 1]} ${year}`;
  },

  // -----------------------------------------------------------
  // Fetch a JSON data file from /data/
  // -----------------------------------------------------------
  async fetchData(file) {
    try {
      const res = await fetch(`./data/${file}.json`);
      if (!res.ok) throw new Error(`Failed to fetch ${file}.json`);
      return await res.json();
    } catch (e) {
      
      return null;
    }
  },

  // ── PORTFOLIO ───────────────────────────────────────────────

  async renderPortfolioGrid(containerId, filterValue = 'all') {
    const data = await this.fetchData('portfolio');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    const lang = this.getLang();
    const items = filterValue === 'all'
      ? data.items
      : data.items.filter(i => i.category === filterValue);

    container.innerHTML = items.map(item => `
      <article class="portfolio-card reveal" data-category="${item.category}">
        <a href="portfolio-item.html?id=${item.id}" class="portfolio-card-inner">
          <div class="portfolio-card-img" style="background-image:url('${item.image}')"></div>
          <div class="portfolio-card-overlay"></div>
          <div class="portfolio-card-label">
            <p class="portfolio-card-cat">${this.t(item.categoryLabel) || item.category}</p>
            <h3 class="portfolio-card-title">${this.t(item.title)}</h3>
          </div>
        </a>
      </article>
    `).join('');

    // Re-init reveal observer for newly added elements
    if (window._revealObserver) {
      container.querySelectorAll('.reveal').forEach(el => window._revealObserver.observe(el));
    }
  },

  async renderPortfolioItem(data) {
    const slug = this.getSlug();
    if (!slug) { window.location.href = 'portfolio.html'; return; }
    const item = data.items.find(i => i.id === slug);
    if (!item) { window.location.href = 'portfolio.html'; return; }
    const lang = this.getLang();

    document.title = `${this.t(item.title)} — Sensation Group`;

    this._fill('item-title', this.t(item.title));
    this._fill('item-client', item.client);
    this._fill('item-date', this.formatDate(item.date, lang));
    this._fill('item-category', item.category);
    this._fill('item-description', this.t(item.description));
    this._fill('item-brand', item.brand);

    // Hero image
    const heroImg = document.getElementById('item-hero-img');
    if (heroImg) heroImg.style.backgroundImage = `url('${item.image}')`;

    // Gallery
    const gallery = document.getElementById('item-gallery');
    if (gallery && item.gallery) {
      gallery.innerHTML = item.gallery.map(url => `
        <div class="gallery-img" style="background-image:url('${url}')"></div>
      `).join('');
    }

    // Testimonial
    if (item.testimonial) {
      this._fill('item-testimonial-text', this.t(item.testimonial.text));
      this._fill('item-testimonial-author', item.testimonial.author);
    }

    // Related — 3 others in same category
    const related = data.items
      .filter(i => i.id !== slug && i.category === item.category)
      .slice(0, 3);
    const relatedEl = document.getElementById('item-related');
    if (relatedEl) {
      relatedEl.innerHTML = related.map(r => `
        <a href="portfolio-item.html?id=${r.id}" class="related-card">
          <div class="related-card-img" style="background-image:url('${r.image}')"></div>
          <p class="related-card-cat">${r.category}</p>
          <h4 class="related-card-title">${this.t(r.title)}</h4>
        </a>
      `).join('');
    }
  },

  // ── EVENTS ──────────────────────────────────────────────────

  async renderEventsList(upcomingId, pastId) {
    const data = await this.fetchData('events');
    if (!data) return;
    const lang = this.getLang();
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = data.items.filter(e => e.date >= today);
    const past = data.items.filter(e => e.date < today);

    const upcomingEl = document.getElementById(upcomingId);
    if (upcomingEl) {
      upcomingEl.innerHTML = upcoming.length
        ? upcoming.map(e => `
          <a href="evento-item.html?id=${e.id}" class="event-list-row reveal">
            <span class="event-list-date">${this.formatDate(e.date, lang)}</span>
            <span class="event-list-name">${this.t(e.title)}</span>
            <span class="event-list-location">${this.t(e.location)}</span>
            <span class="event-list-tag">${e.type}</span>
            <span class="event-list-arrow">→</span>
          </a>
        `).join('')
        : '<p class="no-events">Sem eventos próximos.</p>';
    }

    const pastEl = document.getElementById(pastId);
    if (pastEl) {
      pastEl.innerHTML = past.map(e => `
        <a href="evento-item.html?id=${e.id}" class="event-list-row event-list-row--past reveal">
          <span class="event-list-date">${this.formatDate(e.date, lang)}</span>
          <span class="event-list-name">${this.t(e.title)}</span>
          <span class="event-list-location">${this.t(e.location)}</span>
          <span class="event-list-tag">${e.type}</span>
          <span class="event-list-arrow">→</span>
        </a>
      `).join('');
    }
  },

  async renderEventItem(data) {
    const slug = this.getSlug();
    if (!slug) { window.location.href = 'eventos.html'; return; }
    const item = data.items.find(i => i.id === slug);
    if (!item) { window.location.href = 'eventos.html'; return; }
    const lang = this.getLang();

    document.title = `${this.t(item.title)} — Sensation Group`;
    this._fill('item-title', this.t(item.title));
    this._fill('item-date', this.formatDate(item.date, lang));
    this._fill('item-location', this.t(item.location));
    this._fill('item-type', item.type);
    this._fill('item-description', this.t(item.description));

    const heroImg = document.getElementById('item-hero-img');
    if (heroImg) heroImg.style.backgroundImage = `url('${item.image}')`;
  },

  // ── INSIGHTS ────────────────────────────────────────────────

  async renderInsightsList(featuredId, gridId, filterValue = 'all') {
    const data = await this.fetchData('insights');
    if (!data) return;
    const lang = this.getLang();
    const featured = data.items.find(i => i.featured);
    const rest = data.items.filter(i => !i.featured);
    const filtered = filterValue === 'all'
      ? rest
      : rest.filter(i => i.category === filterValue);

    const featEl = document.getElementById(featuredId);
    if (featEl && featured) {
      featEl.innerHTML = `
        <a href="insight-item.html?id=${featured.id}" class="insight-featured-link">
          <div class="insight-featured-img" style="background-image:url('${featured.image}')"></div>
          <div class="insight-featured-body">
            <p class="insight-cat">${featured.category}</p>
            <h2 class="insight-featured-title">${this.t(featured.title)}</h2>
            <p class="insight-excerpt">${this.t(featured.excerpt)}</p>
            <span class="insight-meta">${this.formatDate(featured.date, lang)} · ${featured.readTime} min</span>
          </div>
        </a>`;
    }

    const gridEl = document.getElementById(gridId);
    if (gridEl) {
      gridEl.innerHTML = filtered.map(item => `
        <a href="insight-item.html?id=${item.id}" class="insight-card reveal">
          <div class="insight-card-img" style="background-image:url('${item.image}')"></div>
          <div class="insight-card-body">
            <p class="insight-cat">${item.category}</p>
            <h3 class="insight-card-title">${this.t(item.title)}</h3>
            <p class="insight-excerpt">${this.t(item.excerpt)}</p>
            <span class="insight-meta">${this.formatDate(item.date, lang)} · ${item.readTime} min</span>
          </div>
        </a>
      `).join('');

      if (window._revealObserver) {
        gridEl.querySelectorAll('.reveal').forEach(el => window._revealObserver.observe(el));
      }
    }
  },

  async renderInsightItem(data) {
    const slug = this.getSlug();
    if (!slug) { window.location.href = 'insights.html'; return; }
    const item = data.items.find(i => i.id === slug);
    if (!item) { window.location.href = 'insights.html'; return; }
    const lang = this.getLang();

    document.title = `${this.t(item.title)} — Sensation Group`;
    this._fill('item-title', this.t(item.title));
    this._fill('item-date', this.formatDate(item.date, lang));
    this._fill('item-author', item.author?.name || '');
    this._fill('item-readtime', `${item.readTime} min`);
    this._fill('item-category', item.category);
    this._fill('item-body', this.t(item.body));

    const heroImg = document.getElementById('item-hero-img');
    if (heroImg) heroImg.style.backgroundImage = `url('${item.image}')`;

    // Related — 3 other articles
    const related = data.items.filter(i => i.id !== slug).slice(0, 3);
    const relatedEl = document.getElementById('item-related');
    if (relatedEl) {
      relatedEl.innerHTML = related.map(r => `
        <a href="insight-item.html?id=${r.id}" class="related-card">
          <div class="related-card-img" style="background-image:url('${r.image}')"></div>
          <p class="related-card-cat">${r.category}</p>
          <h4 class="related-card-title">${this.t(r.title)}</h4>
        </a>
      `).join('');
    }
  },

  // ── PARTNERSHIPS ────────────────────────────────────────────

  async renderPartnerships() {
    const data = await this.fetchData('partnerships');
    if (!data) return;
    ['venues', 'strategic', 'international', 'sector'].forEach(group => {
      const el = document.getElementById(`partners-${group}`);
      if (!el || !data[group]) return;
      el.innerHTML = data[group].map(p => `
        <div class="partner-item">
          ${p.logo
            ? `<img src="${p.logo}" alt="${p.name}" loading="lazy">`
            : `<span class="partner-name">${p.name}</span>`
          }
        </div>
      `).join('');
    });
  },

  // ── UTILITY ─────────────────────────────────────────────────

  _fill(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  },
};

window.ContentLoader = ContentLoader;
