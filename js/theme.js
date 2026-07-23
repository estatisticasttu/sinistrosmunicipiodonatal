/* ============================================================
   theme.js — Alternância de tema claro / escuro
   ============================================================ */

/* eslint-disable no-unused-vars */

let LIGHT_MODE = true;

function toggleTheme(){
  LIGHT_MODE = !LIGHT_MODE;
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  if(LIGHT_MODE){
    html.classList.remove('dark');
    btn.textContent = '☀️ Claro';
  } else {
    html.classList.add('dark');
    btn.textContent = '🌙 Escuro';
  }

  /* URL determinada APÓS a classe já ter sido aplicada acima,
     usando DARK_MODE (não classList.contains) para evitar
     qualquer timing race com a renderização do DOM. */
  const newUrl = DARK_MODE
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  /* Troca tile apenas nos mapas que estão no modo "rua" (não satélite) */
  const allStates = [MAP_STATE.all, MAP_STATE.ferido, MAP_STATE.obito, FS_STATE];
  allStates.forEach(st=>{
    if(st.map && st.tileLayer && st.mapType !== 'satellite'){
      st.map.removeLayer(st.tileLayer);
      st.tileLayer = L.tileLayer(newUrl, { attribution:'© OSM © CARTO', maxZoom:19 }).addTo(st.map);
    }
  });

  /* Re-renderiza gráficos com as novas cores do tema */
  if(typeof renderAll === 'function' && CH && Object.keys(CH).length) renderAll();
}
