"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FormData, initialForm } from "./types";

type Store = FormData & {
  setField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  patch: (partial: Partial<FormData>) => void;
  reset: () => void;
  next: () => void;
  back: () => void;
  goto: (step: number) => void;
};

export const useForm = create<Store>()(
  persist(
    (set) => ({
      ...initialForm,
      setField: (key, value) => set({ [key]: value } as Partial<Store>),
      patch: (partial) => set(partial),
      reset: () => set({ ...initialForm }),
      next: () => set((s) => ({ step: Math.min(s.step + 1, 8) })),
      back: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
      goto: (step) => set({ step }),
    }),
    {
      name: "flowwwzy-express-form",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as Storage))),
      partialize: (s) => {
        const { setField, patch, reset, next, back, goto, ...rest } = s as unknown as Store;
        return rest;
      },
    }
  )
);
