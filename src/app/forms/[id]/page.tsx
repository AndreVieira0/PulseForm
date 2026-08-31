import { PublicForm } from "@/components/PublicForm";
import { prisma } from "@/backend/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PublicFormPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}

export default async function PublicFormPage({
  params,
  searchParams,
}: PublicFormPageProps) {
  const { id } = await params;
  const { submitted } = await searchParams;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!form) {
    notFound();
  }

  if (submitted === "1") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Resposta enviada!</h1>
          <p className="mt-2 text-gray-600">
            Obrigado por responder ao formulário{" "}
            <strong className="text-gray-800">{form.title}</strong>.
          </p>

          {form.isActive && (
            <div className="mt-6">
              <Link
                href={`/forms/${form.id}`}
                className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Enviar outra resposta
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (!form.isActive) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Formulário Indisponível</h1>
          <p className="mt-2 text-gray-600">
            Este formulário foi encerrado pelo organizador e não está aceitando novas respostas no momento.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <PublicForm
          formId={form.id}
          title={form.title}
          description={form.description}
          questions={form.questions}
        />
      </div>
    </main>
  );
}
