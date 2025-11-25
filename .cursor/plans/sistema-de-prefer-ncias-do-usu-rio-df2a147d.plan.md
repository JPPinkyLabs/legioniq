<!-- df2a147d-cd28-4cf2-acf4-120d32ddf5f0 099f3d68-cbd5-4e9c-b961-23cbdf8294fb -->
# Sistema de Preferências do Usuário - Gaming Profile

## Objetivo

Criar um sistema de "super stats" que acompanha cada request para OpenAI, permitindo personalização das respostas baseado no perfil do usuário. O sistema deve coletar informações através de um questionário de onboarding opcional que aparece quando o usuário não tem preferências definidas.

## Estrutura de Dados

### 1. Tabela `preference_questions`

Armazena as questões do questionário de forma flexível, permitindo futuras modificações sem alterar código.

**Campos:**

- `id` (UUID, PK)
- `question_key` (TEXT, UNIQUE) - identificador único da pergunta (ex: "gaming_experience_level")
- `question_text` (TEXT) - texto da pergunta
- `question_type` (ENUM) - tipo: 'single_choice', 'multiple_choice', 'text', 'number', 'range'
- `options` (JSONB) - opções disponíveis para choice questions
- `is_required` (BOOLEAN) - se a pergunta é obrigatória
- `display_order` (INTEGER) - ordem de exibição
- `help_text` (TEXT, nullable) - texto de ajuda opcional
- `created_at`, `updated_at` (TIMESTAMP)

### 2. Tabela `user_preferences`

Armazena as respostas do usuário de forma estruturada, permitindo queries SQL eficientes.

**Campos:**

- `id` (UUID, PK)
- `user_id` (UUID, FK -> auth.users) - referência ao usuário
- `question_key` (TEXT) - referência à questão
- `answer_value` (TEXT) - valor da resposta (para single choice, text)
- `answer_values` (TEXT[]) - valores múltiplos (para multiple choice)
- `answer_number` (NUMERIC, nullable) - para respostas numéricas
- `created_at`, `updated_at` (TIMESTAMP)
- **Constraint UNIQUE:** (user_id, question_key) - uma resposta por questão por usuário

### 3. Modificação na tabela `profiles`

Adicionar coluna para rastrear se o usuário completou o onboarding:

- `has_completed_onboarding` (BOOLEAN, DEFAULT false)

## Perguntas Sugeridas do Questionário

### 1. Nível de Experiência em Gaming

- **question_key:** `gaming_experience_level`
- **Tipo:** single_choice
- **Opções:** 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "beginner" - Iniciante (começando agora)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "intermediate" - Intermediário (alguns anos de experiência)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "advanced" - Avançado (experiente, conhece bem os jogos)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "pro" - Profissional/Competitivo (nível competitivo/esportivo)
- **Obrigatória:** Sim
- **Uso:** Ajusta o nível técnico das respostas da IA

### 2. Tipos de Jogos Preferidos

- **question_key:** `preferred_game_genres`
- **Tipo:** multiple_choice
- **Opções:**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "fps" - FPS (First Person Shooter)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "rpg" - RPG (Role Playing Game)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "moba" - MOBA (Multiplayer Online Battle Arena)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "strategy" - Estratégia
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "battle_royale" - Battle Royale
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "mmorpg" - MMORPG
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "racing" - Corrida
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "sports" - Esportes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "fighting" - Luta
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "puzzle" - Puzzle
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "indie" - Indie
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "other" - Outros
- **Obrigatória:** Sim
- **Uso:** Contextualiza recomendações baseadas nos gêneros preferidos

### 3. Plataformas Principais

- **question_key:** `primary_platforms`
- **Tipo:** multiple_choice
- **Opções:**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "pc" - PC (Windows/Linux/Mac)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "playstation" - PlayStation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "xbox" - Xbox
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "nintendo" - Nintendo Switch
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "mobile" - Mobile (iOS/Android)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "other" - Outras
- **Obrigatória:** Sim
- **Uso:** Ajusta recomendações técnicas específicas da plataforma

### 4. Tempo de Jogo Semanal

