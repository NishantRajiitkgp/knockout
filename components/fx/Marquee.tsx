import { cn } from "@/lib/cn";

export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const Track = () => (
    <div className="marquee__track" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 py-1 text-[15px] text-mute">{item}</span>
          <span className="text-stone">·</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("marquee", className)}>
      <Track />
      <Track />
    </div>
  );
}
