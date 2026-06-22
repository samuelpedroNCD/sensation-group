/* =============================================================
   i18n.js — Sensation Group internationalisation system
   Supports PT / EN / FR / ES
   Portuguese is pre-filled in HTML; other languages swap via
   data-i18n attributes.
============================================================= */

const SUPPORTED_LANGS = ['pt', 'en', 'fr', 'es'];
const DEFAULT_LANG = 'pt';
const STORAGE_KEY = 'sg-lang';

class I18n {
  constructor() {
    this.translations = {}; // cache: { lang: { key: value } }
    this.currentLang = this._detectLang();
  }

  // -----------------------------------------------------------
  // Detect language: localStorage → browser → default
  // -----------------------------------------------------------
  _detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return SUPPORTED_LANGS.includes(browser) ? browser : DEFAULT_LANG;
  }

  // -----------------------------------------------------------
  // Public init — called on DOMContentLoaded
  // -----------------------------------------------------------
  async init() {
    if (this.currentLang !== DEFAULT_LANG) {
      await this._load(this.currentLang);
      this._apply();
    }
    this._updateSwitcher();
    document.documentElement.lang = this.currentLang;
  }

  // -----------------------------------------------------------
  // Load translation JSON (with cache)
  // -----------------------------------------------------------
  async _load(lang) {
    if (this.translations[lang]) return;
    try {
      const res = await fetch(`./data/translations/${lang}.json`);
      if (!res.ok) throw new Error('not found');
      this.translations[lang] = await res.json();
    } catch {
      this.translations[lang] = {};
    }
  }

  // -----------------------------------------------------------
  // Apply translations to DOM
  // -----------------------------------------------------------
  _apply() {
    const t = this.translations[this.currentLang];
    if (!t || Object.keys(t).length === 0) return;

    // Text / HTML content via data-i18n="key"
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Attributes via data-i18n-attr="attr:key"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      if (t[key] !== undefined) el.setAttribute(attr, t[key]);
    });

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t['meta.description']) {
      metaDesc.setAttribute('content', t['meta.description']);
    }

    // Page title
    if (t['page.title']) document.title = t['page.title'];

    // HTML lang attribute
    document.documentElement.lang = this.currentLang;
  }

  // -----------------------------------------------------------
  // Switch to a new language
  // -----------------------------------------------------------
  async switchTo(lang) {
    if (!SUPPORTED_LANGS.includes(lang) || lang === this.currentLang) return;
    await this._load(lang);
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    this._apply();
    this._updateSwitcher();
  }

  // -----------------------------------------------------------
  // Highlight the active language button
  // -----------------------------------------------------------
  _updateSwitcher() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.langBtn === this.currentLang);
    });
  }
}

window.i18n = new I18n();

// Auto-init once DOM is ready
document.addEventListener('DOMContentLoaded', () => window.i18n.init());
