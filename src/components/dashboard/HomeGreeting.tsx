import { CalendarDays } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { formatDayHeading, formatLongDate, type DayKey } from "@/lib/dates";

interface HomeGreetingProps {
  user: { name: string };
  today: DayKey;
  /** Hora local (0–23) para elegir "Buenos días / tardes / noches". */
  hour: number;
}

function salutationFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Encabezado de Inicio: avatar, fecha y saludo grande con el nombre de pila de Google. */
export function HomeGreeting({ user, today, hour }: HomeGreetingProps) {
  const firstName = user.name.trim().split(/\s+/)[0];
  const salutation = salutationFor(hour);

  return (
    <section className="relative isolate flex flex-col gap-5 lg:gap-4">
      {/* Resplandor suave detrás del saludo; solo degradados, sin blur, para no desbordar en 375px. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-6 right-0 -z-10 h-44 w-3/4 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-expense-chart)_22%,transparent),transparent)] lg:w-1/2"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-1/4 -z-10 h-36 w-1/2 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-income)_16%,transparent),transparent)] lg:w-1/3"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={user.name} />
          <span className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 text-[13px] font-semibold text-ink-soft backdrop-blur-sm">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {/* En 375px la fecha larga no cabe junto a los botones de tema y sesión. */}
            <span className="truncate lg:hidden">{formatDayHeading(today, today)}</span>
            <span className="hidden truncate lg:inline">{formatLongDate(today)}</span>
          </span>
        </div>
        <div className="flex gap-2 lg:hidden">
          <ThemeToggle variant="icon" />
          <SignOutButton variant="icon" />
        </div>
      </div>

      <h2 className="text-[32px] leading-[1.1] tracking-[-0.03em] lg:text-[40px]">
        <span className="font-medium text-ink-soft">
          {salutation}
          {firstName && ","}
        </span>
        {firstName && (
          <>
            <br className="lg:hidden" /> <span className="font-extrabold text-ink">{firstName}</span>
          </>
        )}
      </h2>
    </section>
  );
}
