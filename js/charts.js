/* ============================================================
   charts.js — Engine de gráficos (Chart.js)
   ============================================================ */

/* eslint-disable no-unused-vars */

/* Registra o plugin de rótulos de dados globalmente (carregado via CDN no index.html) */
if(typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined'){
  Chart.register(ChartDataLabels);
  Chart.defaults.set('plugins.datalabels', { display: true });
}

/* ── Helpers de cor dinâmica (dark / light) ──────────────── */
function GR(){ return document.documentElement.classList.contains('light') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'; }
function TX(){ return document.documentElement.classList.contains('light') ? '#1a2e42' : '#c8d8e8'; }
function MU(){ return document.documentElement.classList.contains('light') ? '#5a7a96' : '#5a7a9a'; }

/* ── Criação / substituição de gráfico ───────────────────── */
function mk(id, cfg){
  if(CH[id]) CH[id].destroy();
  const c = document.getElementById(id);
  if(!c) return;
  CH[id] = new Chart(c, cfg);
}

/* ── Fábrica: gráfico de barras ──────────────────────────── */
function bar(labels, data, color, ck, h=false){
  return {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: color+'99', hoverBackgroundColor: color, borderRadius: 3, borderSkipped: false }] },
    options: {
      indexAxis: h ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: h ? {right:28} : {top:18} },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + c.raw.toLocaleString('pt-BR') } },
        datalabels: {
          color: TX(),
          font: { size: 9, weight: '600' },
          anchor: 'end',
          align: h ? 'right' : 'top',
          offset: 2,
          formatter: v => v ? v.toLocaleString('pt-BR') : ''
        }
      },
      scales: {
        x: { ticks: { color: h ? MU() : TX(), font: {size:10}, autoSkip: false, maxRotation: h ? 0 : 35 }, grid: { color: GR() }, border: { color: 'transparent' } },
        y: { ticks: { color: h ? TX() : MU(), font: {size:10} }, grid: { color: GR() }, border: { color: 'transparent' } }
      },
      onClick: ck ? (e,els) => { if(els.length) setF(ck, labels[els[0].index]); } : undefined
    }
  };
}

/* ── Paleta de cores por ano e helpers de agrupamento ───────── */
const YEAR_PALETTE = ['#00d4ff','#fbbf24','#22d3a5','#f43f5e','#a78bfa','#38bdf8','#f97316','#e879f9'];
function colorForYear(i){ return YEAR_PALETTE[i % YEAR_PALETTE.length]; }
function activeYears(){ return (F.ano && F.ano.length >= 2) ? [...F.ano].sort() : []; }

/* ── Fábrica: barras com agrupamento condicional por ano ─────
   - Quando 2+ anos estão selecionados no filtro → gera um dataset
     por ano (barras lado a lado dentro de cada categoria).
   - Com 0 ou 1 ano → barra única, idêntico ao bar() tradicional.
   - rows: registros já filtrados por getF()
   - field: campo CSV a contar (ex: 'DIA DA SEMANA')
   - categories: lista ordenada dos rótulos do eixo categórico
   - color: cor para modo barra única
   - ck: chave de filtro para onClick
   - opts.h: horizontal | opts.dedupe: deduplicar por BOAT | opts.labelMap: fn de formatação de label */
function barGrouped(rows, field, categories, color, ck, opts={}){
  const years = activeYears();
  const h = !!opts.h;
  const dispLabels = opts.labelMap ? categories.map(opts.labelMap) : categories;

  if(!years.length){
    // Barra única — comportamento original
    const src = opts.dedupe ? dedup(rows) : rows;
    const map = {};
    src.forEach(r=>{ const v=col(r,field); if(categories.includes(v)) map[v]=(map[v]||0)+1; });
    return bar(dispLabels, categories.map(c=>map[c]||0), color, ck, h);
  }

  // Agrupado por ano
  const datasets = years.map((y,i)=>{
    const src = opts.dedupe ? dedup(rows.filter(r=>col(r,'ANO')===y)) : rows.filter(r=>col(r,'ANO')===y);
    const map = {};
    src.forEach(r=>{ const v=col(r,field); if(categories.includes(v)) map[v]=(map[v]||0)+1; });
    const c = colorForYear(i);
    return {
      label: y,
      data: categories.map(cat=>map[cat]||0),
      backgroundColor: c+'bb',
      hoverBackgroundColor: c,
      borderRadius: 3,
      borderSkipped: false
    };
  });

  return {
    type: 'bar',
    data: { labels: dispLabels, datasets },
    options: {
      indexAxis: h ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: h ? {right:32} : {top:20} },
      plugins: {
        legend: { display:true, position:'top', labels:{ color:TX(), boxWidth:9, font:{size:9} } },
        tooltip: { callbacks:{ label:c=>' '+c.dataset.label+': '+c.raw.toLocaleString('pt-BR') } },
        datalabels: {
          color: TX(), font:{ size:8, weight:'600' },
          anchor:'end', align: h ? 'right' : 'top', offset:1,
          formatter: v => v ? v.toLocaleString('pt-BR') : ''
        }
      },
      scales: {
        x:{ ticks:{ color: h?MU():TX(), font:{size:10}, autoSkip:false, maxRotation: h?0:35 }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y:{ ticks:{ color: h?TX():MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: ck ? (e,els)=>{
        if(!els.length) return;
        const cat = categories[els[0].index];
        const yr  = years[els[0].datasetIndex];
        setFCategoryAndYear(ck, cat, yr);
      } : undefined
    }
  };
}

/* ── Fábrica: gráfico de rosca (doughnut) ────────────────── */
function donut(labels, data, colors, ck){
  return {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: TX(), boxWidth: 10, font: {size:10} } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: '700' },
          formatter: (v, ctx) => {
            const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
            const pct = total ? (v/total*100) : 0;
            return pct >= 5 ? pct.toFixed(0)+'%' : '';
          }
        }
      },
      onClick: ck ? (e,els) => { if(els.length) setF(ck, labels[els[0].index]); } : undefined
    }
  };
}

