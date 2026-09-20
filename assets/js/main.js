/**
 * LPELIA — Lycée Professionnel d’Électronique et d’Informatique Appliquée
 * Script d'interactivité : Navigation, Modales, Lightbox, Compteurs & Scroll Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initSmoothScroll();
  initScrollAnimations();
  initAnimatedCounters();
  initFormationsModal();
  initGalleryLightbox();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION FIXE & EFFET AU DÉFILEMENT
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. MENU MOBILE RESPONSIVE ACCESSIBLE
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const burgerBtn = document.querySelector('.burger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link, .mobile-drawer-footer a');

  if (!burgerBtn || !drawer || !backdrop) return;

  function toggleMenu(isOpen) {
    const currentState = burgerBtn.getAttribute('aria-expanded') === 'true';
    const newState = typeof isOpen === 'boolean' ? isOpen : !currentState;

    burgerBtn.setAttribute('aria-expanded', String(newState));
    drawer.classList.toggle('open', newState);
    backdrop.classList.toggle('open', newState);
    document.body.style.overflow = newState ? 'hidden' : '';

    if (newState) {
      drawer.querySelector('a, button')?.focus();
    }
  }

  burgerBtn.addEventListener('click', () => toggleMenu());
  backdrop.addEventListener('click', () => toggleMenu(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
      burgerBtn.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   3. NAVIGATION FLUIDE & ANCRES ACTIVES
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mise à jour de la classe active au scroll
  window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY + 100;
    sections.forEach(section => {
      const id = section.getAttribute('id');
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const navLink = document.querySelector(`.nav-menu a[href="#${id}"]`);

      if (navLink) {
        if (scrollPos >= top && scrollPos < top + height) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   4. ANIMATIONS D'APPARITION AU SCROLL (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. COMPTEURS ANIMÉS DES CHIFFRES CLÉS
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const animateCounter = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fonction d'accélération fluide (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * (target - start) + start);

      element.textContent = currentVal.toLocaleString('fr-FR');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString('fr-FR');
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/* --------------------------------------------------------------------------
   6. MODALE D'INFORMATIONS DÉTAILLÉES DES FORMATIONS
   -------------------------------------------------------------------------- */
const formationsData = {
  bt: {
    tag: 'Brevet de Technicien · Niveau Secondaire Professionnel',
    title: 'BT Électronique',
    description: 'Formation orientée vers l’étude, l’installation, la maintenance et le dépannage des systèmes électroniques.',
    objectifs: [
      'Maîtrise des mesures électriques et des instruments de test de laboratoire (oscilloscopes, multimètres, générateurs de signaux).',
      'Diagnostic, dépannage et maintenance préventive des circuits et cartes électroniques.',
      'Soudure et câblage technique selon les normes industrielles de précision.',
      'Compréhension des schémas fonctionnels et logiques des systèmes embarqués.'
    ],
    perspectives: [
      'Technicien de maintenance électronique en entreprise industrielle ou télécoms.',
      'Technicien de service après-vente et d’installation d’équipements.',
      'Poursuite d’études supérieures vers le BTS Système Électronique et Informatique.'
    ],
    modalites: 'Formation initiale au LPELIA (Treichville). Les modalités détaillées d’admission et calendrier officiel sont communiqués lors de la session annuelle d’orientation du Ministère de l’Enseignement Technique.'
  },
  bts: {
    tag: 'Brevet de Technicien Supérieur · Niveau Supérieur Court (Bac+2)',
    title: 'BTS Système Électronique et Informatique',
    description: 'Formation dédiée aux systèmes électroniques, à l’informatique appliquée, aux réseaux et aux technologies numériques.',
    objectifs: [
      'Conception et interfaçage matériel et logiciel (microcontrôleurs, cartes connectées).',
      'Administration et configuration de réseaux locaux, câblage structuré et protocoles IP.',
      'Développement d’applications logicielles appliquées au contrôle des équipements techniques.',
      'Gestion de projets technologiques et maintenance des infrastructures numériques.'
    ],
    perspectives: [
      'Technicien supérieur en systèmes numériques et télécommunications.',
      'Administrateur réseau et technicien support informatique d’entreprise.',
      'Intégrateur de solutions domotiques, robotiques et électroniques industrielles.'
    ],
    modalites: 'Formation accessible aux titulaires du Baccalauréat technique ou du Brevet de Technicien (BT). Inscriptions et affectations selon les procédures réglementaires officielles.'
  }
};

function initFormationsModal() {
  const modalOverlay = document.getElementById('formationModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const buttons = document.querySelectorAll('[data-formation-trigger]');

  if (!modalOverlay || !modalCloseBtn) return;

  function openModal(formationKey) {
    const data = formationsData[formationKey];
    if (!data) return;

    document.getElementById('modalTag').textContent = data.tag;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalDescription').textContent = data.description;

    const objList = document.getElementById('modalObjectifsList');
    objList.innerHTML = '';
    data.objectifs.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      objList.appendChild(li);
    });

    const persList = document.getElementById('modalPerspectivesList');
    persList.innerHTML = '';
    data.perspectives.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      persList.appendChild(li);
    });

    document.getElementById('modalModalitesText').textContent = data.modalites;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-formation-trigger');
      openModal(key);
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   7. LIGHTBOX DE LA GALERIE ÉDITORIALE
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const lightboxOverlay = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightboxOverlay || !lightboxImg || !galleryItems.length) return;

  function openLightbox(item) {
    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-caption-title')?.textContent || '';
    const tag = item.querySelector('.gallery-caption-tag')?.textContent || '';

    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Photographie LPELIA';
    lightboxCaption.textContent = title ? `${title} — ${tag}` : '';

    lightboxOverlay.classList.add('open');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('open');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/* --------------------------------------------------------------------------
   8. GESTION DU FORMULAIRE DE CONTACT
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('lpeliaContactForm');
  const feedback = document.getElementById('formFeedback');

  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();

    if (!name || !email) {
      alert('Veuillez renseigner votre nom et votre adresse email.');
      return;
    }

    // Affichage d'un retour clair et élégant
    feedback.textContent = `Merci ${name}, votre message a bien été pris en compte. L’administration du LPELIA traitera votre demande.`;
    feedback.className = 'form-feedback-message success';
    form.reset();

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 6000);
  });
}
