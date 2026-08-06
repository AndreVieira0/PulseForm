import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <main className="max-w-3xl w-full text-center flex flex-col gap-8 items-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          PulseForm
        </h1>
        <p className="text-xl text-gray-600 max-w-xl mx-auto">
          Crie formulários de pesquisa e feedback em segundos. Compartilhe um link público e colete respostas de forma rápida e sem complicações.
        </p>

        <div className="flex gap-4 items-center justify-center mt-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-blue-600 text-white px-8 py-3 text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Acessar Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white text-gray-900 border border-gray-200 px-8 py-3 text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </main>

      <footer className="mt-24 text-gray-500 text-sm">
        Uma alternativa simples e focada em resultados.
      </footer>
    </div>
  );
}
