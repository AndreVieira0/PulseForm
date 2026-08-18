import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import { QuestionBuilder } from "@/components/QuestionBuilder";
import Link from "next/link";
import { redirect } from "next/navigation";

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

        <div className="border-t pt-6">
          <QuestionBuilder formId={form.id} questions={form.questions} />
        </div>
      </div>
    </div>
  );
}