- **question_key:** `weekly_gaming_hours`
- **Tipo:** single_choice
- **Opções:**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "1-5" - 1-5 horas por semana
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "6-10" - 6-10 horas por semana
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "11-20" - 11-20 horas por semana
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "21-30" - 21-30 horas por semana
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "30+" - Mais de 30 horas por semana
- **Obrigatória:** Sim
- **Uso:** Indica nível de dedicação e pode ajustar profundidade das respostas

### 5. Objetivo Principal no App

- **question_key:** `primary_goal`
- **Tipo:** single_choice
- **Opções:**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "improve_performance" - Melhorar performance/rank
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "fix_technical_issues" - Resolver problemas técnicos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "learn_strategies" - Aprender estratégias e táticas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "optimize_settings" - Otimizar configurações
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "general_help" - Ajuda geral
- **Obrigatória:** Sim
- **Uso:** Foca as respostas no objetivo principal do usuário

### 6. Estilo de Jogo Preferido

- **question_key:** `gaming_style`
- **Tipo:** single_choice
- **Opções:**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "casual" - Casual (jogar por diversão)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "competitive" - Competitivo (focado em rank/competição)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "hardcore" - Hardcore (dedicação máxima, min-max)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "social" - Social (jogar com amigos)
- **Obrigatória:** Não
- **Uso:** Ajusta o tom e profundidade das recomendações

### 7. Jogos Favoritos (Texto Livre)

- **question_key:** `favorite_games`
- **Tipo:** text
- **Obrigatória:** Não
- **Uso:** Contexto adicional para personalização

## Schema SQL Completo

```sql
-- Enum para tipos de questões
CREATE TYPE public.question_type AS ENUM (
    'single_choice',
    'multiple_choice', 
    'text',
    'number',
    'range'
);

-- Tabela de questões do questionário
CREATE TABLE public.preference_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_key TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- Para questões de escolha: {"options": [{"value": "beginner", "label": "Iniciante"}, ...]}
    is_required BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    help_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de preferências do usuário
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer_value TEXT, -- Para single_choice e text
    answer_values TEXT[], -- Para multiple_choice
    answer_number NUMERIC, -- Para number e range
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_question UNIQUE (user_id, question_key)
);

-- Adicionar coluna has_completed_onboarding na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;

-- Índices para performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_question_key ON public.user_preferences(question_key);
CREATE INDEX idx_preference_questions_display_order ON public.preference_questions(display_order);

-- RLS Policies
ALTER TABLE public.preference_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para preference_questions (todos usuários autenticados podem ler)
CREATE POLICY "Authenticated users can view preference questions"
    ON public.preference_questions FOR SELECT
    TO authenticated
    USING (true);

-- Políticas para user_preferences (usuários só veem suas próprias preferências)
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
    ON public.user_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_preference_questions_updated_at
    BEFORE UPDATE ON public.preference_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir questões padrão do questionário
INSERT INTO public.preference_questions (question_key, question_text, question_type, options, is_required, display_order) VALUES
    ('gaming_experience_level', 'Qual seu nível de experiência em gaming?', 'single_choice', 
     '{"options": [{"value": "beginner", "label": "Iniciante"}, {"value": "intermediate", "label": "Intermediário"}, {"value": "advanced", "label": "Avançado"}, {"value": "pro", "label": "Profissional/Competitivo"}]}'::jsonb, 
     true, 1),
    
    ('preferred_game_genres', 'Quais tipos de jogos você mais joga? (Selecione todos que se aplicam)', 'multiple_choice',
     '{"options": [{"value": "fps", "label": "FPS"}, {"value": "rpg", "label": "RPG"}, {"value": "moba", "label": "MOBA"}, {"value": "strategy", "label": "Estratégia"}, {"value": "battle_royale", "label": "Battle Royale"}, {"value": "mmorpg", "label": "MMORPG"}, {"value": "racing", "label": "Corrida"}, {"value": "sports", "label": "Esportes"}, {"value": "fighting", "label": "Luta"}, {"value": "puzzle", "label": "Puzzle"}, {"value": "indie", "label": "Indie"}, {"value": "other", "label": "Outros"}]}'::jsonb,
     true, 2),
    
    ('primary_platforms', 'Em quais plataformas você joga? (Selecione todas que se aplicam)', 'multiple_choice',
     '{"options": [{"value": "pc", "label": "PC"}, {"value": "playstation", "label": "PlayStation"}, {"value": "xbox", "label": "Xbox"}, {"value": "nintendo", "label": "Nintendo Switch"}, {"value": "mobile", "label": "Mobile"}, {"value": "other", "label": "Outras"}]}'::jsonb,
     true, 3),
    
    ('weekly_gaming_hours', 'Quantas horas por semana você joga?', 'single_choice',
     '{"options": [{"value": "1-5", "label": "1-5 horas"}, {"value": "6-10", "label": "6-10 horas"}, {"value": "11-20", "label": "11-20 horas"}, {"value": "21-30", "label": "21-30 horas"}, {"value": "30+", "label": "Mais de 30 horas"}]}'::jsonb,
     true, 4),
    
    ('primary_goal', 'Qual seu objetivo principal ao usar este app?', 'single_choice',
     '{"options": [{"value": "improve_performance", "label": "Melhorar performance/rank"}, {"value": "fix_technical_issues", "label": "Resolver problemas técnicos"}, {"value": "learn_strategies", "label": "Aprender estratégias e táticas"}, {"value": "optimize_settings", "label": "Otimizar configurações"}, {"value": "general_help", "label": "Ajuda geral"}]}'::jsonb,
     true, 5),
    
    ('gaming_style', 'Como você descreveria seu estilo de jogo?', 'single_choice',
     '{"options": [{"value": "casual", "label": "Casual (jogar por diversão)"}, {"value": "competitive", "label": "Competitivo (focado em rank)"}, {"value": "hardcore", "label": "Hardcore (dedicação máxima)"}, {"value": "social", "label": "Social (jogar com amigos)"}]}'::jsonb,
     false, 6),
    
    ('favorite_games', 'Quais são seus jogos favoritos? (opcional)', 'text',
     NULL,
     false, 7);
```

