import { CacheProvider } from "@emotion/react";

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import createEmotionCache from "./shared/create_emotion_cache";

const clientSideCache = createEmotionCache();
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <CacheProvider value={clientSideCache}>
        <RemixBrowser />
      </CacheProvider>
    </StrictMode>
  );
});
