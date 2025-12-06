# Regras de Desenvolvimento e Stack Tecnológica

Este documento descreve a stack tecnológica utilizada no projeto e as diretrizes para o uso de bibliotecas, garantindo consistência e manutenibilidade.

## Stack Tecnológica

*   **Frontend Framework**: React.js (com TypeScript para tipagem).
*   **Build Tool**: Vite para desenvolvimento rápido e otimização de build.
*   **Roteamento**: React Router DOM para navegação declarativa.
*   **Estilização**: Tailwind CSS para classes de utilidade e design responsivo.
*   **Componentes UI**: Shadcn/ui para componentes pré-construídos e customizados em `src/components/UI/`.
*   **Gerenciamento de Estado**: Zustand para estado global e `useState`/`useReducer` do React para estado local.
*   **Animações**: Framer Motion para transições e animações fluidas.
*   **Ícones**: Lucide React para uma vasta coleção de ícones vetoriais.
*   **Gráficos**: Recharts para visualização de dados interativa.
*   **Backend**: Node.js com Express.js para a API RESTful.
*   **Banco de Dados**: Supabase (PostgreSQL) para persistência de dados, autenticação e Edge Functions.
*   **Integrações Externas**: Axios para requisições HTTP e Facebook Node.js Business SDK para a API do Meta Ads.
*   **Agendamento de Tarefas**: Node-cron para jobs em segundo plano.

## Regras de Uso de Bibliotecas

Para manter a consistência e a eficiência, siga as seguintes regras ao desenvolver:

1.  **Componentes de UI**:
    *   **Prioridade**: Sempre que possível, utilize os componentes pré-construídos do [shadcn/ui](https://ui.shadcn.com/) para novos elementos de UI. Eles já estão instalados e configurados.
    *   **Customização**: Se um componente shadcn/ui não atender às suas necessidades, crie um novo componente em `src/components/` ou `src/pages/` e utilize as classes do Tailwind CSS para estilizá-lo.
    *   **Componentes Existentes**: Mantenha e utilize os componentes customizados já existentes em `src/components/UI/Basic.jsx` e `src/components/UI/Complex.jsx` (Card, Button, Input, Badge, Table, DataTable, Modal, Tabs).

2.  **Estilização**:
    *   **Tailwind CSS**: Utilize exclusivamente classes de utilidade do Tailwind CSS para todos os estilos. Evite escrever CSS puro ou módulos CSS, a menos que seja estritamente necessário para layouts complexos ou animações que não podem ser alcançadas com Tailwind.
    *   **Variáveis CSS**: As variáveis CSS definidas em `src/index.css` e `src/styles/tailwind.css` devem ser respeitadas para o tema.

3.  **Gerenciamento de Estado**:
    *   **Global**: Para estados que precisam ser acessados por múltiplos componentes não diretamente relacionados, utilize o Zustand (`src/store/useStore.js`).
    *   **Local**: Para estados que são relevantes apenas para um componente ou sua subárvore imediata, utilize `useState` ou `useReducer` do React.

4.  **Roteamento**:
    *   **React Router DOM**: Todas as rotas e navegação devem ser implementadas usando `react-router-dom`. Mantenha a estrutura de rotas em `src/App.jsx`.

5.  **Ícones**:
    *   **Lucide React**: Utilize apenas ícones da biblioteca `lucide-react`.

6.  **Gráficos**:
    *   **Recharts**: Para qualquer visualização de dados em gráficos, utilize a biblioteca `recharts`.

7.  **Animações**:
    *   **Framer Motion**: Para animações de UI, transições de página e microinterações, utilize `framer-motion`.

8.  **Manipulação de Datas**:
    *   **date-fns**: Para formatação, parse e manipulação de datas, utilize `date-fns`.

9.  **Interação com API (Frontend)**:
    *   **Fetch API**: Prefira a API nativa `fetch` para fazer requisições ao backend.
    *   **Supabase JS Client**: Para interações diretas com o Supabase (autenticação, dados via RLS, Edge Functions), utilize o `@supabase/supabase-js`.

10. **Interação com API (Backend)**:
    *   **Axios**: Para fazer requisições a APIs externas (ex: Meta Graph API), utilize `axios`.
    *   **Supabase JS Client**: Para todas as operações de banco de dados e autenticação no backend, utilize o `@supabase/supabase-js` através do `supabaseAdapter.js`.

11. **Autenticação**:
    *   **Supabase Auth**: Para gerenciamento de usuários e sessões.
    *   **JWT**: O backend utiliza `jsonwebtoken` para tokens de sessão.
    *   **Bcrypt**: Para hashing de senhas no backend.

12. **Background Jobs**:
    *   **node-cron**: Para agendamento de tarefas recorrentes no servidor.

13. **Meta Ads API**:
    *   **Facebook Node.js Business SDK**: Para interagir com a API do Meta Ads, utilize o SDK oficial, complementado por chamadas diretas com `axios` quando necessário.

Ao seguir estas diretrizes, garantimos um código mais limpo, consistente e fácil de manter e escalar.