/* ── renderAll: reconstrói todos os gráficos ─────────────── */
function renderAll(){
  const all = getF(), acc = dedup(all);

  /* KPIs */
  document.getElementById('k1').textContent = acc.length.toLocaleString('pt-BR');
  document.getElementById('k2').textContent = all.length.toLocaleString('pt-BR');
  document.getElementById('k3').textContent = all.filter(r=>col(r,'ESTADO FÍSICO')==='FERIDO').length.toLocaleString('pt-BR');
  document.getElementById('k4').textContent = all.filter(r=>col(r,'ESTADO FÍSICO')==='ÓBITO').length.toLocaleString('pt-BR');

  /* ── TEMPORAL ────────────────────────────────────────── */
  // Evolução anual — sempre barra única (esse gráfico JÁ é por ano)
  const byYr = countBy(acc,'ANO'), anos = byYr.map(e=>e[0]).sort();
  mk('cano', bar(anos, anos.map(a=>byYr.find(e=>e[0]===a)[1]), '#00d4ff', 'ano'));

  // 1. Distribuição por mês
  const mesExist = [...new Set(acc.map(r=>col(r,'MÊS')).filter(Boolean))];
  const mesL = MESES.filter(m=>mesExist.includes(m));
  mk('cmes', barGrouped(acc,'MÊS', mesL, '#06d6b0', 'mes', {dedupe:true}));

  // 2. Acidentes por dia da semana
  const diasExist = [...new Set(acc.map(r=>col(r,'DIA DA SEMANA')).filter(Boolean))];
  const diasL = DIAS.filter(d=>diasExist.includes(d));
  mk('cdia', barGrouped(acc,'DIA DA SEMANA', diasL, '#a78bfa', 'dia', {dedupe:true}));

  // Hora — sem agrupamento (24 barras ficaria ilegível com N anos)
  const hMap = {};
  acc.forEach(r=>{ const h=col(r,'HORA ACIDENTE').slice(0,2); if(/^\d{2}$/.test(h)) hMap[h]=(hMap[h]||0)+1; });
  const hrs = Array.from({length:24},(_,i)=>String(i).padStart(2,'0'));
  mk('chora', bar(hrs, hrs.map(h=>hMap[h]||0), '#fbbf24', 'hora'));

  // 3. Período do dia
  const perOrd = ['MADRUGADA','MANHÃ','TARDE','NOITE'];
  const perExist = [...new Set(acc.map(r=>col(r,'PERÍODO DO DIA')).filter(Boolean))];
  const perL = perOrd.filter(p=>perExist.includes(p));
  mk('cper', barGrouped(acc,'PERÍODO DO DIA', perL, '#fbbf24', 'per', {dedupe:true}));

  // 4. Condição de luminosidade
  const lumRaw = countBy(acc,'CONDIÇÃO LUMINOSIDADE');
  const lumNorm = {};
  lumRaw.forEach(([k,v])=>{ const kn=k.toUpperCase().trim(); lumNorm[kn]=(lumNorm[kn]||0)+v; });
  const lumCats = Object.entries(lumNorm).filter(e=>e[0]!=='NÃO IDENTIFICADO').sort((a,b)=>b[1]-a[1]).slice(0,7).map(e=>e[0]);
  mk('clum', barGrouped(acc,'CONDIÇÃO LUMINOSIDADE', lumCats, '#a78bfa', 'lum',
    { dedupe:true, labelMap:s=>s.length>20?s.slice(0,18)+'…':s }));

  /* ── LOCALIZAÇÃO ─────────────────────────────────────── */
  // 5. Top 5 bairros (reduzido de 10 para comportar N anos lado a lado)
  const topBairros = countBy(acc,'BAIRRO').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO').slice(0,5).map(e=>e[0]);
  mk('cbairro', barGrouped(acc,'BAIRRO', topBairros, '#00d4ff', 'bairro', {dedupe:true, h:true}));

  // 6. Top 5 vias
  const topVias = countBy(acc,'VIA').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO').slice(0,5).map(e=>e[0]);
  mk('cvia', barGrouped(acc,'VIA', topVias, '#22d3a5', 'via', {dedupe:true, h:true}));

  // Zona viária — donut (sem agrupamento)
  const zonaD = countBy(acc,'VIA ZONA').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO');
  mk('czona', donut(zonaD.map(e=>e[0]), zonaD.map(e=>e[1]), ['#00d4ff','#22d3a5','#fbbf24','#f43f5e','#a78bfa'], 'zona'));

  // 7. Natureza do acidente
  const topNat = countBy(acc,'NATUREZA').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,10).map(e=>e[0]);
  mk('cnat', barGrouped(acc,'NATUREZA', topNat, '#fbbf24', 'nat',
    { dedupe:true, labelMap:s=>s.length>22?s.slice(0,20)+'…':s }));

  /* ── TIPOLOGIA E PERFIL ──────────────────────────────── */
  // Tipo veículo × estado físico — stacked (sem agrupamento por ano — já tem 3 séries)
  const topV = countBy(all,'TIPO VEÍCULO').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,7).map(e=>e[0]);
  mk('cveicef', {
    type: 'bar',
    data: { labels: topV.map(v=>v.length>16?v.slice(0,14)+'…':v), datasets: [
      { label:'Ileso',  data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='ILESO').length),  backgroundColor:'#2563eb88', borderRadius:2 },
      { label:'Ferido', data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='FERIDO').length), backgroundColor:'#fbbf2488', borderRadius:2 },
      { label:'Óbito',  data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='ÓBITO').length),  backgroundColor:'#f43f5e88', borderRadius:2 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend: { labels: { color:TX(), boxWidth:10, font:{size:10} } },
        datalabels: { color:'#fff', font:{size:8,weight:'600'}, formatter: v => v>0?v.toLocaleString('pt-BR'):'' }
      },
      scales: {
        x: { stacked:true, ticks:{ color:TX(), font:{size:9} }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y: { stacked:true, ticks:{ color:MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: (e,els) => { if(els.length) setF('veic', topV[els[0].index]); }
    }
  });

  // 8. Top 12 marcas de veículos
  const topMarcas = countBy(all,'MARCA').filter(e=>e[0]&&e[0]!=='0'&&e[0]!=='NÃO IDENTIFICADO').slice(0,12).map(e=>e[0]);
  mk('cmarca', barGrouped(all,'MARCA', topMarcas, '#06d6b0', 'marca', {h:true}));

  // Sexo — donut (sem agrupamento)
  const sxD = countBy(all,'SEXO').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('csexo', donut(sxD.map(e=>e[0]), sxD.map(e=>e[1]), ['#00d4ff','#e879f9','#22d3a5'], 'sexo'));

  // 9. Faixa etária
  const faixaExist = new Set(all.map(r=>col(r,'FAIXA ETÁRIA')).filter(Boolean));
  const fL = FAIXAS.filter(f=>faixaExist.has(f));
  mk('cfaixa', barGrouped(all,'FAIXA ETÁRIA', fL, '#06d6b0', 'faixa',
    { labelMap: f=>f.replace('ATÉ ','<').replace(' ANOS','').replace('MAIORES DE 60','60+') }));

  // Categoria — donut (sem agrupamento)
  const catD = countBy(all,'CATEGORIA').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('ccat', donut(catD.map(e=>e[0]), catD.map(e=>e[1]), ['#00d4ff','#22d3a5','#fbbf24','#f43f5e','#a78bfa','#06d6b0'], 'cat'));

  // Estado físico — donut (sem agrupamento)
  const efD = countBy(all,'ESTADO FÍSICO').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('cef', donut(efD.map(e=>e[0]), efD.map(e=>e[1]), ['#2563eb','#fbbf24','#f43f5e'], 'ef'));

  /* ── VIA E AMBIENTE ──────────────────────────────────── */
  // 10. Condição do tempo
  const topTempo = countBy(acc,'CONDIÇÃO TEMPO').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,7).map(e=>e[0]);
  mk('ctempo', barGrouped(acc,'CONDIÇÃO TEMPO', topTempo, '#38bdf8', 'tempo', {dedupe:true}));

  // 11. Condição da pista
  const topPista = countBy(acc,'CONDIÇÃO PISTA').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,8).map(e=>e[0]);
  mk('cpista', barGrouped(acc,'CONDIÇÃO PISTA', topPista, '#8b5cf6', 'pista',
    { dedupe:true, labelMap:s=>s.length>20?s.slice(0,18)+'…':s }));

  // 12. Tipo de pista (material)
  const topTpista = countBy(acc,'TIPO PISTA').filter(e=>e[0]&&!['NÃO IDENTIFICADO','BOM',' '].includes(e[0])).slice(0,6).map(e=>e[0]);
  mk('ctpista', barGrouped(acc,'TIPO PISTA', topTpista, '#06d6b0', 'tpista', {dedupe:true}));

  // 13. Geometria / Formato da pista
  function fmtCat(s){
    if(!s||s==='0') return null;
    const u = s.toUpperCase();
    for(const k of ['RETA','CRUZAMENTO','ROTATÓRIA','ENTRONCAMENTO','CURVA','DECLIVE SUAVE','ACLIVE SUAVE','BIFURCAÇÃO','RETORNO','OUTROS'])
      if(u.includes(k)) return k;
    return u.split(' ')[0];
  }
  const fmtRaw = {};
  acc.forEach(r=>{ const v=fmtCat(col(r,'FORMATO PISTA')); if(v) fmtRaw[v]=(fmtRaw[v]||0)+1; });
  const topFmt = Object.entries(fmtRaw).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
  // barGrouped para fmt precisa normalizar o campo via fmtCat — usamos rows virtuais normalizadas
  const accNormFmt = acc.map(r=>({...r,'_FMT':fmtCat(col(r,'FORMATO PISTA'))||''}));
  mk('cfmt', barGrouped(accNormFmt,'_FMT', topFmt, '#fbbf24', 'fmt', {dedupe:false}));

  // 14. Tipo de iluminação
  const tlRaw = countBy(acc,'TIPO LUMINOSIDADE');
  const tlNorm = {};
  tlRaw.forEach(([k,v])=>{ const kn=k.toUpperCase().trim(); tlNorm[kn]=(tlNorm[kn]||0)+v; });
  const topTlum = Object.entries(tlNorm).filter(e=>e[0]!=='NÃO IDENTIFICADO').sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
  const accNormTlum = acc.map(r=>({...r,'_TLUM':(col(r,'TIPO LUMINOSIDADE')||'').toUpperCase().trim()}));
  mk('ctlum', barGrouped(accNormTlum,'_TLUM', topTlum, '#fbbf24', 'tlum',
    { labelMap: s=>s.charAt(0)+s.slice(1).toLowerCase() }));

  // Sinalização — sem agrupamento (campo composto, difícil normalizar por ano)
  const sigMap = {};
  acc.forEach(r=>{
    const s = col(r,'SINALIZAÇÃO'); if(!s) return;
    const k = s.split(',')[0].trim().replace('(S)','').trim();
    if(k) sigMap[k] = (sigMap[k]||0)+1;
  });
  const sigD = Object.entries(sigMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  mk('csinal', bar(sigD.map(e=>e[0].length>20?e[0].slice(0,18)+'…':e[0]), sigD.map(e=>e[1]), '#a78bfa', 'sinal', true));

  /* ── COMPARATIVO ACIDENTES × ENVOLVIDOS POR ANO ──────── */
  const allYrs = [...new Set(RAW.map(r=>col(r,'ANO')).filter(Boolean))].sort();
  const yrAcc  = allYrs.map(y=>dedup(getF().filter(r=>col(r,'ANO')===y)).length);
  const yrEnv  = allYrs.map(y=>getF().filter(r=>col(r,'ANO')===y).length);
  mk('ccomp', {
    type: 'bar',
    data: { labels: allYrs, datasets: [
      { label:'BOATs únicos', data:yrAcc, backgroundColor:'#0ea5e988', borderRadius:3 },
      { label:'Envolvidos',   data:yrEnv, backgroundColor:'#fbbf2466', borderRadius:3 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      layout: { padding: {top:18} },
      plugins: {
        legend: { labels: { color:TX(), boxWidth:10, font:{size:10} } },
        datalabels: { color:TX(), font:{size:8,weight:'600'}, anchor:'end', align:'top', offset:1, formatter: v=>v?v.toLocaleString('pt-BR'):'' }
      },
      scales: {
        x: { ticks:{ color:TX(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y: { ticks:{ color:MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: (e,els) => { if(els.length) setF('ano', allYrs[els[0].index]); }
    }
  });

  /* Atualiza mapas com dados filtrados */
  updTripleMaps();
}
