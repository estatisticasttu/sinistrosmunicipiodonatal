/* ============================================================
   filters.js — Gerenciamento de filtros (multi-seleção) e helpers
   ============================================================ */

/* eslint-disable no-unused-vars */

/* ── Helpers ─────────────────────────────────────────────── */
function setStatus(t){ document.getElementById('status').textContent = t; }
function col(row, name){ return (row[name] || '').trim(); }

function dedup(rows){
  const s = new Set(), res = [];
  for(const r of rows){
    const b = col(r,'NÚMERO BOAT');
    if(b && !s.has(b)){ s.add(b); res.push(r); }
  }
  return res;
}

function countBy(rows, field){
  const m = {};
  for(const r of rows){ const v = col(r,field)||'N/I'; m[v] = (m[v]||0)+1; }
  return Object.entries(m).sort((a,b) => b[1]-a[1]);
}

/* ── Cada chave de F agora guarda um ARRAY de valores selecionados ─ */
/* Ex: F.ano = ['2022','2023']  →  registros cujo ANO está em [2022,2023] */

function matchesField(row, field, key){
  const sel = F[key];
  if(!sel || !sel.length) return true;
  const v = col(row, field);
  return sel.includes(v);
}

/* ── Filtro principal ────────────────────────────────────── */
function getF(){
  let d = RAW;
  if(F.ano    && F.ano.length)    d = d.filter(r => F.ano.includes(col(r,'ANO')));
  if(F.mes    && F.mes.length)    d = d.filter(r => F.mes.includes(col(r,'MÊS')));
  if(F.per    && F.per.length)    d = d.filter(r => F.per.includes(col(r,'PERÍODO DO DIA')));
  if(F.bairro && F.bairro.length) d = d.filter(r => F.bairro.includes(col(r,'BAIRRO')));
  if(F.via    && F.via.length)    d = d.filter(r => F.via.includes(col(r,'VIA')));
  if(F.zona   && F.zona.length)   d = d.filter(r => F.zona.includes(col(r,'VIA ZONA')));
  if(F.nat    && F.nat.length)    d = d.filter(r => F.nat.includes(col(r,'NATUREZA')));
  if(F.veic   && F.veic.length)   d = d.filter(r => F.veic.includes(col(r,'TIPO VEÍCULO')));
  if(F.cat    && F.cat.length)    d = d.filter(r => F.cat.includes(col(r,'CATEGORIA')));
  if(F.sexo   && F.sexo.length)   d = d.filter(r => F.sexo.includes(col(r,'SEXO')));
  if(F.ef     && F.ef.length)     d = d.filter(r => F.ef.includes(col(r,'ESTADO FÍSICO')));
  if(F.dia    && F.dia.length)    d = d.filter(r => F.dia.includes(col(r,'DIA DA SEMANA')));
  if(F.hora   && F.hora.length)   d = d.filter(r => F.hora.includes((col(r,'HORA ACIDENTE')||'').slice(0,2)));
  if(F.tempo  && F.tempo.length)  d = d.filter(r => F.tempo.includes(col(r,'CONDIÇÃO TEMPO')));
  if(F.pista  && F.pista.length)  d = d.filter(r => F.pista.includes(col(r,'CONDIÇÃO PISTA')));
  if(F.tpista && F.tpista.length) d = d.filter(r => F.tpista.includes(col(r,'TIPO PISTA')));
  if(F.fmt    && F.fmt.length)    d = d.filter(r => F.fmt.includes(col(r,'FORMATO PISTA')) || F.fmt.includes(col(r,'GEOMETRIA')));
  if(F.tlum   && F.tlum.length)   d = d.filter(r => F.tlum.includes(col(r,'TIPO ILUMINAÇÃO')) || F.tlum.includes(col(r,'TIPO ILUMINACAO')));
  if(F.sinal  && F.sinal.length)  d = d.filter(r => F.sinal.some(v => (col(r,'SINALIZAÇÃO')||col(r,'SINALIZACAO')||'').includes(v)));
  if(F.lum    && F.lum.length)    d = d.filter(r => F.lum.includes(col(r,'CONDIÇÃO LUMINOSIDADE').toUpperCase().trim()));
  if(F.marca  && F.marca.length)  d = d.filter(r => F.marca.includes(col(r,'MARCA')));
  if(F.faixa  && F.faixa.length)  d = d.filter(r => F.faixa.includes(col(r,'FAIXA ETÁRIA')));
  return d;
}

