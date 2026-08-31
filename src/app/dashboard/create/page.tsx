"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createForm } from "@/server/forms";
import toast from "react-hot-toast";

export default function CreateFormPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createForm(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.formId) {
        toast.success("Formulário criado com sucesso!");
        router.push(`/dashboard/forms/${result.formId}`);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Criar Novo Formulário
        </h1>

        <form action={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {isPending ? "Criando..." : "Criar Formulário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
