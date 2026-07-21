/* ============================================================
   gmaps-config.js — Chave de API do Google Maps
   ============================================================

   COMO OBTER UMA CHAVE:
   1. Acesse https://console.cloud.google.com/
   2. Crie um projeto (ou use um existente)
   3. Em "APIs e serviços → Biblioteca", ative:
      • Maps JavaScript API
      • Street View Static API
   4. Em "APIs e serviços → Credenciais → Criar credenciais
      → Chave de API", copie a chave gerada
   5. (Recomendado) Restrinja a chave por domínio HTTP
      para evitar uso indevido — ex: seu-usuario.github.io/*
   6. Cole a chave abaixo, entre as aspas

   SEM A CHAVE: o dashboard funciona normalmente. O satélite
   (Esri) e os modos calor/pontos continuam funcionando sem
   nenhuma chave. Apenas o botão Street View mostrará um aviso.
   ============================================================ */

const GOOGLE_MAPS_API_KEY = ''; // ← cole sua chave aqui

/* Não edite abaixo desta linha */
const GMAPS_KEY_CONFIGURED = !!(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 10);