## Integração com Sistema de Prompts OpenAI

As preferências do usuário serão incorporadas no sistema prompt da seguinte forma:

1. **Função helper** para buscar preferências do usuário
2. **Modificação na função `buildUserPrompt`** em `supabase/functions/process-screenshot/index.ts` para incluir contexto do usuário
3. **Formato sugerido** para adicionar ao prompt:
   ```
   User Profile Context:
   - Experience Level: [beginner/intermediate/advanced/pro]
   - Preferred Genres: [lista de gêneros]
   - Platforms: [lista de plataformas]
   - Gaming Style: [casual/competitive/hardcore/social]
   - Primary Goal: [objetivo]
   
   Please tailor your response to match this user's profile and experience level.
   ```


## Arquivos que Serão Modificados/Criados

1. **Migration SQL:** `supabase/migrations/[timestamp]_create_user_preferences_system.sql`
2. **Types:** Atualizar `src/integrations/supabase/types.ts` (gerado automaticamente)
3. **Hooks:** Criar hooks para buscar/atualizar preferências
4. **Componentes:** Criar componentes de onboarding/questionário
5. **Edge Function:** Modificar `supabase/functions/process-screenshot/index.ts` para incluir preferências no prompt

## Próximos Passos (Após Aprovação)

1. Criar migration SQL completa
2. Criar hooks React Query para gerenciar preferências
3. Criar componente de onboarding/questionário
4. Adicionar lógica de verificação de onboarding no login
5. Modificar edge function para incluir preferências nos prompts
6. Atualizar tipos TypeScript

### To-dos

- [ ] Criar migration SQL com tabelas preference_questions e user_preferences, enum question_type, e inserir questões padrão
- [ ] Adicionar coluna has_completed_onboarding na tabela profiles via migration
- [ ] Criar hooks React Query para buscar questões, salvar preferências e verificar status de onboarding
- [ ] Criar componente de onboarding/questionário usando shadcn/ui com validação e progresso
- [ ] Adicionar verificação de onboarding no fluxo de login/autenticação
- [ ] Modificar edge function process-screenshot para incluir preferências do usuário no prompt da OpenAI
- [ ] Regenerar tipos TypeScript do Supabase após migrations