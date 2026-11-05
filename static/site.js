(() => {
  const searchForm = document.querySelector('[data-project-search]');
  const projectCards = [...document.querySelectorAll('[data-project-card]')];

  if (!searchForm || projectCards.length === 0) return;

  const searchInput = searchForm.querySelector('input[type="search"]');
  const count = document.querySelector('[data-result-count]');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const emptyState = document.querySelector('[data-empty-state]');
  const params = new URLSearchParams(window.location.search);
  const activeFilters = {
    category: params.get('category') || 'All',
    status: params.get('status') || 'All',
    technology: params.get('technology') || 'All',
    search: params.get('search') || '',
  };

  searchInput.value = activeFilters.search;

  function applyFilters(updateUrl = false) {
    let visibleCount = 0;

    for (const card of projectCards) {
      const matches = (
        (activeFilters.category === 'All' || card.dataset.category === activeFilters.category)
        && (activeFilters.status === 'All' || card.dataset.status === activeFilters.status)
        && (activeFilters.technology === 'All'
          || card.dataset.technologies.split('|').includes(activeFilters.technology))
        && (!activeFilters.search
          || card.dataset.search.includes(activeFilters.search.trim().toLowerCase()))
      );
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    if (count) count.textContent = String(visibleCount);
    if (emptyState) emptyState.hidden = visibleCount > 0;

    for (const button of filterButtons) {
      const selected = activeFilters[button.dataset.filter] === button.dataset.value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }

    if (updateUrl) {
      const next = new URLSearchParams();
      for (const key of ['category', 'status', 'technology', 'search']) {
        const value = activeFilters[key].trim();
        if (value && value !== 'All') next.set(key, value);
      }
      const query = next.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    activeFilters.search = searchInput.value;
    applyFilters(true);
  });

  searchInput.addEventListener('input', () => {
    activeFilters.search = searchInput.value;
    applyFilters(true);
  });

  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      activeFilters[button.dataset.filter] = button.dataset.value;
      applyFilters(true);
    });
  }

  for (const clearButton of document.querySelectorAll('[data-clear-filters]')) {
    clearButton.addEventListener('click', () => {
      activeFilters.category = 'All';
      activeFilters.status = 'All';
      activeFilters.technology = 'All';
      activeFilters.search = '';
      searchInput.value = '';
      applyFilters(true);
    });
  }

  applyFilters();
})();
