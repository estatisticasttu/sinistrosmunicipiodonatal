/* ============================================================
   multiselect.js — Dropdown de seleção múltipla (checkboxes)
   Usado pelos filtros da sidebar (Ano, Bairro, Via, etc.)
   ============================================================ */

/* eslint-disable no-unused-vars */

/* Estado interno: lista de valores disponíveis por dropdown id */
const MS_OPTIONS = {};

/* Constrói o dropdown a partir de uma lista de valores possíveis */
function buildMultiSel(id, values){
  MS_OPTIONS[id] = values;
  const root = document.getElementById(id);
  if(!root) return;
  root.innerHTML = `
    <button type="button" class="ms-trigger" onclick="toggleMultiSel('${id}')">
      <span class="ms-trigger-label" id="${id}-label">Todos</span>
      <span class="ms-trigger-arrow">▾</span>
    </button>
    <div class="ms-panel" id="${id}-panel">
      <div class="ms-panel-actions">
        <button type="button" onclick="msSelectAll('${id}')">Marcar todos</button>
        <button type="button" onclick="msClearAll('${id}')">Limpar</button>
      </div>
      <div class="ms-options">
        ${values.map(v => `
          <label class="ms-opt">
            <input type="checkbox" value="${escAttr(v)}" onchange="msOnChange('${id}')">
            <span>${escHtml(v)}</span>
          </label>`).join('')}
      </div>
    </div>`;
}

function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s){ return String(s).replace(/"/g,'&quot;'); }

/* Chave de filtro (F) correspondente a cada id de dropdown */
function msKeyFor(id){
  return Object.entries(FMAP).find(([,domId]) => domId === id)?.[0];
}

/* Abre/fecha o painel, fechando os demais */
function toggleMultiSel(id){
  document.querySelectorAll('.ms-panel.open').forEach(p=>{
    if(p.id !== id+'-panel') p.classList.remove('open');
  });
  document.getElementById(id+'-panel').classList.toggle('open');
}

document.addEventListener('click', e=>{
  if(!e.target.closest('.ms-wrap')) {
    document.querySelectorAll('.ms-panel.open').forEach(p=>p.classList.remove('open'));
  }
});

function msSelectAll(id){
  document.querySelectorAll('#'+id+'-panel input[type=checkbox]').forEach(c=>c.checked=true);
  msOnChange(id);
}
function msClearAll(id){
  document.querySelectorAll('#'+id+'-panel input[type=checkbox]').forEach(c=>c.checked=false);
  msOnChange(id);
}

function msOnChange(id){
  const checked = [...document.querySelectorAll('#'+id+'-panel input[type=checkbox]:checked')].map(c=>c.value);
  updMultiSelLabel(id, checked);
  const key = msKeyFor(id);
  if(key) applyMultiF(key, checked);
}

/* Atualiza o texto do botão (Todos / valor único / "N selecionados") e os checkboxes marcados */
function updMultiSelLabel(id, selected){
  const label = document.getElementById(id+'-label');
  if(label){
    if(!selected || !selected.length) label.textContent = 'Todos';
    else if(selected.length === 1) label.textContent = selected[0].length>16 ? selected[0].slice(0,15)+'…' : selected[0];
    else label.textContent = selected.length + ' selecionados';
  }
  document.querySelectorAll('#'+id+'-panel input[type=checkbox]').forEach(c=>{
    c.checked = (selected||[]).includes(c.value);
  });
}
