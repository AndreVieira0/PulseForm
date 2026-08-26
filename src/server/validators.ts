import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().toLowerCase().email("Por favor, forneça um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
});

export const createFormSchema = z.object({
  title: z.string().trim().min(1, "O título do formulário é obrigatório.").max(200, "O título deve ter no máximo 200 caracteres."),
  description: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres.").optional().or(z.literal("")),
});

export const questionTypeSchema = z.enum(["TEXT", "MULTIPLE_CHOICE", "SCALE"]);

export const createQuestionSchema = z.object({
  formId: z.string().min(1, "Formulário inválido."),
  text: z.string().trim().min(1, "O texto da pergunta é obrigatório.").max(1000, "A pergunta deve ter no máximo 1000 caracteres."),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  options: z.array(z.string().trim().max(300, "Cada alternativa deve ter no máximo 300 caracteres.")).max(50, "Uma pergunta pode ter no máximo 50 alternativas.").default([]),
});

export const updateQuestionSchema = z.object({
  formId: z.string().min(1, "Formulário inválido."),
  questionId: z.string().min(1, "Pergunta inválida."),
  text: z.string().trim().min(1, "O texto da pergunta é obrigatório.").max(1000, "A pergunta deve ter no máximo 1000 caracteres."),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  options: z.array(z.string().trim().max(300, "Cada alternativa deve ter no máximo 300 caracteres.")).max(50, "Uma pergunta pode ter no máximo 50 alternativas.").default([]),
});
