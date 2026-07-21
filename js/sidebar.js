/* ============================================================
   sidebar.js — Recolher / expandir a sidebar de filtros
   ============================================================ */

/* eslint-disable no-unused-vars */

let SIDEBAR_COLLAPSED = false;

function toggleSidebar(){
  SIDEBAR_COLLAPSED = !SIDEBAR_COLLAPSED;
  document.getElementById('app').classList.toggle('sb-collapsed', SIDEBAR_COLLAPSED);
  const btn = document.getElementById('sb-collapse-btn');
  if(btn) btn.textContent = SIDEBAR_COLLAPSED ? '▸' : '◂';

  // Mapas Leaflet precisam recalcular o tamanho após a sidebar mudar de largura
  setTimeout(()=>{
    ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t] && MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); });
  }, 320);
}

/* Em telas pequenas, a sidebar inicia recolhida automaticamente */
function initSidebarResponsive(){
  if(window.innerWidth <= 860){
    SIDEBAR_COLLAPSED = true;
    document.getElementById('app').classList.add('sb-collapsed');
    const btn = document.getElementById('sb-collapse-btn');
    if(btn) btn.textContent = '▸';
  }
}
document.addEventListener('DOMContentLoaded', initSidebarResponsive);
