import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Por favor, forneça um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
});

export const createFormSchema = z.object({
  title: z.string().trim().min(1, "O título do formulário é obrigatório."),
  description: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres.").optional().or(z.literal("")),
});

export const questionTypeSchema = z.enum(["TEXT", "MULTIPLE_CHOICE", "SCALE"]);

export const createQuestionSchema = z.object({
  formId: z.string().min(1, "Formulário inválido."),
  text: z.string().trim().min(1, "O texto da pergunta é obrigatório."),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  options: z.array(z.string().trim().min(1, "Cada alternativa deve ter texto." )).default([]),
});

export const updateQuestionSchema = z.object({
  formId: z.string().min(1, "Formulário inválido."),
  questionId: z.string().min(1, "Pergunta inválida."),
  text: z.string().trim().min(1, "O texto da pergunta é obrigatório."),
  type: questionTypeSchema,
  isRequired: z.boolean().default(false),
  options: z.array(z.string().trim().min(1, "Cada alternativa deve ter texto.")).default([]),
});
