import { Button } from "@ship/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-zinc-950 px-8 py-24 text-zinc-100">
      <p className="font-mono text-xs tracking-[0.16em] text-zinc-500 uppercase">
        Admin
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">Ship Faster admin</h1>
      <p className="max-w-md text-zinc-400">
        Internal admin app. Imports Button from @ship/ui only.
      </p>
      <Button>Manage workspace</Button>
    </main>
  );
}
