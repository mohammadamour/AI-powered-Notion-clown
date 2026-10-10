"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const DailyLogEntryContent = dynamic(() => import("./DailyLogEntryContent"), {
  ssr: false,
});

export default function DailyLogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <DailyLogEntryContent id={resolvedParams.id} />;
}
