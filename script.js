document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const cursorGlow = document.getElementById('cursorGlow');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = Array.from(document.querySelectorAll('.photo-card'));
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCat = document.getElementById('lbCat');
  const lbTitle = document.getElementById('lbTitle');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let currentFilter = 'all';
  let visibleLimit = 10;
  const stepIncrement = 10;
  let activeCards = [];
  let currentIndex = 0;

  // Deteta se é dispositivo tátil (telemóvel/tablet)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 1. Efeito de luz que segue o rato (apenas em desktop)
  if (!isTouchDevice && cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  // 2. Header dinâmico no scroll
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // 3. Contadores automáticos nas categorias
  document.getElementById('count-all').textContent = `(${cards.length})`;
  ['sol', 'mar', 'natureza'].forEach(cat => {
    const count = cards.filter(c => c.dataset.category === cat).length;
    const el = document.getElementById(`count-${cat}`);
    if (el) el.textContent = `(${count})`;
  });

  // 4. Efeito Tilt 3D subtil ao passar o rato (apenas desktop)
  if (!isTouchDevice) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.01)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) scale(1)';
      });
    });
  }

  // 5. Renderizar Galeria com Filtros & Paginação
  function renderGallery() {
    const filtered = cards.filter(card => currentFilter === 'all' || card.dataset.category === currentFilter);

    cards.forEach(card => card.classList.add('hidden-item'));

    filtered.slice(0, visibleLimit).forEach((card, idx) => {
      card.classList.remove('hidden-item', 'fade-in');
      void card.offsetWidth;
      card.style.animationDelay = `${(idx % 6) * 0.06}s`;
      card.classList.add('fade-in');
    });

    activeCards = filtered;
    loadMoreBtn.classList.toggle('hidden', visibleLimit >= filtered.length);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      visibleLimit = 10;
      renderGallery();
    });
  });

  loadMoreBtn.addEventListener('click', () => {
    visibleLimit += stepIncrement;
    renderGallery();
  });

  // 6. Animações de Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // 7. Lightbox Interativo + Suporte Swipe no Telemóvel
  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const card = activeCards[currentIndex];
    const img = card.querySelector('img');
    lbImg.src = img.src;
    lbCat.textContent = card.dataset.category;
    lbTitle.textContent = card.dataset.title || img.alt;
    lbCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(activeCards.length).padStart(2, '0')}`;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + activeCards.length) % activeCards.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % activeCards.length;
    updateLightbox();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = activeCards.indexOf(card);
      if (idx !== -1) openLightbox(idx);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Gestos de deslizar (Swipe) no Lightbox para telemóvel
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showNext();
      else showPrev();
    }
  }, { passive: true });

  renderGallery();
});