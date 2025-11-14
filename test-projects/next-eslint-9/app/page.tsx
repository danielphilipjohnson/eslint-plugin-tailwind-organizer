import Image from "next/image";
import { clsx } from "clsx";

export default function Home() {
  return (
    <div className={clsx(
    // Layout
    "flex",
    // Alignment
    "items-center justify-center",
    // Sizing
    "min-h-screen",
    // Typography
    "font-sans",
    // Background
    "bg-zinc-50 dark:bg-black"
  )}>
      <main className={clsx(
    // Layout
    "flex",
    // Flexbox
    "flex-col",
    // Alignment
    "items-center justify-between sm:items-start",
    // Sizing
    "min-h-screen w-full max-w-3xl",
    // Spacing
    "py-32 px-16",
    // Background
    "bg-white dark:bg-black"
  )}>
        <Image
          className={clsx(
    // Filters
    "dark:invert"
  )}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={clsx(
    // Layout
    "flex",
    // Flexbox
    "flex-col",
    // Gap
    "gap-6",
    // Alignment
    "items-center sm:items-start",
    // Typography
    "text-center sm:text-left"
  )}>
          <h1 className={clsx(
    // Sizing
    "max-w-xs",
    // Typography
    "text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50"
  )}>
            To get started, edit the page.tsx file.
          </h1>
          <p className={clsx(
    // Sizing
    "max-w-md",
    // Typography
    "text-lg leading-8 text-zinc-600 dark:text-zinc-400"
  )}>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className={clsx(
    // Typography
    "font-medium text-zinc-950 dark:text-zinc-50"
  )}
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className={clsx(
    // Typography
    "font-medium text-zinc-950 dark:text-zinc-50"
  )}
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className={clsx(
    // Layout
    "flex",
    // Flexbox
    "flex-col sm:flex-row",
    // Gap
    "gap-4",
    // Typography
    "text-base font-medium"
  )}>
          <a
            className={clsx(
    // Layout
    "flex",
    // Gap
    "gap-2",
    // Alignment
    "items-center justify-center",
    // Sizing
    "h-12 w-full md:w-[158px]",
    // Spacing
    "px-5",
    // Typography
    "text-background",
    // Background
    "bg-foreground hover:bg-[#383838] dark:hover:bg-[#ccc]",
    // Border Radius
    "rounded-full",
    // Transitions
    "transition-colors"
  )}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={clsx(
    // Filters
    "dark:invert"
  )}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className={clsx(
    // Layout
    "flex",
    // Alignment
    "items-center justify-center",
    // Sizing
    "h-12 w-full md:w-[158px]",
    // Spacing
    "px-5",
    // Background
    "hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]",
    // Border
    "border",
    // Border Radius
    "rounded-full",
    // Transitions
    "transition-colors",
    // Hover
    "hover:border-transparent",
    // Dark Mode
    "dark:border-white/[.145]",
    // Other
    "border-solid border-black/[.08]"
  )}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
