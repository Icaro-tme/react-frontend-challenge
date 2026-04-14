# Arquitetura - CineDash

## Visão geral

O projeto foi estruturado com foco em crescimento incremental, com separação de responsabilidades entre:

- página (orquestração);
- feature (regra de negócio da funcionalidade);
- entidade (modelo e mapeamentos de domínio);
- shared (infra/utilitários/config).

Essa divisão segue o espírito de FSD para manter fronteiras claras e reduzir acoplamento entre features.

## Estrutura principal

```text
src/
  entities/      # tipos, mapeadores e seletores por domínio
  features/      # regras por feature (auth, movies, setlist, watchlist, ...)
  pages/         # composição de fluxos e integração entre features
  router/        # árvore de rotas e guardas
  providers/     # QueryClient, ThemeSync, ToastProvider
  shared/        # API clients, config, hooks, utils, UI base e i18n
```

## Espaço para imagem - mapa de módulos

![Placeholder - Mapa de módulos](./docs/images/architecture-modules.png)

## Decisões técnicas

### 1) Roteamento e guardas

- TanStack Router com rotas lazy para páginas principais.
- Prefixo de idioma obrigatório em rota (`/$lang/...`).
- Guardas separadas por responsabilidade:
  - `locale-guards`: valida/sincroniza idioma da URL;
  - `auth-guards`: controla acesso por sessão.

Resultado: a página não precisa conter lógica de validação de idioma nem proteção de rota.

### 2) Estado global e persistência

- Zustand como fonte de verdade para estado de cliente.
- Stores com `persist` para manter sessão, tema, locale e dados de curadoria.
- Sessão mock baseada em token + expiração (`expiraEm`).
- Sincronização de dados por usuário via chave de sessão compartilhada.

### 3) Estado assíncrono (server state)

- TanStack Query para TMDB e operações assíncronas.
- Query keys compostas por idioma/filtros/paginação para cache previsível.
- Configuração central do QueryClient em `providers/query-client.ts`.

### 4) Modelagem de domínio

- `entities/movie`: tipagem de filme, mapeadores TMDB -> modelo interno e seletores.
- `entities/setlist`, `entities/user`, `entities/auth`: contratos isolados por domínio.
- Features consomem entidades e compartilham somente interfaces necessárias.

### 5) UI e composição

- Componentes de UI focados em composição e comportamento.
- Repetições visuais centralizadas em primitivas simples (`ActionIconButton`, `MovieModalShell`, etc).
- Páginas concentram integração entre features (ex.: dashboard, setlist, watchlist).

## Espaço para imagem - fluxo de navegação

![Placeholder - Fluxo de navegação](./docs/images/navigation-flow.png)

## Internacionalização e localização automática

Foi implementado um fluxo rápido de localização automática:

- no primeiro acesso, o locale inicial considera `navigator.language`;
- a rota valida `pt-BR` ou `en-US` no `beforeLoad`;
- o locale no store e o `i18next` são sincronizados pelo guarda;
- troca de idioma atualiza o prefixo da URL para manter consistência de navegação.

Isso evita divergência entre URL, store local e idioma ativo de tradução.

## Autenticação simulada

- Formulário validado com Zod (email válido e senha com mínimo de 7 caracteres no login).
- Login mock gera token fictício e expiração de sessão.
- Acesso protegido por guardas de rota.
- Perfis atuais: `operador` e `administrador` (com permissão extra de exportação).

## Funcionalidades extras relevantes

- Análise de setlist com score de curadoria e métricas agregadas.
- Dashboard gráfico da análise (Recharts).
- Exportação de análise em CSV.
- Exportação/importação de dados do usuário em JSON.
- Sistema de toasts para feedback de sucesso/erro/info.

## Sobre biblioteca de componentes

Nesta versão não foi adotada uma biblioteca completa de componente.

Motivo: no início do desenvolvimento houve interpretação de que biblioteca de componentes base poderia fugir da expectativa da avaliação, então a UI foi montada com componentes próprios e Tailwind.

Com a evolução da interface, foram adicionadas bibliotecas auxiliares pontuais, como:

- `react-icons` para iconografia;
- `recharts` para visualização gráfica.

## Trade-offs e próximos passos

- `@tanstack/react-table` está instalado (diferencial pedido), mas ainda não foi adotado na tabela principal.
- A próxima iteração natural seria migrar watchlist/setlist table para TanStack Table com sorting/filtering mais robusto.
- Outra evolução possível: adoção gradual de um design system (incluindo shadcn/ui) mantendo o contrato atual de componentes.