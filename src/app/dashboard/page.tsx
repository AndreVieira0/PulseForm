import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar formulários diretamente do banco de dados com contadores (Server-Side)
  const forms = await prisma.form.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          questions: true,
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da página reutilizável */}
      <Header userName={session.user.name} userEmail={session.user.email} />

      {/* Container: Lista de Formulários */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Seus formulários
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie seus questionários e acompanhe as respostas coletadas.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Novo formulário
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nenhum formulário criado</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Você ainda não criou nenhum formulário. Clique em “Novo formulário” para criar o seu primeiro questionário.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Criar Primeiro Formulário
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <li
                key={form.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        form.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {form.isActive ? "Ativo" : "Fechado"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(form.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Link href={`/dashboard/forms/${form.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                      {form.title}
                    </h3>
                  </Link>

                  {form.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{form._count.questions} {form._count.questions === 1 ? "pergunta" : "perguntas"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-700">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{form._count.responses} {form._count.responses === 1 ? "resposta" : "respostas"}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
