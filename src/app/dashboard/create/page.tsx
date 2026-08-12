import { auth } from "@/backend/auth";
import { prisma } from "@/backend/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CreateFormPage() {
  // 1. Verifica se o usuário está logado
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Server Action: Função que roda no SERVIDOR quando o formulário for submetido
  async function createForm(formData: FormData) {
    "use server";

    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || title.trim() === "") {
      return;
    }

    // Busca ou cria o usuário no banco se a sessão atual não existir no banco novo
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser && session.user?.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!dbUser) {
      throw new Error("Usuário não encontrado no banco de dados. Por favor, faça login novamente.");
    }

    const newForm = await prisma.form.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: dbUser.id,
      },
    });

    redirect(`/dashboard/forms/${newForm.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Criar Novo Formulário
        </h1>

        <form action={createForm} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Formulário *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ex: Pesquisa de Satisfação"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Ex: Formulário para coletar feedback dos nossos clientes."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
            >
              Criar Formulário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
