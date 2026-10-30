/**
 * LPELIA — Contenu modifiable & galerie dynamique
 * ------------------------------------------------
 * Ce script lit le fichier content.json (géré depuis /admin) et l'applique à la page :
 *   - [data-edit="clé"]      → zones de texte
 *   - [data-edit-img="clé"]  → images
 *   - #galleryGrid           → galerie (filtres, « voir plus », visionneuse)
 * Si content.json est absent (ex. ouverture directe du fichier), la page garde
 * simplement les textes et images écrits dans index.html.
 */
(function () {
  'use strict';

  const CMS = (window.LPCMS = {});
  const root = document.documentElement;
  const IS_PREVIEW = new URLSearchParams(location.search).has('preview');
  let pending = {}; // images pas encore publiées (aperçu admin) : chemin → dataURL

  /* ---------- Outils texte ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  /** Texte simple → HTML : *mot* = mis en couleur, retour à la ligne = <br> */
  CMS.format = (str, hlClass = 'highlight') =>
    esc(str)
      .replace(/\*([^*\n]+)\*/g, `<span class="${hlClass}">$1</span>`)
      .replace(/\r?\n/g, '<br>');

  /** HTML d'un élément → texte simple (inverse de format) */
  CMS.extract = (el) => {
    if (el.dataset.editType === 'number') return el.dataset.target || el.textContent.trim();
    const hl = el.dataset.hl || 'highlight';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('br').forEach((br) => br.replaceWith('\u0001'));
    clone.querySelectorAll('.' + hl).forEach((s) => s.replaceWith('*' + s.textContent.trim() + '*'));
    return clone.textContent
      .replace(/\s+/g, ' ')
      .replace(/\s*\u0001\s*/g, '\n')
      .trim();
  };

  CMS.resolve = (src) => (src && pending[src]) || src;

  /* ---------- Application du contenu ---------- */
  function applyText(el, value) {
    if (value == null) return;
    const type = el.dataset.editType;
    if (type === 'number') {
      const n = parseInt(String(value).replace(/[^\d]/g, ''), 10);
      if (isNaN(n)) return;
      el.dataset.target = String(n);
      // Si le compteur a déjà été animé, on met le texte à jour directement
      if (el.textContent.trim() !== '0') el.textContent = n.toLocaleString('fr-FR');
      return;
    }
    el.innerHTML = CMS.format(value, el.dataset.hl || 'highlight');
    const hrefType = el.dataset.editHref;
    if (hrefType === 'tel') el.href = 'tel:' + String(value).replace(/[^\d+]/g, '');
    if (hrefType === 'mailto') el.href = 'mailto:' + String(value).trim();
  }

  CMS.apply = function (content, pendingImages) {
    if (!content) return;
    if (pendingImages) pending = pendingImages;
    const texts = content.texts || {};
    const images = content.images || {};
    document.querySelectorAll('[data-edit]').forEach((el) => {
      if (Object.prototype.hasOwnProperty.call(texts, el.dataset.edit)) applyText(el, texts[el.dataset.edit]);
    });
    document.querySelectorAll('[data-edit-img]').forEach((el) => {
      const img = images[el.dataset.editImg];
      if (!img) return;
      if (img.src) el.src = CMS.resolve(img.src);
      if (img.alt != null) el.alt = img.alt;
    });
    if (Array.isArray(content.gallery)) Gallery.setItems(content.gallery);
  };

  CMS.load = function () {
    const ctrl = 'AbortController' in window ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 4000);
    return fetch('content.json?t=' + Date.now(), { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .finally(() => clearTimeout(timer));
  };

  /* ======================================================================
     GALERIE
     ====================================================================== */
  const PAGE_SIZE = 9;
  const ALL = 'Toutes';

  const Gallery = (CMS.gallery = {
    items: [],
    filter: ALL,
    shown: PAGE_SIZE,
    list: [], // éléments filtrés (pour la visionneuse)
    index: 0,

    fromDOM() {
      return [...document.querySelectorAll('#galleryGrid .gallery-item')].map((fig, i) => ({
        id: 'g' + (i + 1),
        src: fig.querySelector('img')?.getAttribute('src') || '',
        alt: fig.querySelector('img')?.getAttribute('alt') || '',
        title: fig.querySelector('.gallery-caption-title')?.textContent.trim() || '',
        category: fig.dataset.category || fig.querySelector('.gallery-caption-tag')?.textContent.trim() || ''
      }));
    },

    setItems(items) {
      this.items = (items || []).filter((it) => it && it.src);
      const cats = this.categories();
      if (this.filter !== ALL && !cats.includes(this.filter)) this.filter = ALL;
      this.render();
    },

    categories() {
      const seen = [];
      this.items.forEach((it) => {
        const c = (it.category || '').trim();
        if (c && !seen.includes(c)) seen.push(c);
      });
      return seen;
    },

    filtered() {
      return this.filter === ALL ? this.items : this.items.filter((it) => (it.category || '').trim() === this.filter);
    },

    /* Disposition éditoriale asymétrique pour n'importe quel nombre de photos */
    layout(n) {
      const rows = [[7, 5], [4, 4, 4], [12]];
      const heights = { 1: 400, 2: 380, 3: 320 };
      const out = [];
      let r = 0;
      while (out.length < n) {
        let row = rows[r % rows.length];
        const left = n - out.length;
        if (row.length > left) row = left === 1 ? [12] : [6, 6];
        row.forEach((w) => out.push({ w, h: heights[row.length] }));
        r++;
      }
      return out;
    },

    renderFilters() {
      const bar = document.getElementById('galleryFilters');
      if (!bar) return;
      const cats = this.categories();
      if (cats.length < 2) { bar.innerHTML = ''; bar.hidden = true; return; }
      bar.hidden = false;
      const count = (c) => (c === ALL ? this.items.length : this.items.filter((it) => (it.category || '').trim() === c).length);
      bar.innerHTML = [ALL, ...cats].map((c) => `
        <button type="button" class="gallery-filter-btn${c === this.filter ? ' active' : ''}"
          data-filter="${esc(c)}" aria-pressed="${c === this.filter}">
          ${esc(c)} <span class="gallery-filter-count">${count(c)}</span>
        </button>`).join('');
    },

    render() {
      const grid = document.getElementById('galleryGrid');
      if (!grid) return;
      this.renderFilters();
      this.list = this.filtered();
      const visible = this.list.slice(0, this.shown);
      const sizes = this.layout(visible.length);

      grid.innerHTML = visible.length ? visible.map((it, i) => `
        <figure class="gallery-item gallery-item--in" style="--gw:${sizes[i].w};--gh:${sizes[i].h}px;animation-delay:${Math.min(i, 8) * 45}ms"
          data-index="${i}" data-gallery-id="${esc(it.id || '')}" tabindex="0" role="button"
          aria-label="Agrandir : ${esc(it.title || it.alt || 'photo')}">
          <img src="${esc(CMS.resolve(it.src))}" alt="${esc(it.alt || it.title || '')}" class="gallery-img" loading="lazy">
          <div class="gallery-zoom-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" /></svg>
          </div>
          ${(it.title || it.category) ? `<figcaption class="gallery-overlay">
            ${it.category ? `<span class="gallery-caption-tag">${esc(it.category)}</span>` : ''}
            ${it.title ? `<h4 class="gallery-caption-title">${esc(it.title)}</h4>` : ''}
          </figcaption>` : ''}
        </figure>`).join('')
        : '<p class="gallery-empty">Aucune photo pour le moment.</p>';

      const more = document.getElementById('galleryMoreBtn');
      if (more) {
        const rest = this.list.length - visible.length;
        more.hidden = rest <= 0;
        more.firstChild.textContent = `Voir plus de photos (${rest}) `;
      }
    },

    /* ---------- Visionneuse ---------- */
    open(i) {
      const lb = document.getElementById('galleryLightbox');
      if (!lb || !this.list.length) return;
      this.lastFocus = document.activeElement;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.show(i);
      document.getElementById('lightboxCloseBtn')?.focus();
    },

    show(i) {
      const n = this.list.length;
      this.index = ((i % n) + n) % n;
      const it = this.list[this.index];
      const img = document.getElementById('lightboxImg');
      img.classList.remove('is-loaded');
      img.onload = () => img.classList.add('is-loaded');
      img.src = CMS.resolve(it.src);
      img.alt = it.alt || it.title || 'Photographie LPELIA';
      document.getElementById('lightboxCaption').textContent =
        [it.title, it.category].filter(Boolean).join(' — ');
      document.getElementById('lightboxCounter').textContent = n > 1 ? `${this.index + 1} / ${n}` : '';
      document.querySelectorAll('.lightbox-nav-btn').forEach((b) => (b.hidden = n < 2));
      // Pré-chargement des voisines
      [1, -1].forEach((d) => { const nb = this.list[(this.index + d + n) % n]; if (nb) new Image().src = CMS.resolve(nb.src); });
    },

    close() {
      const lb = document.getElementById('galleryLightbox');
      if (!lb) return;
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.lastFocus?.focus?.();
    },

    bind() {
      const grid = document.getElementById('galleryGrid');
      const bar = document.getElementById('galleryFilters');
      const more = document.getElementById('galleryMoreBtn');
      const lb = document.getElementById('galleryLightbox');
      if (!grid) return;

      grid.addEventListener('click', (e) => {
        const fig = e.target.closest('.gallery-item');
        if (fig && !IS_PREVIEW) this.open(+fig.dataset.index);
      });
      grid.addEventListener('keydown', (e) => {
        const fig = e.target.closest('.gallery-item');
        if (fig && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.open(+fig.dataset.index); }
      });
      bar?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        this.filter = btn.dataset.filter;
        this.shown = PAGE_SIZE;
        this.render();
      });
      more?.addEventListener('click', () => { this.shown += PAGE_SIZE; this.render(); });

      if (!lb) return;
      document.getElementById('lightboxCloseBtn')?.addEventListener('click', () => this.close());
      document.getElementById('lightboxPrev')?.addEventListener('click', () => this.show(this.index - 1));
      document.getElementById('lightboxNext')?.addEventListener('click', () => this.show(this.index + 1));
      lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lightbox-figure')) this.close(); });
      window.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.show(this.index - 1);
        if (e.key === 'ArrowRight') this.show(this.index + 1);
      });
      // Balayage tactile
      let x0 = null;
      lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) this.show(this.index + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }
  });

  /* ======================================================================
     MODE APERÇU (utilisé par l'espace admin dans un iframe)
     ====================================================================== */
  function initPreviewBridge() {
    root.classList.add('cms-preview');
    const parentWin = window.parent !== window ? window.parent : null;
    if (!parentWin) return;
    const sameOrigin = (e) => e.origin === location.origin || (e.origin === 'null' && location.origin === 'null');

    window.addEventListener('message', (e) => {
      if (!sameOrigin(e) || !e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'lpcms:draft') {
        CMS.apply(e.data.content, e.data.pending || {});
      }
      if (e.data.type === 'lpcms:scrollTo') {
        const el = e.data.key.startsWith('gallery:')
          ? document.querySelector(`[data-gallery-id="${CSS.escape(e.data.key.slice(8))}"]`) || document.getElementById('galerie')
          : document.querySelector(`[data-edit="${CSS.escape(e.data.key)}"], [data-edit-img="${CSS.escape(e.data.key)}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.remove('cms-flash'); void el.offsetWidth; el.classList.add('cms-flash');
        }
      }
    });

    // Clic sur une zone dans l'aperçu → l'admin ouvre le champ correspondant
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-edit], [data-edit-img], .gallery-item, #galerie .section-header');
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      let key = el.dataset.edit || el.dataset.editImg;
      if (!key && el.classList.contains('gallery-item')) key = 'gallery:' + (el.dataset.galleryId || '');
      if (key) parentWin.postMessage({ type: 'lpcms:focus', key }, location.origin === 'null' ? '*' : location.origin);
    }, true);

    parentWin.postMessage({ type: 'lpcms:ready' }, location.origin === 'null' ? '*' : location.origin);
  }

  /* ======================================================================
     DÉMARRAGE
     ====================================================================== */
  const reveal = () => root.classList.remove('cms-pending');
  const safety = setTimeout(reveal, 1800);

  CMS.ready = new Promise((resolve) => {
    const start = () => {
      Gallery.items = Gallery.fromDOM();
      Gallery.bind();
      CMS.load().then((content) => {
        if (content) CMS.apply(content);
        else Gallery.render();
        CMS.content = content;
        clearTimeout(safety);
        reveal();
        if (IS_PREVIEW) initPreviewBridge();
        resolve(content);
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  });
})();
