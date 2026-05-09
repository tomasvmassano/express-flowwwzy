"use client";

import { COMPONENT_CATEGORIES, FORM_EXPOSED_MOODS, MoodTag, PALETTES, PaletteId } from "@/lib/studio/vocabulary";
import type { MatchRequest } from "@/lib/studio/types";

export type FormState = MatchRequest["form"];

type Props = {
  value: FormState;
  onChange: (next: FormState) => void;
};

export default function StudioForm({ value, onChange }: Props) {
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-7">
      {/* Palette */}
      <Block label="Paleta">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => {
            const p = PALETTES[id];
            const active = value.paletteId === id;
            return (
              <button
                key={id}
                onClick={() => set("paletteId", id)}
                className={`flex items-center gap-2 px-2 py-2 rounded border text-left transition-colors ${
                  active
                    ? "border-[#FAFAFA] bg-[#1A1A1A]"
                    : "border-[#2A2A2A] hover:border-[#444]"
                }`}
              >
                <div className="flex gap-0.5 flex-shrink-0">
                  {p.hex.map((c) => (
                    <span
                      key={c}
                      className="w-3 h-3 rounded-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#EDEDED] truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </Block>

      {/* Mood (form-exposed only) */}
      <Block label="Mood (1-3)">
        <div className="flex flex-wrap gap-1.5">
          {FORM_EXPOSED_MOODS.map((m) => {
            const active = value.moodTags.includes(m);
            return (
              <button
                key={m}
                onClick={() => {
                  if (active) {
                    set("moodTags", value.moodTags.filter((x) => x !== m));
                  } else if (value.moodTags.length < 3) {
                    set("moodTags", [...value.moodTags, m]);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  active
                    ? "bg-[#FAFAFA] text-black border-[#FAFAFA]"
                    : "bg-transparent text-[#CCC] border-[#2A2A2A] hover:border-[#666]"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Block>

      {/* Tone sliders */}
      <Block label="Tone">
        <div className="space-y-4">
          <Slider
            left="Profissional"
            right="Casual"
            value={value.tone.profCasual}
            onChange={(v) => set("tone", { ...value.tone, profCasual: v })}
          />
          <Slider
            left="Calmo"
            right="Bold"
            value={value.tone.calmBold}
            onChange={(v) => set("tone", { ...value.tone, calmBold: v })}
          />
          <Slider
            left="Clássico"
            right="Moderno"
            value={value.tone.classicModern}
            onChange={(v) => set("tone", { ...value.tone, classicModern: v })}
          />
        </div>
      </Block>

      {/* Sections */}
      <Block label="Secções a incluir">
        <div className="grid grid-cols-2 gap-1.5">
          {COMPONENT_CATEGORIES.map((c) => {
            const active = value.sections.includes(c);
            return (
              <button
                key={c}
                onClick={() => {
                  if (active) {
                    set("sections", value.sections.filter((x) => x !== c));
                  } else {
                    set("sections", [...value.sections, c]);
                  }
                }}
                className={`px-2.5 py-1.5 rounded text-xs border text-left transition-colors ${
                  active
                    ? "bg-[#1A1A1A] text-[#EDEDED] border-[#666]"
                    : "bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#444]"
                }`}
              >
                {active ? "✓ " : "  "}{c}
              </button>
            );
          })}
        </div>
      </Block>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

function Slider({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[#888] mb-1">
        <span>{left}</span>
        <span className="font-mono text-[#CCC]">{value}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-[#FAFAFA] cursor-pointer"
      />
    </div>
  );
}

export const DEFAULT_FORM: FormState = {
  moodTags: ["minimalista"] as MoodTag[],
  tone: { profCasual: 40, calmBold: 35, classicModern: 55 },
  paletteId: "black-cream",
  paletteAvoidId: null,
  sections: ["hero", "services", "testimonials", "pricing", "footer"],
};
