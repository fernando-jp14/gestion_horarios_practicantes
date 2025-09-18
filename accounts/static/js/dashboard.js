(function(){
  // ========= Inicialización =========
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const sections = document.querySelectorAll('.view');

  function applyActive(){
    const hash = location.hash || '#horarios';
    if(!location.hash) history.replaceState(null, '', hash);
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
    sections.forEach(sec => sec.style.display = sec.id === hash.slice(1) ? 'block' : 'none');
  }
  window.addEventListener('hashchange', applyActive);
  applyActive();

  // ========= Generar contenido dinámico =========
  const horariosSection = document.getElementById('horarios');
  horariosSection.innerHTML = `
    <div class="card">
      <div class="body">
        <h2>🗓️ Horarios de practicantes</h2>
        <div class="sub">Columnas: Nombre, Equipo, Semestre, Faltas, Recuperación</div>
        <div class="btns">
          <a class="btn primary" href="#modal-add-horario">➕ Agregar</a>
        </div>
        <div id="team-filter-bar" class="btns" style="margin:10px 0"></div>
        <div style="overflow:auto">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Equipo</th><th>Semestre</th><th>Faltas</th><th>Recuperación</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tbody-horarios"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById('tbody-horarios');
  const filterBar = document.getElementById('team-filter-bar');
  const datalist = document.getElementById('teams-list');
  const form = document.getElementById('form-add-horario');

  function getTeamFromRow(tr){
    return tr.querySelectorAll('td')[1]?.textContent?.trim() || '';
  }

  function collectTeams(){
    const set = new Set();
    tbody.querySelectorAll('tr').forEach(tr => {
      const team = getTeamFromRow(tr);
      if(team) set.add(team);
    });
    return Array.from(set).sort();
  }

  function renderTeamFilters(){
    const teams = collectTeams();
    filterBar.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'btn';
    allBtn.textContent = 'Todos';
    allBtn.onclick = ()=>applyFilter('');
    filterBar.appendChild(allBtn);
    teams.forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = team;
      btn.onclick = ()=>applyFilter(team);
      filterBar.appendChild(btn);
    });
    datalist.innerHTML = teams.map(t=>`<option value="${t}">`).join('');
  }

  function applyFilter(team){
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.style.display = team && getTeamFromRow(tr) !== team ? 'none' : '';
    });
  }

  function addRow({nombre, equipo, semestre, faltas, recupera}){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${equipo}</td>
      <td>${semestre}</td>
      <td>${faltas || ''}</td>
      <td>${recupera || ''}</td>
      <td class="btns">
        <a class="btn" href="#">👁️ Ver</a>
        <a class="btn danger" href="#" data-action="delete">🗑️</a>
      </td>`;
    tbody.appendChild(tr);
    attachDelete(tr);
    renderTeamFilters();
  }

  function attachDelete(tr){
    tr.querySelector('[data-action="delete"]').onclick = e=>{
      e.preventDefault();
      tr.remove();
      renderTeamFilters();
    }
  }

  // Evento submit
  form.addEventListener('submit', e=>{
    e.preventDefault();
    addRow({
      nombre: document.getElementById('add-nombre').value,
      equipo: document.getElementById('add-equipo').value,
      semestre: document.getElementById('add-semestre').value,
      faltas: document.getElementById('add-faltas').value,
      recupera: document.getElementById('add-recupera').value,
    });
    form.reset();
    location.hash = '#horarios';
  });

  renderTeamFilters();
})();
