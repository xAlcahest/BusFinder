"use client";

/**
 * Single import point for the client-state hooks owned by another module.
 * Everything in src/components goes through here, so the wiring is one edit.
 */

export { useFavorites } from "@/hooks/useFavorites";
export { useRecents } from "@/hooks/useRecents";
export { useSettings } from "@/hooks/useSettings";
