/* ============================================================
   streetview.js — Street View embutido (Google Maps JS API)
   ============================================================ */

/* eslint-disable no-unused-vars */

let _gmapsLoading = null; // Promise compartilhada — evita carregar o script duas vezes

/* Carrega o script da API do Google Maps uma única vez (lazy) */
function _loadGmaps(){
  if(window.google && window.google.maps) return Promise.resolve();
  if(_gmapsLoading) return _gmapsLoading;
  _gmapsLoading = new Promise((res, rej)=>{
    const s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY) + '&v=weekly';
    s.async = true;
    s.onload  = ()=>res();
    s.onerror = ()=>rej(new Error('Falha ao carregar Google Maps JS API'));
    document.head.appendChild(s);
  });
  return _gmapsLoading;
}

/* Retorna o centro atual do mapa Leaflet do card, para abrir o Street
   View já posicionado na área visível. Fallback: centro de Natal/RN */
function _mapCenter(type){
  const st = type==='fs' ? FS_STATE : MAP_STATE[type];
  if(st && st.map){ const c = st.map.getCenter(); return { lat:c.lat, lng:c.lng }; }
  return { lat:-5.805, lng:-35.210 };
}

function _svPanelId(type){ return type==='fs' ? 'fs-streetview' : 'map-'+type+'-streetview'; }
function _svBtnId(type)  { return type==='fs' ? 'fs-sv-btn'     : 'sv-btn-'+type; }

/* Abre o painel de Street View sobre o card indicado */
function openStreetView(type){
  const panelEl = document.getElementById(_svPanelId(type));
  const btnEl   = document.getElementById(_svBtnId(type));
  if(!panelEl) return;

  if(!GMAPS_KEY_CONFIGURED){
    panelEl.style.display = 'flex';
    panelEl.innerHTML = `
      <div class="sv-msg">
        🔑 <b>Street View não configurado</b><br>
        Edite <code>js/gmaps-config.js</code> e adicione sua chave de API do Google Maps.<br>
        As instruções estão comentadas no arquivo.<br><br>
        <button class="btn-sb" style="width:auto;padding:5px 14px" onclick="closeStreetView('${type}')">Fechar</button>
      </div>`;
    if(btnEl) btnEl.classList.add('active');
    return;
  }

  panelEl.style.display = 'flex';
  panelEl.innerHTML = '<div class="sv-msg"><div class="spin"></div>Carregando Street View…</div>';
  if(btnEl) btnEl.classList.add('active');

  _loadGmaps().then(()=>{
    const center = _mapCenter(type);
    const svc = new google.maps.StreetViewService();
    svc.getPanorama({ location:center, radius:400 }, (data, status)=>{
      panelEl.innerHTML = '';
      if(status === 'OK'){
        new google.maps.StreetViewPanorama(panelEl, {
          position: data.location.latLng,
          pov: { heading:0, pitch:0 }, zoom:1,
          addressControl:true, fullscreenControl:false, motionTrackingControl:false,
        });
      } else {
        panelEl.innerHTML = `
          <div class="sv-msg">
            📍 Nenhuma imagem do Street View disponível para este ponto.<br>
            Mova ou aproxime o mapa e tente novamente.<br><br>
            <button class="btn-sb" style="width:auto;padding:5px 14px" onclick="closeStreetView('${type}')">Fechar</button>
          </div>`;
      }
    });
  }).catch(err=>{
    console.error(err);
    panelEl.innerHTML = `
      <div class="sv-msg">
        ⚠️ Erro ao carregar o Google Maps.<br>Verifique sua chave de API e conexão.<br><br>
        <button class="btn-sb" style="width:auto;padding:5px 14px" onclick="closeStreetView('${type}')">Fechar</button>
      </div>`;
  });
}

/* Fecha o painel de Street View e revalida o mapa Leaflet */
function closeStreetView(type){
  const panelEl = document.getElementById(_svPanelId(type));
  const btnEl   = document.getElementById(_svBtnId(type));
  if(panelEl){ panelEl.style.display='none'; panelEl.innerHTML=''; }
  if(btnEl) btnEl.classList.remove('active');
  const st = type==='fs' ? FS_STATE : MAP_STATE[type];
  setTimeout(()=>{ if(st && st.map) st.map.invalidateSize(); }, 60);
}

/* Alterna abrir/fechar */
function toggleStreetView(type){
  const panelEl = document.getElementById(_svPanelId(type));
  if(panelEl && panelEl.style.display==='flex') closeStreetView(type);
  else openStreetView(type);
}
