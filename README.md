# PulseForm

Uma plataforma simples e direta para criação de formulários de pesquisa e feedback personalizados. O PulseForm permite que usuários criem questionários rapidamente, compartilhem um link público e acompanhem as respostas em um dashboard com gráficos intuitivos — tudo isso com o essencial, sem excesso de recursos, como uma versão simplificada do Google Forms.

## Papéis do Sistema

O sistema é dividido em duas experiências principais:

### 1. Criador (Usuário Logado)

- **Acesso:** Cria conta e faz login na plataforma.
- **Ações:**
  - Cria formulários com perguntas personalizadas.
  - Define o tipo de cada pergunta (Texto livre, Múltipla escolha, Escala/Nota).
  - Compartilha o link público do formulário gerado.
- **Acompanhamento:** Visualiza todas as respostas recebidas em um dashboard interativo.

### 2. Respondente (Sem Login)

- **Acesso:** Acessa o link público do formulário.
- **Ações:**
  - Visualiza as perguntas e responde.
  - Envia as respostas de forma anônima e sem necessidade de cadastro.

---

## Fluxo de Uso (Jornada Completa)

1. **Cadastro/Login:** O Criador se cadastra e faz login na plataforma.
2. **Criação do Formulário:**
   - O Criador inicia um novo formulário e define um título (ex: _"Pesquisa de satisfação — Evento X"_).
   - Ele adiciona perguntas uma por uma, definindo o tipo de cada:
     - **Texto livre** (resposta curta/longa)
     - **Múltipla escolha** (com opções definidas pelo criador)
     - **Escala/nota** (ex: 1 a 5)
3. **Geração do Link:** O formulário é salvo e o sistema gera um link único e público.
4. **Compartilhamento:** O Criador distribui o link para seu público-alvo (WhatsApp, e-mail, redes sociais, etc.).
5. **Coleta de Respostas:** Qualquer pessoa com o link abre o formulário, responde e envia os dados.
6. **Análise de Dados:** O Criador acessa a plataforma e visualiza no dashboard o volume de respostas e um resumo visual de cada pergunta (gráficos de barras para múltipla escolha, médias para escalas e listas para textos livres).

---

## Entidades Principais (Modelo de Dados Inicial)

- **Usuário:** Quem cria os formulários (Nome, E-mail, Senha).
- **Formulário:** Pertence a um usuário (Título, Descrição, Data de Criação, Status ativo/inativo).
- **Pergunta:** Pertence a um formulário (Texto da pergunta, Tipo, Ordem, Obrigatória/Opcional).
- **Opção:** Pertence a uma pergunta do tipo múltipla escolha (Texto da opção).
- **Resposta (Submissão):** Um envio completo feito por um respondente (Data/Hora, IP do respondente para evitar duplicidade).
- **Item de Resposta:** A resposta individual dada para uma pergunta específica dentro de uma submissão.

---

## Regras de Negócio e Decisões de Projeto

Para manter a simplicidade e o foco no MVP (Minimum Viable Product), as seguintes regras foram estabelecidas:

- **Obrigatoriedade:** Um formulário pode conter perguntas obrigatórias e opcionais, definido pelo Criador.
- **Edição de Respostas:** O respondente **não** pode editar sua resposta após o envio. O fluxo é simples: respondeu, enviou, finalizado.
- **Controle de Recebimento:** O Criador tem o poder de abrir e fechar um formulário, interrompendo o recebimento de novas respostas.
- **Limitação:** Existe um limite de perguntas por formulário (Sugestão: **20 perguntas**). Isso garante uma boa experiência para quem responde e evita complexidade desnecessária na interface.
