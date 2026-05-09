"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReferenceDNA } from "@/lib/studio/types";
import type { EnrichmentHints } from "@/lib/studio/extractor/html-enrich";

export type ExtractionStatus = "idle" | "running" | "done" | "failed";

export type ExtractionState = {
  url: string;
  status: ExtractionStatus;
  jobId?: string;
  dna?: ReferenceDNA;
  hints?: EnrichmentHints;
  error?: string;
  /** Apify-side elapsed milliseconds reported by polls */
  apifyElapsedMs?: number;
  /** Local timestamp when extraction kicked off */
  startedAt?: number;
};

const POLL_INTERVAL_MS = 3000;

/**
 * Manages a single URL's extraction lifecycle:
 *   start() → POST kick-off → store jobId → poll every 3s until done/failed.
 *
 * The hook is self-contained: no global store, no shared state. Each
 * ReferenceCard owns its own instance. The page composes 1-3 instances.
 */
export function useExtraction(initialUrl = "") {
  const [state, setState] = useState<ExtractionState>({
    url: initialUrl,
    status: "idle",
  });
  const pollHandle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = useRef(false);

  const setUrl = useCallback((url: string) => {
    setState((s) => ({ ...s, url, status: "idle", error: undefined }));
  }, []);

  const reset = useCallback(() => {
    if (pollHandle.current) clearTimeout(pollHandle.current);
    pollHandle.current = null;
    stopped.current = false;
    setState((s) => ({ url: s.url, status: "idle" }));
  }, []);

  const poll = useCallback(async (jobId: string, url: string) => {
    if (stopped.current) return;
    try {
      const qs = new URLSearchParams({ jobId, url });
      const res = await fetch(`/api/studio/extract-reference?${qs.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (stopped.current) return;

      if (data?.status === "done") {
        setState((s) => ({
          ...s,
          status: "done",
          dna: data.dna,
          hints: data.hints,
        }));
        return; //  stop polling
      }
      if (data?.status === "failed") {
        setState((s) => ({ ...s, status: "failed", error: data.error || "extraction failed" }));
        return;
      }
      if (data?.status === "running") {
        setState((s) => ({ ...s, apifyElapsedMs: data.elapsedMs }));
      }
      // schedule next poll
      pollHandle.current = setTimeout(() => poll(jobId, url), POLL_INTERVAL_MS);
    } catch (err) {
      if (stopped.current) return;
      // transient network errors — back off and try once more
      pollHandle.current = setTimeout(() => poll(jobId, url), POLL_INTERVAL_MS * 2);
    }
  }, []);

  const start = useCallback(async () => {
    if (!state.url || !/^https?:\/\//i.test(state.url)) {
      setState((s) => ({ ...s, status: "failed", error: "URL inválido" }));
      return;
    }
    stopped.current = false;
    setState((s) => ({ ...s, status: "running", error: undefined, startedAt: Date.now() }));
    try {
      const res = await fetch("/api/studio/extract-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: state.url }),
      });
      const data = await res.json();

      if (data?.status === "done" && data.dna) {
        setState((s) => ({ ...s, status: "done", dna: data.dna }));
        return;
      }
      if (data?.jobId) {
        setState((s) => ({ ...s, jobId: data.jobId }));
        poll(data.jobId, state.url);
        return;
      }
      setState((s) => ({
        ...s,
        status: "failed",
        error: data?.message || data?.error || "kick-off failed",
      }));
    } catch (err) {
      setState((s) => ({ ...s, status: "failed", error: String(err) }));
    }
  }, [state.url, poll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopped.current = true;
      if (pollHandle.current) clearTimeout(pollHandle.current);
    };
  }, []);

  return { state, setUrl, start, reset };
}
