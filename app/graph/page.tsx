"use client";

import dynamic from 'next/dynamic';

const KnowledgeGraphComponent = dynamic(() => import('./graph-component'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
  ssr: false,
});

export default function KnowledgeGraph() {
  return <KnowledgeGraphComponent />;
}