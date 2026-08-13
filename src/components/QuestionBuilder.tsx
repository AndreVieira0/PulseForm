"use client";

import { addQuestionAction, deleteQuestionAction } from "@/actions/question-actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "SCALE";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options: QuestionOption[];
}

interface QuestionBuilderProps {
  formId: string;
  questions: Question[];
  maxQuestions?: number;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: "Texto livre",
  MULTIPLE_CHOICE: "Múltipla escolha",
  SCALE: "Escala (1–5)",
};

export function QuestionBuilder({
  formId,
  questions,
  maxQuestions = 20,
}: QuestionBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<QuestionType>("TEXT");

  const atLimit = questions.length >= maxQuestions;

  function handleAddQuestion(formData: FormData) {
    startTransition(async () => {
      const result = await addQuestionAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Pergunta adicionada!");
      router.refresh();
    });
  }

  function handleDeleteQuestion(formData: FormData) {
    startTransition(async () => {
      const result = await deleteQuestionAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Pergunta removida.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Perguntas</h2>
        <span className="text-sm text-gray-500">
          {questions.length}/{maxQuestions}
        </span>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-500 italic">
          Nenhuma pergunta adicionada ainda. Use o formulário abaixo para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {questions.map((question, index) => (
            <li
              key={question.id}
              className="p-4 border rounded-lg bg-gray-50 flex justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {index + 1}.
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {TYPE_LABELS[question.type as QuestionType] ?? question.type}
                  </span>
                  {question.isRequired && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Obrigatória
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{question.text}</p>
                {question.options.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    {question.options.map((option) => (
                      <li key={option.id}>{option.text}</li>
                    ))}
                  </ul>
                )}
              </div>

              <form action={handleDeleteQuestion}>
                <input type="hidden" name="formId" value={formId} />
                <input type="hidden" name="questionId" value={question.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {atLimit ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Limite de {maxQuestions} perguntas atingido.
        </p>
      ) : (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Adicionar pergunta
          </h3>

          <form action={handleAddQuestion} className="space-y-4">
            <input type="hidden" name="formId" value={formId} />

            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Texto da pergunta *
              </label>
              <input
                id="text"
                name="text"
                type="text"
                required
                placeholder="Ex: Como você avalia nosso atendimento?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TEXT">Texto livre</option>
                <option value="MULTIPLE_CHOICE">Múltipla escolha</option>
                <option value="SCALE">Escala (1–5)</option>
              </select>
            </div>

            {type === "MULTIPLE_CHOICE" && (
              <div>
                <label
                  htmlFor="options"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Opções (uma por linha) *
                </label>
                <textarea
                  id="options"
                  name="options"
                  required
                  rows={4}
                  placeholder={"Excelente\nBom\nRegular\nRuim"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isRequired"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Pergunta obrigatória
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Adicionar pergunta"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
