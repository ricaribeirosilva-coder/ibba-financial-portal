# IBBA Financial Portal — Architecture Design

**Data:** 2026-04-22
**Autor:** Ricardo + Claude
**Escopo:** arquitetura do super app "IBBA Financial Portal", com foco no produto 1 (Cockpit do Ciclo de Crédito).
**Status:** aprovado para plano de implementação.

---

## 1. Contexto e premissas

### 1.1 Público
Analistas buy-side do setor financials. Power-users familiarizados com Bloomberg/FactSet. Compartilham análises via link com colegas.

### 1.2 Proposta de valor
Portal com análises prontas (curated) e ferramentas interativas (lab) sobre o setor financeiro/bancário brasileiro. O cliente interpreta os dados, não recebe tese pronta. Correlações entre fenômenos macro e comportamentos bancários são capacidade central.

### 1.3 Visão de produto
Super app que começa com 1 produto ancora (Ciclo de Crédito) e crescerá com novos produtos (M&A Financials, Consumer & Inflação, Pagamentos & Fintech, etc). Cada produto futuro é um card novo na home + rota nova, sem refator do existente.

### 1.4 Fora do escopo do MVP
- Autenticação de usuários
- Múltiplos produtos (só Ciclo de Crédito)
- Mobile otimizado nativo (web responsive sim, PWA não)
- Integração com Obsidian
- Dados ao vivo / websockets
- Analytics de uso (mixpanel, etc)

