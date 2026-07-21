/* ============================================================
   kpi-detail.js — Tabela por ano nos cards de KPI (expansível)
   ============================================================ */

/* eslint-disable no-unused-vars */

/* Métrica calculada por ano para cada KPI, respeitando os filtros ativos */
function kpiByYear(kpiId){
  const all = getF();
  const acc = dedup(all);
  const years = [...new Set(RAW.map(r=>col(r,'ANO')).filter(Boolean))].sort();

  return years.map(y=>{
    const allY = all.filter(r=>col(r,'ANO')===y);
    const accY = acc.filter(r=>col(r,'ANO')===y);
    let v;
    switch(kpiId){
      case 'k1': v = accY.length; break;                                              // Acidentes únicos
      case 'k2': v = allY.length; break;                                              // Envolvidos totais
      case 'k3': v = allY.filter(r=>col(r,'ESTADO FÍSICO')==='FERIDO').length; break; // Feridos
      case 'k4': v = allY.filter(r=>col(r,'ESTADO FÍSICO')==='ÓBITO').length;  break; // Óbitos
      default:   v = 0;
    }
    return [y, v];
  }).filter(([,v]) => v > 0 || true); // mantém anos com 0 para visão completa
}

function toggleKpiDetail(kpiId){
  const card = document.querySelector('.kpi.'+kpiId);
  const detail = document.getElementById(kpiId+'-detail');
  const isOpen = card.classList.contains('open');

  // Fecha os outros KPIs abertos
  document.querySelectorAll('.kpi.open').forEach(c=>{
    if(c !== card) c.classList.remove('open');
  });

  if(isOpen){
    card.classList.remove('open');
    return;
  }

  const rows = kpiByYear(kpiId);
  const max  = Math.max(1, ...rows.map(r=>r[1]));

  detail.innerHTML = rows.map(([year,val])=>`
    <div class="kpi-row">
      <span class="kpi-row-year">${year}</span>
      <span class="kpi-row-bar-wrap"><span class="kpi-row-bar" style="width:${(val/max*100).toFixed(0)}%"></span></span>
      <span class="kpi-row-val">${val.toLocaleString('pt-BR')}</span>
    </div>`).join('') || '<div class="kpi-row-empty">Sem dados de ano disponíveis</div>';

  card.classList.add('open');
}

/* Fecha o detalhe aberto ao clicar fora de qualquer card de KPI */
document.addEventListener('click', e=>{
  if(!e.target.closest('.kpi')){
    document.querySelectorAll('.kpi.open').forEach(c=>c.classList.remove('open'));
  }
});
