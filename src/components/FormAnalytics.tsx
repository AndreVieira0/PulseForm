"use client";

import { useState } from "react";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  order: number;
  isRequired: boolean;
  options: Option[];
}

interface ResponseItem {
  id: string;
  questionId: string;
  value: string;
}

interface ResponseData {
  id: string;
  createdAt: Date | string;
  items: ResponseItem[];
}

interface FormAnalyticsProps {
  questions: Question[];
  responses: ResponseData[];
}

export function FormAnalytics({ questions, responses }: FormAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"charts" | "individual">("charts");
  const totalResponses = responses.length;

  if (totalResponses === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900">Nenhuma resposta recebida ainda</h3>
        <p className="mt-1 text-sm text-gray-500">
          Compartilhe o link do seu formulário para começar a coletar e visualizar as estatísticas aqui em tempo real.
        </p>
      </div>
    );
  }

  const latestResponse = responses[0]?.createdAt
    ? new Date(responses[0].createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total de Respostas</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalResponses}</p>
          <p className="mt-1 text-xs text-gray-400">
            {totalResponses === 1 ? "1 resposta coletada" : `${totalResponses} respostas coletadas`}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Última Resposta</p>
          <p className="mt-2 text-xl font-semibold text-gray-800">{latestResponse}</p>
          <p className="mt-1 text-xs text-gray-400">Horário da submissão mais recente</p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("charts")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "charts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Resumo & Gráficos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("individual")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
              activeTab === "individual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Respostas Individuais ({totalResponses})
          </button>
        </nav>
      </div>

      {/* Conteúdo da Aba: Resumo & Gráficos */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {questions.map((question, index) => {
            const questionResponses = responses
              .map((r) => r.items.find((item) => item.questionId === question.id))
              .filter((item): item is ResponseItem => Boolean(item && item.value));

            const totalAnswered = questionResponses.length;

            return (
              <div
                key={question.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Pergunta {index + 1}
                    </span>
                    <h4 className="text-base font-semibold text-gray-900 mt-1">
                      {question.text}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1 font-medium">
                    {totalAnswered} {totalAnswered === 1 ? "resposta" : "respostas"}
                  </span>
                </div>

                {totalAnswered === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhuma resposta para esta pergunta.</p>
                ) : question.type === "MULTIPLE_CHOICE" ? (
                  /* Gráfico de Barras para Múltipla Escolha */
                  <div className="space-y-3 pt-2">
                    {question.options.map((option) => {
                      const count = questionResponses.filter(
                        (r) => r.value === option.id || r.value === option.text
                      ).length;
                      const percentage = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;

                      return (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{option.text}</span>
                            <span className="text-gray-500 font-semibold">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : question.type === "SCALE" ? (
                  /* Estatísticas para Escala (1 a 5) */
                  (() => {
                    const values = questionResponses
                      .map((r) => Number(r.value))
                      .filter((n) => !isNaN(n) && n >= 1 && n <= 5);

                    const average =
                      values.length > 0
                        ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
                        : "0.0";

                    return (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-4 rounded-lg bg-blue-50/70 p-4">
                          <div className="text-center">
                            <span className="text-3xl font-extrabold text-blue-700">{average}</span>
                            <span className="text-sm font-medium text-blue-500"> / 5.0</span>
                            <p className="text-xs text-blue-600 font-medium">Nota Média</p>
                          </div>
                          <div className="h-10 w-px bg-blue-200" />
                          <div className="flex-1 text-xs text-blue-800">
                            Avaliação calculada a partir de {values.length}{" "}
                            {values.length === 1 ? "nota informada" : "notas informadas"}.
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((scaleVal) => {
                            const count = values.filter((v) => v === scaleVal).length;
                            const percentage = values.length > 0 ? Math.round((count / values.length) * 100) : 0;

                            return (
                              <div key={scaleVal} className="flex items-center gap-3 text-sm">
                                <span className="w-12 text-right font-medium text-gray-700">
                                  {scaleVal} {scaleVal === 1 ? "estrela" : "estrelas"}
                                </span>
                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-14 text-right text-xs font-semibold text-gray-600">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* Lista de Respostas em Texto Livre */
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {questionResponses.map((r, rIdx) => (
                      <div
                        key={r.id || rIdx}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800"
                      >
                        {r.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Conteúdo da Aba: Respostas Individuais */}
      {activeTab === "individual" && (
        <div className="space-y-4">
          {responses.map((response, rIndex) => (
            <article
              key={response.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  Envio #{totalResponses - rIndex}
                </span>
                <time className="text-xs text-gray-500">
                  {new Date(response.createdAt).toLocaleString("pt-BR")}
                </time>
              </div>

              <dl className="space-y-3 pt-1">
                {questions.map((question) => {
                  const item = response.items.find((i) => i.questionId === question.id);
                  let displayValue = item?.value || <span className="italic text-gray-400">Não respondida</span>;

                  if (item && question.type === "MULTIPLE_CHOICE") {
                    const matchedOption = question.options.find(
                      (opt) => opt.id === item.value || opt.text === item.value
                    );
                    if (matchedOption) {
                      displayValue = matchedOption.text;
                    }
                  } else if (item && question.type === "SCALE") {
                    displayValue = `${item.value} / 5`;
                  }

                  return (
                    <div key={question.id} className="text-sm">
                      <dt className="font-medium text-gray-700">{question.text}</dt>
                      <dd className="mt-0.5 text-gray-900">{displayValue}</dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
