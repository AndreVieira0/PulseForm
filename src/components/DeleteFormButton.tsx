"use client";

import { useState, useTransition } from "react";
import { deleteFormAction } from "@/server/actions/forms";
import toast from "react-hot-toast";

interface DeleteFormButtonProps {
  formId: string;
  formTitle: string;
}

export function DeleteFormButton({ formId, formTitle }: DeleteFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("formId", formId);

      const result = await deleteFormAction(formData);
      if (result?.error) {
        toast.error(result.error);
        setIsOpen(false);
        return;
      }
      toast.success("Formulário excluído com sucesso!");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium"
        title="Excluir este formulário permanentemente"
      >
        Excluir formulário
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-center text-lg font-bold text-gray-900">Excluir Formulário</h3>
            <p className="mt-2 text-center text-sm text-gray-600">
              Tem certeza que deseja excluir o formulário <strong>&quot;{formTitle}&quot;</strong>?
              Esta ação é permanente e removerá todas as perguntas e respostas vinculadas.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
