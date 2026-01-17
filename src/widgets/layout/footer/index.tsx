import { Social } from '@/features/social/ui';

export const Footer = () => (
  <footer className="mt-auto flex items-center justify-center border-t border-white/10 bg-black/80 py-4">
    <div className="container flex w-full items-center justify-between gap-4 px-4 text-xs text-zinc-300 max-lg:flex-col max-lg:text-center">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
          Virtual Tactical Games
        </span>
        <span className="text-xs text-zinc-300">Всі права захищені.</span>
      </div>

      <Social className="flex items-center justify-center gap-6" />
    </div>
  </footer>
);
