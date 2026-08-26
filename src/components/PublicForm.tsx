"use client";

import { submitResponse } from "@/server/forms";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

interface PublicQuestion {
  id: string;
  text: string;
  type: string;
  isRequired: boolean;
  options: { id: string; text: string }[];
}

export function PublicForm({
  formId,
  title,
  description,
  questions,
}: {
  formId: string;
  title: string;
  description: string | null;
  questions: PublicQuestion[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitResponse(formId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Resposta enviada com sucesso!");
      router.push(`/forms/${formId}?submitted=1`);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>

      {questions.map((question, index) => (
        <fieldset key={question.id} className="space-y-2">
          <legend className="font-medium text-gray-900">
            {index + 1}. {question.text}
            {question.isRequired && <span className="ml-1 text-red-600">*</span>}
          </legend>

          {question.type === "MULTIPLE_CHOICE" ? (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-gray-700">
                  <input type="radio" name={`question-${question.id}`} value={option.id} required={question.isRequired} />
                  {option.text}
                </label>
              ))}
            </div>
          ) : question.type === "SCALE" ? (
            <select name={`question-${question.id}`} required={question.isRequired} defaultValue="" className="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="" disabled>Selecione uma nota</option>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          ) : (
            <textarea name={`question-${question.id}`} required={question.isRequired} maxLength={5000} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2" />
          )}
        </fieldset>
      ))}

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={isPending} className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {isPending ? "Enviando..." : "Enviar resposta"}
      </button>
    </form>
  );
}
