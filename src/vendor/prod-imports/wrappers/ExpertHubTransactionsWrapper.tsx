// ─────────────────────────────────────────────────────────────────────────────
// Wrapper para el shared-block preview de expert-hub-tx.
// Mantiene el componente prod (`../ExpertHubTransactions.tsx`) sin ediciones
// in-place · adapta solo las props que expert-hub le exige (nav callbacks,
// logout) a no-ops porque en el shared block no hay a dónde navegar.
//
// F86.25.2 · Diego 2026-08-27 · forward optional `additionalOrders` prop
// so scenes can inject caller-owned kanban cards (e.g., post-release
// payment run drafts) as native entries in the Orders tab.
// ─────────────────────────────────────────────────────────────────────────────

import ExpertHubTransactions from '../ExpertHubTransactions';
import { TenantProvider } from '../deps/TenantContext';

const noop = () => {};

interface ExpertHubTransactionsWrapperProps {
  additionalOrders?: Array<Record<string, any>>;
}

export default function ExpertHubTransactionsWrapper({ additionalOrders }: ExpertHubTransactionsWrapperProps = {}) {
  return (
    <TenantProvider>
      <ExpertHubTransactions
        onLogout={noop}
        onNavigateToDetail={noop}
        onNavigateToWorkspace={noop}
        onNavigate={noop}
        additionalOrders={additionalOrders}
      />
    </TenantProvider>
  );
}
