import { PublicForm } from "@/components/PublicForm";
import { prisma } from "@/backend/db/prisma";
import { notFound } from "next/navigation";

export default async function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!form || !form.isActive) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <PublicForm formId={form.id} title={form.title} description={form.description} questions={form.questions} />
      </div>
    </main>
  );
}