### 1.5 Restrições conhecidas
- API do BCB (`api.bcb.gov.br`) é bloqueada pelo proxy do sandbox. Dados devem ser puxados localmente via Chrome como pipeline manual. Ver [Error #2 no Obsidian](obsidian://open?vault=Obsidian%20Vault&file=Projeto%20HTML%20Central/Error%20Log).
- Ricardo ainda não tem conta Vercel — criar como pré-requisito antes do primeiro deploy.

---

## 2. Arquitetura analítica

### 2.1 Uso primário ordenado
O dash serve estes modos de uso, em ordem de prioridade:

1. **Storytelling / exploratório** (10-20min): analista prepara relatório/call, navega séries, compara períodos.
2. **Simulador** (forward-looking): "se SELIC fizer X, comprometimento e NPL vão pra onde?".
3. **Turning points**: detectar mudança de regime no ciclo.
4. **Snapshot matinal** (<1min): visão rápida do estado atual.

### 2.2 Comparação histórica
Ciclos pré-nomeados (2013-14, 2015-16, 2020, 2022-23) como atalhos + range picker livre. Usuário pode sobrepor ciclo histórico ao atual.

### 2.3 Produto 1 — Cockpit do Ciclo de Crédito
Estrutura interna em 3 camadas:

**Camada A — Curated (análises prontas):**
- **3 camadas do ciclo com divergências:** view assinatura. Leading (PTC, BNDES) + Coincident (IOF, concessões) + Lagging (comprometimento de renda, inadimplência) sobrepostos no tempo. Faixas verticais destacam períodos com divergência ativa.
- **Juros / Amortização vs Inadimplência:** insight do briefing — juros crescendo mais rápido que amortização = rolagem de dívida cara = antecedente de NPL.
- **Concessões PF vs PJ:** corte por tipo de tomador, séries 20631 + 20632.
- **Ciclos históricos sobrepostos:** 2013-14, 2015-16, 2020, 2022-23 num eixo normalizado pra comparação de magnitude e duração.

Arquitetura precisa deixar fácil adicionar novas views curadas (cada view = 1 componente + 1 entrada na sidebar).

**Camada B — Lab (build-your-own):**
- **Explorador de séries:** plota qualquer combinação das 14 séries SGS + PTC em 1 gráfico. Overlay livre, normalização opcional, export PNG.
- **Correlação & Lag:** scatter de qualquer par, matriz de correlação de qualquer conjunto, rolling correlation no tempo, análise de lead/lag (qual série antecede qual, com quantos meses de defasagem).
- **Comparador de períodos:** seleciona 2 janelas, vê lado a lado as mesmas séries.
- **Simulador de cenários:** slider de SELIC (e opcionalmente inflação), vê efeito projetado em comprometimento e NPL. Modelo linear simples no MVP — econometria mais sofisticada em iteração futura.

**Camada C — Dados:**
- Tabelas brutas das séries tratadas.
- Export CSV/JSON por série ou por conjunto.
- Metadados (fonte, código SGS, frequência, última atualização).

### 2.4 Divergências
As 4 divergências do briefing (PTC+ com comprometimento alto; IOF caindo + PTC-; PTC- com comprometimento caindo; BNDES up + privado down) aparecem como **faixas verticais coloridas** nos gráficos relevantes, com toggle para apagar quando o analista quer gráfico limpo para relatório.

---

## 3. Arquitetura de informação

### 3.1 Mapa de rotas

```
/                                              → Home (launchpad)
/credit-cycle                                  → Cockpit · view padrão (3 camadas)
/credit-cycle/3-camadas                        → Curated: 3 camadas
/credit-cycle/juros-amortizacao                → Curated: Juros/Amort vs Inadim
/credit-cycle/concessoes                       → Curated: Concessões PF/PJ
/credit-cycle/ciclos-historicos                → Curated: ciclos sobrepostos
/credit-cycle/lab/explorador                   → Lab: Explorador
/credit-cycle/lab/correlacao                   → Lab: Correlação & Lag
/credit-cycle/lab/comparador                   → Lab: Comparador de períodos
/credit-cycle/lab/simulador                    → Lab: Simulador
/credit-cycle/dados                            → Dados brutos
```

### 3.2 Deep linking (state-in-URL)
Toda configuração do usuário é serializada em query params. Exemplo:

```
/credit-cycle/lab/correlacao?x=compromet_juros&y=inadim_pf&period=2013-01..2026-02&lag=6&overlay=ciclo:2013-14
```

Isso permite que um analista copie a URL e envie no chat, e o colega abra exatamente a mesma view com a mesma configuração. Query params são a fonte de verdade do estado visual.

### 3.3 Navegação interna do Cockpit
**Sidebar esquerda persistente** com 3 seções:
- `ANÁLISES` — lista de curated views
- `LAB` — lista de ferramentas
- `DADOS`

Item ativo destacado em laranja Itaú. Sidebar colapsa em hamburguer no mobile (<768px).

### 3.4 Shell chrome (global)
Top bar fino (48px), consistente em todas as rotas:
- Esquerda: logo/wordmark "IBBA Financial Portal" (clicável → home)
- Centro: nome do produto atual (ex: "Ciclo de Crédito")
- Direita: slot para search global (ativado quando houver 2+ produtos)

### 3.5 Home
Estrutura:
- **Masthead editorial** no topo (wordmark + tagline discreta).
- **Card grande** do produto ativo (Ciclo de Crédito) com preview ao vivo (mini-gráfico renderizado com dados reais). CTA "Abrir produto".
- **Grid de 2-3 tiles "Em breve"** abaixo: M&A Financials, Consumer & Inflação, Pagamentos & Fintech (labels editáveis conforme roadmap). Dashed border, tom apagado. Sinalizam pipeline sem mentir.

---

## 4. Arquitetura visual

### 4.1 Identidade
**C3 híbrido** — editorial na voz, clean no espaço.

**Paleta:**
- Background principal: `#f7f5f0` (bege lavadíssimo, off-white quente)
- Card/superfície: `#fbf9f3` a `#fefcf7`
- Texto principal: `#17120d` (quase preto quente)
- Texto secundário: `#7a6c5a`
- Texto fraco: `#a89a82`
- Borda sutil: `rgba(23, 18, 13, 0.12)`
- Borda forte: `rgba(23, 18, 13, 0.30)`
- Acento (interação, ativo, divergência destacada): `#d84e1d` (laranja Itaú) — restrito, não decorativo.

**Tipografia:**
- Títulos de produto, headlines: serif display (candidato: Instrument Serif ou Fraunces, variable).
- Corpo, UI, labels: sans refinada (candidato: Inter ou IBM Plex Sans).
- Dados numéricos, tabelas: mono (candidato: IBM Plex Mono).

### 4.2 Densidade do Cockpit (nível B — equilibrado)
Estrutura da view curada principal (3 camadas):
- **Topo:** breadcrumb leve + seletor de comparação (chips: `2013-14 · 2015-16 · 2020 · 2022-23 · Atual`) + seletor de range (`2Y · 5Y · 10Y · Max · Custom`).
- **Canvas central:** gráfico principal grande (~60% da altura útil).
- **KPIs:** 3 cards embaixo do gráfico, um por camada (Leading / Coincident / Lagging), cada um com valor atual e delta vs 6m atrás.
- **Rodapé leve:** barra de ações (Anotar · Share · Export PNG · Divergências ON/OFF).

### 4.3 Divergências (visual)
Faixas verticais coloridas nos gráficos de time series — laranja `rgba(216, 78, 29, 0.14)` com borda vertical sutil. Tooltip no hover da faixa informa qual divergência e período exato. Toggle no rodapé apaga todas as faixas.

### 4.4 Responsividade
- Desktop (>=1024px): sidebar aberta, canvas full.
- Tablet (768-1023px): sidebar colapsa para ícones; expande no hover.
- Mobile (<768px): sidebar vira hamburguer; gráficos perdem features (Plotly toolbar some, só pinch-zoom nativo). Mobile é best-effort no MVP.

---

## 5. Arquitetura técnica

### 5.1 Stack
- **Framework:** React 18 + Vite 5
- **Linguagem:** TypeScript
- **Roteamento:** React Router v6 (loader/data API para pre-fetch de JSON)
- **Charts:** Plotly.js via `react-plotly.js` (dynamic import por view para economizar bundle)
- **Styling:** CSS variables + modules (`.module.css`) — sem lib de utility-first no MVP
- **State:** URL params (fonte de verdade) + React `useState` local + Context se necessário para tema/config global. **Sem Redux/Zustand no MVP.**
- **URL state helpers:** pequena utility interna (ou `use-query-params`) para serializar/deserializar estado tipado.

### 5.2 Data layer
**JSON estático comprometido no repo.** Estrutura:

```
public/
  data/
    series/
      compromet_renda_total.json      # series 29263
      compromet_renda_sem_imob.json   # series 29264
      compromet_juros.json            # series 29036
      compromet_amort.json            # series 20399
      endiv_familias.json             # series 29037
      endiv_sem_imob.json             # series 29038
      inadim_pf_total.json            # series 21082
      inadim_pj_total.json            # series 21112
      inadim_pf_livre.json            # series 21086
      inadim_pj_livre.json            # series 21129
      inadim_sistema.json             # series 13685
      selic_meta.json                 # series 432
      concessoes_pf_livre.json        # series 20631
      concessoes_pj_livre.json        # series 20632
      # + PTC (quando digitalizado)
    manifest.json                     # lista de séries com metadados
    divergences.json                  # períodos de divergência pré-computados
```

Cada arquivo de série é um array compacto: `[{"d":"2005-01","v":22.3}, ...]`.

**Plano futuro (pós-MVP):** DuckDB-WASM no Lab para rodar SQL client-side em Parquet comprimido. Habilita correlação matrix e aggregates ad-hoc sem backend. Decidido após ver uso real.

### 5.3 Pipeline de dados
**MVP: manual.**
- Script Python (`pipeline/fetch_bcb.py`) roda no browser Chrome via `javascript_tool` contornando o `EGRESS_BLOCKED`.
- Script gera os JSONs em `public/data/series/` e atualiza `manifest.json`.
- Script calcula e atualiza `divergences.json` (função que escaneia as séries e detecta as 4 divergências).
- Ricardo commita os diffs mensalmente e push.

**Iteração pós-MVP: GitHub Actions cron.**
- Workflow roda dia 5 de cada mês, puxa BCB (testar se é acessível do IP do GitHub), gera JSONs, abre PR.
- Ricardo revisa o diff e dá merge.
- Fallback: se Actions falhar, notificação → rodar manual.

### 5.4 Charts (Plotly)
- Import dinâmico por view: `const Plot = lazy(() => import('react-plotly.js'))`.
- Wrapper fino `<ChartShape>` que padroniza layout (fonte, cores, grid, margin).
- Divergências como `shapes` (retângulos verticais com opacidade baixa).
- Toolbar nativa habilitada (zoom, pan, reset, export PNG). Botão "divergências on/off" injetado no toolbar customizado.

### 5.5 Repo e deploy
- **Repo:** novo, nome sugerido `ibba-financial-portal` (ou `ibba-portal`). Ricardo cria.
- **Host:** Vercel. SPA routing nativo (rewrites automáticos para index.html).
- **Deploy:** build-on-push no main. Preview deploy automático em cada PR.
- **Domínio:** subdomínio Vercel no MVP (`ibba-financial-portal.vercel.app`); custom domain depois.

### 5.6 Estrutura de pastas proposta

```
ibba-financial-portal/
├── public/
│   └── data/                  # JSONs versionados
├── src/
│   ├── main.tsx               # entry
│   ├── App.tsx                # shell + router
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── CreditCycle/
│   │   │   ├── index.tsx      # layout do Cockpit (sidebar + outlet)
│   │   │   ├── curated/
│   │   │   │   ├── ThreeLayers.tsx
│   │   │   │   ├── InterestAmort.tsx
│   │   │   │   ├── Concessions.tsx
│   │   │   │   └── HistoricalCycles.tsx
│   │   │   ├── lab/
│   │   │   │   ├── Explorer.tsx
│   │   │   │   ├── Correlation.tsx
│   │   │   │   ├── Comparator.tsx
│   │   │   │   └── Simulator.tsx
│   │   │   └── Data.tsx
│   ├── components/
│   │   ├── shell/             # TopBar, Sidebar
│   │   ├── charts/            # ChartShape, DivergenceBands, wrappers Plotly
│   │   └── ui/                # Button, Chip, Card, KPI
│   ├── lib/
│   │   ├── data.ts            # loaders de JSON, cache
│   │   ├── url-state.ts       # serialize/deserialize query params
│   │   ├── divergences.ts     # lógica de detecção
│   │   └── theme.ts           # tokens de design
│   └── styles/
│       ├── tokens.css         # CSS vars
│       └── global.css
├── pipeline/
│   ├── fetch_bcb.py           # script manual
│   └── detect_divergences.py
├── docs/
│   └── superpowers/specs/     # este doc
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Critérios de sucesso do MVP

Lançamento do MVP considerado bem-sucedido quando:

1. Home carrega com card "Ciclo de Crédito" ao vivo (mini-gráfico real) + 2-3 tiles coming soon.
2. Cockpit abre em `/credit-cycle` mostrando a view "3 camadas" como default.
3. Sidebar navega entre as 4 curated views + 4 lab tools + dados.
4. Todas as rotas têm state-in-URL: copiar URL reabre exatamente a mesma config.
5. Divergências aparecem como faixas verticais com toggle on/off.
6. Seletor de ciclo histórico (2013-14, 2015-16, 2020, 2022-23) sobrepõe no gráfico ativo.
7. Lab de correlação gera matriz para qualquer subset de séries, scatter para qualquer par, rolling correlation para qualquer par + janela.
8. Simulador responde a slider de SELIC com projeção visível.
9. Export CSV funciona em Dados.
10. Deploy no Vercel acessível via URL pública.

---

## 7. Decisões em aberto (baixa prioridade)

- **Labels dos tiles "coming soon"** na Home: M&A Financials? Consumer & Inflação? Pagamentos & Fintech? Decidir antes do primeiro release — meramente cosmético.
- **Nome final do repo**: `ibba-financial-portal`, `ibba-portal`, `financial-signals`. Decidir quando criar.
- **Modelo econométrico do Simulador**: MVP é linear simples. Iteração pós-MVP pode usar VAR ou regressão múltipla — fora de escopo agora.
- **Tipografia específica**: Instrument Serif vs Fraunces; Inter vs IBM Plex Sans. A/B no primeiro commit, decidir no olho.

---

## 8. Próximo passo

Invocar `writing-plans` skill para transformar este design em um plano de implementação detalhado e executável.
