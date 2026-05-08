export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <span
      className="font-sans font-bold tracking-tight inline-flex items-baseline"
      style={{ fontSize: small ? "1rem" : "1.25rem", letterSpacing: "-0.02em" }}
      aria-label="Flowwwzy"
    >
      Flowwwzy<span className="text-cream">.</span>
    </span>
  );
}
