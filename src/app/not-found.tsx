import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cobalt px-4 pb-24 text-center text-white">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Cartão não encontrado</h1>
        <p className="mt-2 text-white/80">Esse apelido ainda não tem cartão.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-cobalt hover:bg-signal"
        >
          Criar um cartão
        </Link>
      </div>
    </main>
  );
}
