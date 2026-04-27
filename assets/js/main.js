/* =============================================================
   main.js — Sensation Group shared JS
   Loaded on every page. No exports — plain script file.
============================================================= */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* -----------------------------------------------------------
     1. NAV SCROLL — adds .scrolled when scrollY > 40
  ----------------------------------------------------------- */
  var nav = document.getElementById('nav');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* -----------------------------------------------------------
     2. HAMBURGER — toggle mobile menu, Escape key, body lock
  ----------------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  function openMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  // Close on mobile link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* -----------------------------------------------------------
     3. HERO BG ANIMATION — adds .loaded to .hero-bg after 80ms
  ----------------------------------------------------------- */
  var heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    requestAnimationFrame(function () {
      setTimeout(function () {
        heroBg.classList.add('loaded');
      }, 80);
    });
  }

  /* -----------------------------------------------------------
     4. BRANDS HOVER — activateBrand(index)
        Swaps .active on .brand-row and .brand-preview-img
        Only runs if those elements exist on the page.
  ----------------------------------------------------------- */
  var brandRows = document.querySelectorAll('.brand-row');
  var previewImgs = document.querySelectorAll('.brand-preview-img');

  if (brandRows.length && previewImgs.length) {
    function activateBrand(index) {
      brandRows.forEach(function (row) {
        row.classList.toggle('active', Number(row.dataset.index) === index);
      });
      previewImgs.forEach(function (img) {
        img.classList.toggle('active', Number(img.dataset.index) === index);
      });
    }

    brandRows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        activateBrand(Number(row.dataset.index));
      });
      row.addEventListener('focus', function () {
        activateBrand(Number(row.dataset.index));
      });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateBrand(Number(row.dataset.index));
        }
      });
    });
  }

  /* -----------------------------------------------------------
     5. REVEAL ON SCROLL — IntersectionObserver on .reveal
        threshold: 0.08, rootMargin: '0px 0px -36px 0px'
        Exposes window._revealObserver for dynamic content.
  ----------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -36px 0px'
    });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Expose for content.js to observe dynamically added elements
    window._revealObserver = revealObserver;
  } else {
    // Fallback: reveal all immediately
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* -----------------------------------------------------------
     6. SMOOTH SCROLL — all <a href="#..."> accounting for nav
  ----------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------------------
     7. PORTFOLIO FILTER — .filter-btn[data-filter] / .portfolio-card[data-category]
        Only runs if .filter-btn elements exist on the page.
  ----------------------------------------------------------- */
  var filterBtns = document.querySelectorAll('.filter-btn');

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter || 'todos';

        // Update active state
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Show/hide cards
        document.querySelectorAll('.portfolio-card').forEach(function (card) {
          if (filter === 'todos') {
            card.style.display = '';
          } else {
            card.style.display = card.dataset.category === filter ? '' : 'none';
          }
        });
      });
    });
  }

  /* -----------------------------------------------------------
     8. FAQ ACCORDION — .faq-item / .faq-question / .faq-answer
        Only runs if .faq-item elements exist on the page.
  ----------------------------------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');

  if (faqItems.length) {
    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      // Set initial collapsed state
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        // Close all other items
        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            var otherAnswer = other.querySelector('.faq-answer');
            if (otherAnswer) {
              otherAnswer.style.maxHeight = '0';
              otherAnswer.style.opacity = '0';
            }
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('open');
          answer.style.maxHeight = '0';
          answer.style.opacity = '0';
        } else {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.opacity = '1';
        }
      });
    });
  }

  /* -----------------------------------------------------------
     9. LANG SWITCHER — wires [data-lang-btn] click to i18n.js
        i18n.js handles the actual switching.
  ----------------------------------------------------------- */
  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.langBtn;
      if (window.i18n && typeof window.i18n.switchTo === 'function') {
        window.i18n.switchTo(lang);
      }
    });
  });

});
