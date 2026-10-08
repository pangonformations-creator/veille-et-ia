(() => {
  const key = 'ikea-mission-progress-consignes-v3';
  const names = ["Présenter","Cadrer","Collecter","Synthétiser","Analyser","Recommander"];
  let completed = [];
  let persistent = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    completed = Array.isArray(saved) ? [...new Set(saved.filter(n => Number.isInteger(n) && n >= 1 && n <= 6))] : [];
  } catch { persistent = false; }
  const current = Number(document.body.dataset.step);
  const path = document.createElement('nav');
  path.className = 'mission-path';
  path.setAttribute('aria-label', 'Progression des six missions');
  path.innerHTML = names.map((name, i) => `<a href="etape-${i + 1}.html" class="path-stop" data-mission="${i + 1}"><span class="path-number">${i + 1}</span><span>${name}</span></a>`).join('');
  const oldLine = document.querySelector('.progress-line');
  if (oldLine) oldLine.replaceWith(path);
  else document.querySelector('.step-hero')?.after(path);
  const summary = document.querySelector('.journey-topline p') || document.createElement('p');
  summary.classList.add('progress-summary');
  summary.setAttribute('aria-live', 'polite');
  if (!summary.isConnected) path.after(summary);
  const note = document.createElement('p');
  note.className = 'progress-note';
  path.after(note);
  function update() {
    const next = names.findIndex((_, i) => !completed.includes(i + 1)) + 1;
    summary.textContent = `${completed.length} / 6 missions terminées${next ? ` · prochaine mission : ${next}` : ' · votre parcours est terminé'}`;
    note.textContent = persistent ? 'Votre progression est conservée dans ce navigateur.' : 'Votre progression reste disponible sur cette page ; ce navigateur ne permet pas de la conserver.';
    path.querySelectorAll('.path-stop').forEach((a, i) => {
      const done = completed.includes(i + 1);
      a.classList.toggle('is-complete', done);
      a.classList.toggle('is-next', i + 1 === (current || next));
      a.setAttribute('aria-label', `Mission ${i + 1} : ${names[i]}${done ? ', terminée' : ''}`);
      if (i + 1 === current) a.setAttribute('aria-current', 'step');
      a.querySelector('.path-number').textContent = done ? '✓' : i + 1;
    });
    document.querySelectorAll('.journey-card').forEach((card, i) => {
      card.classList.toggle('is-complete', completed.includes(i + 1));
      let badge = card.querySelector('.completion-badge');
      if (!badge) { badge = document.createElement('span'); badge.className = 'completion-badge'; card.querySelector('.card-heading').append(badge); }
      badge.textContent = completed.includes(i + 1) ? '✓ Terminée' : '';
    });
  }
  if (current >= 1 && current <= 6) {
    const panel = document.createElement('section');
    panel.className = 'panel mission-completion';
    panel.innerHTML = `<h2>Mission ${current} terminée ?</h2><p>Après avoir rédigé la rubrique correspondante du dossier, marquez cette étape comme terminée.</p><button type="button" class="button complete-button"></button><div class="completion-result" hidden><svg class="success-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="m14 27 8 8 16-18"/></svg><p role="status"></p><a class="button next-mission" href="${current < 6 ? `etape-${current + 1}.html` : 'index.html'}">${current < 6 ? 'Mission suivante' : 'Revoir mon parcours'}</a></div>`;
    document.querySelector('.page-controls').before(panel);
    const button = panel.querySelector('button');
    const result = panel.querySelector('.completion-result');
    function refresh() {
      const done = completed.includes(current);
      button.textContent = done ? 'Marquer comme à poursuivre' : 'Marquer la mission comme terminée';
      button.setAttribute('aria-pressed', String(done));
      result.hidden = !done;
      result.querySelector('p').textContent = done ? (completed.length === 6 ? 'Les six étapes sont terminées. Relisez les quatre parties de votre dossier.' : `Mission ${current} terminée. Votre progression est mise à jour.`) : '';
    }
    button.addEventListener('click', () => {
      completed = completed.includes(current) ? completed.filter(n => n !== current) : [...completed, current];
      try { localStorage.setItem(key, JSON.stringify(completed)); } catch { persistent = false; }
      update(); refresh();
    });
    refresh();
  }
  update();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = document.querySelectorAll('.journey-card, .panel, .hero-copy > *, .step-hero-copy > *');
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    targets.forEach((element, i) => { element.classList.add('reveal'); element.style.setProperty('--reveal-delay', `${i % 6 * 65}ms`); observer.observe(element); });
    reduce.addEventListener('change', () => { if (reduce.matches) { targets.forEach(el => el.classList.add('revealed')); observer.disconnect(); } });
  }
})();
