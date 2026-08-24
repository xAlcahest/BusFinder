"use client";

import dynamic from "next/dynamic";

import type { MotionMapViewProps } from "./motion";

// maplibre-gl touches window at import time, so it must never be server-rendered.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full animate-pulse bg-neutral-200 dark:bg-neutral-800"
      aria-hidden="true"
    />
  ),
});

export default function DynamicMapView(props: MotionMapViewProps) {
  return <MapView {...props} />;
}
