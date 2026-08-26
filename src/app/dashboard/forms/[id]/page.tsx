import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import { QuestionBuilder } from "@/components/QuestionBuilder";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleFormAction } from "@/server/actions/forms";

interface FormDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormDetailPage({ params }: FormDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
      responses: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { include: { question: { include: { options: true } } } } },
      },
    },
  });

  if (!form || form.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 mt-1">{form.description}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
          >
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {form.isActive ? "Aberto para respostas" : "Fechado para respostas"}
          </span>
          <Link href={`/forms/${form.id}`} target="_blank" className="text-sm text-blue-600 hover:underline">
            Abrir formulário público
          </Link>
          <form action={toggleFormAction}>
            <input type="hidden" name="formId" value={form.id} />
            <button type="submit" className="text-sm text-gray-700 hover:underline">
              {form.isActive ? "Fechar formulário" : "Reabrir formulário"}
            </button>
          </form>
        </div>

        <div className="border-t pt-6">
          <QuestionBuilder formId={form.id} questions={form.questions} />
        </div>

        <section className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Respostas ({form.responses.length}{form.responses.length === 20 ? "+" : ""})
          </h2>
          {form.responses.length === 0 ? (
            <p className="mt-3 text-gray-500">Nenhuma resposta recebida ainda.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {form.responses.map((response) => (
                <article key={response.id} className="rounded-lg border bg-gray-50 p-4">
                  <p className="mb-3 text-sm text-gray-500">
                    {new Date(response.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <dl className="space-y-2">
                    {response.items.map((item) => (
                      <div key={item.id}>
                        <dt className="text-sm font-medium text-gray-700">{item.question.text}</dt>
                        <dd className="text-sm text-gray-900">
                          {item.question.type === "MULTIPLE_CHOICE"
                            ? item.question.options.find((option) => option.id === item.value)?.text ?? item.value
                            : item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
