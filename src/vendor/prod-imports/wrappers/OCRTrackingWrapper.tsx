// ─────────────────────────────────────────────────────────────────────────────
// F83.E · Wrapper para OCRTracking.tsx prod-sync (F83 lift · 2026-08-21).
// Mantiene el componente prod (`../OCRTracking.tsx`) sin ediciones in-place ·
// solo envuelve con TenantProvider para satisfacer los `useTenant` hooks
// internos + inyecta noop nav callbacks (onLogout · onNavigate · onConvertDocument).
// Same contract as ExpertHubTransactionsWrapper (F80.1).
// F83.L.fix2 · noop props explicit · antes eran implícitos y OCRTracking
// invocaba onNavigate('ocr-tracking') en Breadcrumbs desde el render.
// ─────────────────────────────────────────────────────────────────────────────

import OCRTracking from '../OCRTracking';
import { TenantProvider } from '../deps/TenantContext';

export default function OCRTrackingWrapper() {
  const noop = () => {};
  const noopNavigate = (_page: string) => { void _page };
  return (
    <TenantProvider>
      <OCRTracking
        onLogout={noop}
        onNavigate={noopNavigate}
      />
    </TenantProvider>
  );
}
