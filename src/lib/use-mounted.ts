import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after client-side hydration — safe for reading persisted/client-only state (e.g. zustand + localStorage) without hydration mismatches. */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
