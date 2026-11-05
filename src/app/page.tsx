import { CardForm } from "@/components/CardForm";

export default function Home() {
  return (
    <main className="pb-28">
      <header className="bg-cobalt px-4 pt-12 pb-28 text-white sm:pt-16">
        <div className="mx-auto max-w-xl">
          <p className="font-semibold text-signal">Cartão de visita digital</p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Seu cartão de visita cabe num QR code.
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Preencha seus dados, escolha um apelido e ganhe uma página com seus links para mostrar
            no celular.
          </p>
        </div>
      </header>
      <div className="mx-auto -mt-20 max-w-xl px-4">
        <CardForm modo="criar" />
      </div>
    </main>
  );
}
