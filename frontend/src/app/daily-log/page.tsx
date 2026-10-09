"use client";

import dynamic from "next/dynamic";

const DailyLogContent = dynamic(() => import("./DailyLogContent"), {
  ssr: false,
});

export default function DailyLogPage() {
  return <DailyLogContent />;
}
