import Image from "next/image";

const avatarSize = {
  small: "h-7 w-7 text-xs",
  medium: "h-9 w-9 text-sm",
  large: "h-24 w-24 text-3xl",
} as const;

export function UserAvatar({
  name,
  src,
  size = "small",
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof avatarSize;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      role="img"
      aria-label={`${name} profile photo`}
      title={name}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/30 bg-gradient-to-br from-blue-500 to-emerald-400 font-semibold text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.18)] ${avatarSize[size]} ${className}`}
    >
      {src ? (
        <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}
