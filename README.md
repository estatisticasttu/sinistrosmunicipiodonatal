# BI Viário SEAT · Natal/RN

Dashboard interativo de análise de sinistros de trânsito da cidade de Natal/RN, desenvolvido para o **Setor de Estatística de Sinistro de Trânsito (SEAT · STTTU)**.

---

## ✨ Funcionalidades

- **Filtros cruzados**: clique em qualquer barra ou fatia de pizza para filtrar todos os demais gráficos simultaneamente
- **Filtros multi-seleção**: todos os filtros da sidebar (Ano, Bairro, Via, Tipo de Veículo etc.) aceitam múltiplos valores selecionados ao mesmo tempo, via dropdown com checkboxes
- **Sidebar recolhível**: o menu de filtros pode ser escondido para ganhar espaço de tela, com botão para reabrir
- **KPIs expansíveis**: os 4 indicadores principais (Acidentes Únicos, Envolvidos, Feridos, Óbitos) mostram uma tabela com a evolução ano a ano ao clicar no card
- **Totalmente responsivo**: sidebar em modo off-canvas e gráficos empilhados em 1 coluna em telas de celular
- **Rótulos de dados** exibidos diretamente nas barras, colunas e fatias dos gráficos
- **20+ gráficos** cobrindo dimensões temporais, geográficas, de perfil e de infraestrutura
- **3 mapas geoespaciais** (total, feridos, óbitos) com modos calor e pontos
- **Fullscreen** para cada mapa, com troca de modo funcional
- **Tema claro / escuro** com troca dinâmica inclusive nos mapas
- **Carregamento automático via Google Sheets** ao abrir o dashboard, com fallback para upload manual de CSV se a planilha não puder ser acessada
- Botão **"Recarregar da planilha"** na sidebar para atualizar os dados sem precisar recarregar a página
- Leitura de CSV em **ISO-8859-1 ou UTF-8**, separador `;` ou `,`, sem upload para servidor (100% client-side)

---

## 📁 Estrutura do projeto

```
bi-viario/
├── index.html          # Entrada principal (HTML semântico)
├── servidor_local.py   # Servidor HTTP local com 1 clique (sem dependências)
├── css/
│   └── style.css       # Todos os estilos + variáveis de tema + responsividade
├── js/
│   ├── data.js         # Leitura, parse do CSV e estado global
│   ├── filters.js      # Lógica de filtros multi-seleção e helpers
│   ├── multiselect.js  # Componente de dropdown com checkboxes (sidebar)
│   ├── charts.js       # Engine de gráficos (Chart.js)
│   ├── maps.js         # Mapas Leaflet (3 cards + fullscreen)
│   ├── theme.js         # Alternância claro / escuro
│   ├── sidebar.js      # Recolher / expandir a sidebar
│   └── kpi-detail.js   # Tabela por ano nos cards de KPI
└── assets/
    └── logo.js         # Logo SEAT em base64 (gerado automaticamente)
```

---

## 🚀 Como usar

> ⚠️ **Importante**: o carregamento automático da planilha do Google Sheets **só funciona se o dashboard for acessado por `http://` ou `https://`**. Abrir o `index.html` com duplo-clique (URL tipo `file:///C:/Users/.../index.html`) sempre bloqueia esse recurso — é uma restrição de segurança do próprio navegador, não um bug do projeto. Nesse modo, use o upload manual de CSV normalmente.

