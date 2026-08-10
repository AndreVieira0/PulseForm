import { auth, signOut } from "@/backend/auth";
import { prisma } from "@/backend/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar formulários diretamente do banco de dados (Server-Side)
  const forms = await prisma.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da página */}
      <header className="bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">PulseForm</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Olá, <strong>{session.user.name || session.user.email}</strong>
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Container: Lista de Formulários */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Seus formulários
          </h2>
          <Link
            href="/dashboard/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Novo formulário
          </Link>
        </div>

        {forms.length === 0 ? (
          <p className="text-gray-600">
            Você ainda não criou nenhum formulário. Clique em “Novo formulário”
            para começar.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <li
                key={form.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
              >
                <Link href={`/dashboard/forms/${form.id}`}>
                  <h3 className="text-lg font-medium text-blue-600 hover:underline">
                    {form.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-500 mt-2">
                  Criado em{" "}
                  {new Date(form.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
