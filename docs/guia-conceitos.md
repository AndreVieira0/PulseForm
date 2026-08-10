# 📚 Guia de Conceitos do PulseForm

Este documento guarda as explicações fundamentais da linguagem JavaScript, TypeScript e Next.js utilizadas na construção do projeto **PulseForm**.

---

## 1. Importações e Exportações (Imports e Exports)

Na linguagem JavaScript/TypeScript, os arquivos disponibilizam código para outros arquivos de duas formas:

### 📦 Exportação Padrão (`Default Export`) ➔ **SEM CHAVES**
* **O que é:** O arquivo define **UMA coisa principal** como o seu produto oficial.
* **Sintaxe de Importação:** Importa direto, sem usar chaves `{}`.
* **Exemplo:** 
  ```tsx
  import Link from "next/link";
  ```

### 📦 Exportação Nomeada (`Named Export`) ➔ **COM CHAVES `{ }`**
* **O que é:** O arquivo disponibiliza **VÁRIAS coisas diferentes**, cada uma com seu próprio nome.
* **Sintaxe de Importação:** Usa-se chaves `{}` para escolher exatamente quais itens pegar.
* **Exemplo:**
  ```tsx
  import { auth, signOut } from "@/backend/auth";
  import { redirect } from "next/navigation";
  ```

---

## 2. Programação Assíncrona (`async` e `await`)

Operações que consultam banco de dados, leem arquivos ou acessam a internet levam alguns milissegundos para responder.

* **`async` (Assíncrono):** Colocado antes da função para avisar ao computador: *"Esta função fará tarefas demoradas e precisará saber esperar"*.
* **`await` (Espere!):** Colocado antes da chamada de uma função assíncrona. Ele faz o código pausar exatamente naquela linha e só continuar para a linha seguinte quando a resposta chegar.

```tsx
export default async function DashboardPage() {
  // O código PAUSA aqui até a função auth() ler o banco de dados
  const session = await auth(); 
}
```

---

## 3. Objetos e Propriedades (A Analogia do Envelope)

Em JavaScript, objetos são como **envelopes ou caixas** que guardam várias informações etiquetadas dentro.

Quando rodamos `const session = await auth();`, a variável `session` recebe um objeto com esta estrutura:

```json
{
  "user": {
    "id": "12345",
    "name": "Ricardo",
    "email": "ricardo@email.com"
  },
  "expires": "2026-09-10T15:00:00.000Z"
}
```

Para acessar o que está dentro do "envelope", usamos o ponto (`.`):
* `session.expires` ➔ Pega a data de expiração.
* `session.user` ➔ Pega a caixa com os dados do usuário.
* `session.user.name` ➔ Pega o nome do usuário.

---

## 4. Segurança com Encadeamento Opcional (`?.`) e Negação (`!`)

No código do Dashboard, usamos a verificação:

```tsx
if (!session?.user) {
  redirect("/login");
}
```

* **`?.` (Encadeamento Opcional / Optional Chaining):** Evita que a aplicação quebre com erro de tela branca caso o usuário não esteja logado (`session` seja `null`). Ele diz: *"Se a sessão existir, olhe o `user`. Se for nula, não dê erro, apenas retorne nulo"*.
* **`!` (Operador de Negação / NÃO):** Inverte o resultado booleano (verdadeiro/falso).
* **Leitura da frase inteira:** *"Se NÃO houver um usuário logado na sessão, redirecione para a página de login."*

---

## 5. Estrutura do Arquivo no Next.js (App Router)

Cada arquivo chamado `page.tsx` dentro da pasta `src/app/` vira automaticamente uma página navegável no site:

* `src/app/page.tsx` ➔ Página inicial (`/`)
* `src/app/login/page.tsx` ➔ Página de login (`/login`)
* `src/app/register/page.tsx` ➔ Página de cadastro (`/register`)
* `src/app/dashboard/page.tsx` ➔ Painel do criador (`/dashboard`)