### Opção A — servidor local com 1 clique (recomendado para quem não usa terminal)
1. Garanta que o **Python** está instalado (Windows: baixe em [python.org](https://python.org), marcando "Add Python to PATH" na instalação; a maioria das distribuições Linux/macOS já vem com Python).
2. Dê duplo-clique no arquivo **`servidor_local.py`** (está na raiz do projeto).
3. O navegador abrirá automaticamente em `http://localhost:8080` com o dashboard já carregando a planilha.
4. Para encerrar, feche a janela do terminal que abriu.

### Opção B — terminal
```bash
# Dentro da pasta bi-viario:

# Python 3
python -m http.server 8080
# ou, se "python" não for reconhecido no Windows:
py -m http.server 8080

# Node.js (alternativa)
npx serve .
```
Depois acesse `http://localhost:8080` no navegador.

### Opção C — GitHub Pages (recomendado para uso contínuo / compartilhar com a equipe)
1. Faça push do repositório para o GitHub
2. Vá em **Settings → Pages**
3. Selecione a branch `main` e pasta `/root`
4. O dashboard estará disponível em `https://<usuario>.github.io/<repo>` — já em `https://`, então o carregamento automático funciona sem nenhuma configuração extra

### Sem servidor (apenas upload manual)
Se preferir não rodar nada, pode abrir o `index.html` direto do disco — a tela de upload manual de CSV funciona normalmente nesse modo, só o carregamento automático da planilha que não fica disponível.

---

## 📡 Carregamento automático via Google Sheets

O dashboard tenta buscar os dados automaticamente da planilha configurada em `js/data.js`:

```js
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/SEU_ID/export?format=csv';
```

### Pré-requisito obrigatório
A planilha precisa estar com o compartilhamento configurado como **"Qualquer pessoa com o link pode visualizar"** (Compartilhar → Acesso geral → Qualquer pessoa com o link). Sem isso, o navegador recebe um erro de autenticação/CORS e o carregamento automático falha — nesse caso a tela de upload manual de CSV continua disponível normalmente, sem travar o dashboard.

### Como trocar a planilha
1. Publique/compartilhe a nova planilha como acima
2. Copie o ID da URL (`.../spreadsheets/d/<ID>/edit`)
3. Substitua o `SEU_ID` na constante `SHEETS_CSV_URL` em `js/data.js`

### Atualizar dados sem recarregar a página
Use o botão **"⟳ Recarregar da planilha"** na sidebar — ele busca a versão mais recente da planilha e atualiza todos os gráficos e mapas instantaneamente.

### Por que pode falhar
- **Página aberta via `file://` (duplo-clique no index.html)** — causa mais comum; sempre bloqueado por segurança do navegador, independente de qualquer configuração da planilha. Solução: use o `servidor_local.py` ou GitHub Pages.
- Planilha não compartilhada publicamente ("Qualquer pessoa com o link")
- Sem conexão com a internet
- Bloqueio de CORS por política de rede corporativa/firewall
- ID da planilha incorreto ou planilha excluída

Como contingência extra, o dashboard também tenta automaticamente um proxy CORS público (`corsproxy.io`) caso o fetch direto à planilha falhe por bloqueio de CORS — isso ajuda em alguns cenários de rede restritiva, mas não contorna o caso de `file://`, que é bloqueado antes mesmo da requisição sair do navegador.

Em qualquer um desses casos, o dashboard exibe um aviso específico na tela inicial e permanece funcional via upload manual.

---

## 📊 Formato do CSV esperado

| Campo | Descrição |
|-------|-----------|
| `NÚMERO BOAT` | Identificador único do acidente |
| `ANO`, `MÊS`, `DIA DA SEMANA`, `HORA ACIDENTE` | Dimensões temporais |
| `PERÍODO DO DIA` | MADRUGADA / MANHÃ / TARDE / NOITE |
| `BAIRRO`, `VIA`, `VIA ZONA` | Localização |
| `LOCALIZAÇÃO` | Coordenadas no formato `lat,lng` |
| `NATUREZA` | Tipo do acidente |
| `TIPO VEÍCULO`, `MARCA`, `CATEGORIA` | Perfil do veículo |
| `SEXO`, `FAIXA ETÁRIA`, `ESTADO FÍSICO` | Perfil do envolvido |
| `CONDIÇÃO TEMPO`, `CONDIÇÃO PISTA`, `TIPO PISTA` | Condições da via |
| `FORMATO PISTA`, `CONDIÇÃO LUMINOSIDADE`, `TIPO LUMINOSIDADE` | Infraestrutura |
| `SINALIZAÇÃO` | Tipos de sinalização (lista separada por vírgula) |

**Encoding**: ISO-8859-1 ou UTF-8 (detecção automática) · **Separador**: `;` ou `,` (detecção automática)

---

## 🛠 Tecnologias

| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Gráficos interativos |
| [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) | 2.2.0 | Rótulos de dados nos gráficos |
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Mapas interativos |
| [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) | 0.2.0 | Mapa de calor |
| [CartoCDN](https://carto.com/basemaps/) | — | Tiles de mapa (dark/light) |
| [Google Fonts](https://fonts.google.com/) | — | Syne + DM Sans |

Nenhum framework JS, nenhum bundler, nenhuma dependência de build.

---

## 📝 Licença

Uso interno — STTTU · Prefeitura Municipal de Natal/RN.
