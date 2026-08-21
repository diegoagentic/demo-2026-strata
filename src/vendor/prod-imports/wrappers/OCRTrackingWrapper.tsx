// ─────────────────────────────────────────────────────────────────────────────
// F83.E · Wrapper para OCRTracking.tsx prod-sync (F83 lift · 2026-08-21).
// Mantiene el componente prod (`../OCRTracking.tsx`) sin ediciones in-place ·
// solo envuelve con TenantProvider para satisfacer los `useTenant` hooks
// internos. Similar al pattern establecido en ExpertHubTransactionsWrapper (F80.1).
// ─────────────────────────────────────────────────────────────────────────────

import OCRTracking from '../OCRTracking';
import { TenantProvider } from '../deps/TenantContext';

export default function OCRTrackingWrapper() {
  return (
    <TenantProvider>
      <OCRTracking />
    </TenantProvider>
  );
}
