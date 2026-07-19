export type ConsoleHeaderProps = {
  eyebrow: string;
  greeting: string;
  subtitle: string;
};

export function ConsoleHeader({ eyebrow, greeting, subtitle }: ConsoleHeaderProps) {
  return (
    <div className="sh-hero">
      <div className="sh-eyebrow">{eyebrow}</div>
      <h1>{greeting}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