/* ── Mapa de filtros vinculados aos dropdowns multi-select da sidebar ── */
const FMAP = {
  ano:'fano', mes:'fmes', per:'fper', bairro:'fbairro', via:'fvia',
  zona:'fzona', nat:'fnat', veic:'fveic', cat:'fcat', sexo:'fsexo', ef:'fef'
};

const FLBL = {
  ano:'Ano', mes:'Mês', per:'Período', bairro:'Bairro', via:'Via', zona:'Zona',
  nat:'Natureza', veic:'Veículo', cat:'Categoria', sexo:'Sexo', ef:'Estado Físico',
  dia:'Dia', hora:'Hora', tempo:'Tempo', pista:'Condição da pista',
  tpista:'Tipo de pista', fmt:'Geometria', tlum:'Tipo de iluminação',
  sinal:'Sinalização', lum:'Luminosidade', marca:'Marca', faixa:'Faixa Etária'
};

/* ── Ações de filtro ─────────────────────────────────────── */

/* Clique em gráfico/mapa: alterna um único valor dentro do array da chave.
   Mantém a mesma assinatura setF(chave, valor) usada em charts.js/maps.js. */
function setF(k, v){
  if(!F[k]) F[k] = [];
  const i = F[k].indexOf(v);
  if(i >= 0) F[k].splice(i,1); else F[k].push(v);
  if(!F[k].length) delete F[k];
  syncSels(); updChips(); renderAll(); updMap();
}

/* Define exatamente o conjunto de valores de uma chave (sem toggle, sem re-render). */
function setExactFSilent(k, values){
  if(values && values.length) F[k] = [...values]; else delete F[k];
}

/* Clique em barra agrupada por ano: alterna a categoria E fixa o ano exato. */
function setFCategoryAndYear(categoryKey, categoryValue, year){
  if(!F[categoryKey]) F[categoryKey] = [];
  const i = F[categoryKey].indexOf(categoryValue);
  if(i >= 0) F[categoryKey].splice(i,1); else F[categoryKey].push(categoryValue);
  if(!F[categoryKey].length) delete F[categoryKey];
  setExactFSilent('ano', [year]);
  syncSels(); updChips(); renderAll(); updMap();
}

/* Aplica seleção múltipla vinda dos dropdowns customizados da sidebar */
function applyMultiF(key, values){
  if(values && values.length) F[key] = values; else delete F[key];
  updChips(); renderAll(); updMap();
}

function resetAll(){ F = {}; syncSels(); updChips(); renderAll(); updMap(); }

/* Sincroniza o texto exibido em cada dropdown multi-select com o estado atual de F */
function syncSels(){
  Object.entries(FMAP).forEach(([k,id]) => updMultiSelLabel(id, F[k]||[]));
}

function updChips(){
  const chips = [];
  Object.entries(F).forEach(([k,arr])=>{
    (arr||[]).forEach(v=>{
      chips.push(`<div class="chip" onclick="setF('${k}','${v.replace(/'/g,"\\'")}')">
        <b>${FLBL[k]}:</b>&nbsp;${v.length>12?v.slice(0,11)+'…':v}&nbsp;✕</div>`);
    });
  });
  document.getElementById('chips').innerHTML = chips.join('');
}

/* ── Popula os dropdowns multi-select da sidebar ─────────── */
function populateSels(){
  const acc = dedup(RAW);
  function fill(id, field, src, ord){
    let vals = [...new Set(src.map(r => col(r,field)).filter(Boolean))];
    if(ord) vals = ord.filter(x => vals.includes(x));
    else vals.sort();
    buildMultiSel(id, vals);
  }
  fill('fano',    'ANO',           acc);
  fill('fmes',    'MÊS',           acc, MESES);
  fill('fper',    'PERÍODO DO DIA',acc, ['MADRUGADA','MANHÃ','TARDE','NOITE','NÃO IDENTIFICADO']);
  fill('fbairro', 'BAIRRO',        acc);
  fill('fvia',    'VIA',           acc);
  fill('fzona',   'VIA ZONA',      acc);
  fill('fnat',    'NATUREZA',      acc);
  fill('fveic',   'TIPO VEÍCULO',  RAW);
  fill('fcat',    'CATEGORIA',     RAW);
  fill('fsexo',   'SEXO',          RAW);
  fill('fef',     'ESTADO FÍSICO', RAW, ['ILESO','FERIDO','ÓBITO','NÃO IDENTIFICADO']);
}
