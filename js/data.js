/* ============================================================
   data.js — Carregamento exclusivo via Google Sheets
   (versão online — sem suporte a upload de arquivo local)
   ============================================================ */

/* eslint-disable no-unused-vars */

/* ── Constantes de ordenação ─────────────────────────────── */
const MESES  = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
                'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const DIAS   = ['SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA',
                'QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO','DOMINGO'];
const FAIXAS = ['ATÉ 10 ANOS','11 A 19 ANOS','20 A 29 ANOS','30 A 39 ANOS',
                '40 A 49 ANOS','50 A 59 ANOS','MAIORES DE 60 ANOS'];

/* ── Fonte da planilha Google Sheets ─────────────────────── */
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1dYwyb90r-Bzf5eRxu0n8JAxYqCPiM44880bCyllZObI/export?format=csv';
const CORS_PROXY     = 'https://corsproxy.io/?url=';

/* ── Estado global ───────────────────────────────────────── */
let RAW = [], CH = {}, F = {}, lmap = null, hLayers = {}, curMap = 'all';

/* ── Boot: inicializa o dashboard após RAW estar populado ── */
function bootData(){
  if(!RAW || RAW.length < 2){ setStatus('Erro: base inválida ou vazia'); return false; }
  document.getElementById('land').style.display = 'none';
  document.getElementById('app').style.display  = 'flex';
  const boats = dedup(RAW).length;
  setStatus(RAW.length.toLocaleString('pt-BR') + ' reg · ' + boats.toLocaleString('pt-BR') + ' BOATs · Google Sheets');
  populateSels();
  renderAll();
  initMap();
  setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 500);
  setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 1200);
  return true;
}

/* ── Fetch com fallback de proxy CORS ────────────────────── */
async function fetchSheetCSV(){
  try{
    const resp = await fetch(SHEETS_CSV_URL, { cache:'no-store' });
    if(resp.ok) return await resp.text();
    throw new Error('HTTP ' + resp.status);
  } catch(e){
    const resp2 = await fetch(CORS_PROXY + encodeURIComponent(SHEETS_CSV_URL), { cache:'no-store' });
    if(resp2.ok) return await resp2.text();
    throw e;
  }
}

/* ── Carregamento automático ao abrir o dashboard ─────────── */
async function loadFromSheets(){
  const landStatus = document.getElementById('land-status');
  const spinner    = document.getElementById('land-spinner');
  if(landStatus) landStatus.textContent = 'Conectando à planilha do Google Sheets...';

  try{
    const text   = await fetchSheetCSV();
    const parsed = parseCSV(text);
    if(parsed.length < 2) throw new Error('Planilha vazia ou em formato inesperado');
    RAW = parsed;
    bootData();
  } catch(err){
    console.warn('Falha ao carregar do Google Sheets:', err);
    if(spinner) spinner.style.display = 'none';
    if(landStatus){
      landStatus.innerHTML =
        '⚠️ Não foi possível carregar a planilha.<br>' +
        'Verifique se ela está compartilhada como <b>"Qualquer pessoa com o link"</b> ' +
        'e se o dashboard está sendo acessado por <b>http(s)://</b>.<br><br>' +
        '<button class="land-btn" style="font-size:12px;padding:8px 20px" ' +
        'onclick="loadFromSheets()">Tentar novamente</button>';
      landStatus.style.color = 'var(--amber)';
    }
  }
}

/* ── Recarrega a planilha de dentro do dashboard ──────────── */
async function reloadFromSheets(){
  setStatus('Atualizando da planilha...');
  try{
    const text   = await fetchSheetCSV();
    const parsed = parseCSV(text);
    if(parsed.length < 2) throw new Error('Planilha vazia');
    RAW = parsed;
    F = {}; syncSels(); updChips();
    bootData();
  } catch(err){
    console.warn('Falha ao atualizar:', err);
    setStatus('⚠️ Erro ao atualizar — mantendo dados atuais');
  }
}

/* ── Parser CSV ──────────────────────────────────────────── */
function parseCSV(txt){
  if(txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
  const lines = txt.replace(/\r/g,'').split('\n').filter(l=>l.trim());
  if(!lines.length) return [];
  const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
  const hdrs = splitL(lines[0], sep);
  return lines.slice(1).map(line => {
    const v = splitL(line, sep), row = {};
    hdrs.forEach((h,i) => row[h] = (v[i]||'').trim());
    return row;
  });
}

function splitL(line, sep){
  const p = []; let cur = '', inQ = false;
  for(let i = 0; i < line.length; i++){
    const c = line[i];
    if(c === '"'){ inQ = !inQ; }
    else if(c === sep && !inQ){ p.push(cur.replace(/^"|"$/g,'')); cur = ''; }
    else cur += c;
  }
  p.push(cur.replace(/^"|"$/g,''));
  return p;
}
