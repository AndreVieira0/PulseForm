import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import { QuestionBuilder } from "@/components/QuestionBuilder";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { FormAnalytics } from "@/components/FormAnalytics";
import { EditFormModal } from "@/components/EditFormModal";
import { DeleteFormButton } from "@/components/DeleteFormButton";
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
        include: { items: true },
      },
    },
  });

  if (!form || form.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
              <EditFormModal
                formId={form.id}
                initialTitle={form.title}
                initialDescription={form.description}
              />
            </div>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition shrink-0"
          >
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-gray-100 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${form.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
              {form.isActive ? "Aberto para respostas" : "Fechado para respostas"}
            </span>
            <CopyLinkButton formId={form.id} />
            <Link href={`/forms/${form.id}`} target="_blank" className="text-sm text-blue-600 hover:underline font-medium">
              Abrir formulário público
            </Link>
            <form action={toggleFormAction}>
              <input type="hidden" name="formId" value={form.id} />
              <button type="submit" className="text-sm text-gray-700 hover:underline">
                {form.isActive ? "Fechar formulário" : "Reabrir formulário"}
              </button>
            </form>
          </div>

          <DeleteFormButton formId={form.id} formTitle={form.title} />
        </div>

        <div className="border-t pt-6">
          <QuestionBuilder formId={form.id} questions={form.questions} />
        </div>

        <section className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Respostas & Estatísticas
          </h2>
          <FormAnalytics questions={form.questions} responses={form.responses} />
        </section>
      </div>
    </div>
  );
}
