# Migração do Onboarding Modal para Overlay Fullscreen

## Objetivo
Transformar o onboarding de modal para um overlay fullscreen que cobre toda a tela sobre a plataforma, bloqueando acesso até completar. A plataforma fica carregada abaixo do overlay, mas não visível/interagível. Após completar, o overlay desaparece com animação revelando a plataforma.

## Arquivos Principais a Modificar

### 1. Criar Componente de Overlay Fullscreen
- **`src/components/onboarding/OnboardingOverlay.tsx`** (novo)
  - Componente principal que substitui o OnboardingModal
  - Overlay fullscreen fixo (fixed inset-0) com z-index alto (z-50)
  - Bloqueia interação com conteúdo abaixo (pointer-events)
  - Layout responsivo: header com logo/nome, área de conteúdo scrollável, footer com navegação
  - Animações apenas no fechamento (fade out + scale)
  - Usar CSS transitions para animações (sem framer-motion)

### 2. Criar Componentes Modulares do Overlay
- **`src/components/onboarding/OnboardingOverlayContainer.tsx`** (novo)
  - Container principal com `fixed inset-0 z-50 bg-background`
  - Conteúdo centralizado com `max-w-4xl` para espaçamento lateral
  - Sem animação de entrada (aparece instantaneamente)
  - Animação de saída apenas quando `isExiting` é true

- **`src/components/onboarding/OnboardingOverlayHeader.tsx`** (novo)
  - Header com logo Legion IQ (baseado no tema)
  - Texto explicativo sobre o onboarding
  - Padding `px-2` no conteúdo

- **`src/components/onboarding/OnboardingOverlayContent.tsx`** (novo)
  - Área de conteúdo scrollável
  - Padding `px-2` no conteúdo interno
  - Animações de transição entre steps (slide-in-forward, slide-in-backward)

- **`src/components/onboarding/OnboardingOverlayNavigation.tsx`** (novo)
  - Botões Previous/Next
  - Contador de steps minimalista (ex: "1/4")
  - Cores: primária para total, muted para atual (exceto quando atual === total)
  - Barra "/" também primária

- **`src/components/onboarding/IntroductionStep.tsx`** (novo)
  - Step de introdução antes da primeira pergunta
  - Logo Legion IQ grande
  - Texto genérico explicando o questionário
  - Sem header e sem contador de steps

- **`src/components/onboarding/useOnboardingOverlay.ts`** (novo)
  - Hook customizado com toda a lógica do onboarding
  - Estados: currentStep (começa em -1 para introduction), isSending, isValid, answers
  - Handlers: handleNext, handlePrevious, handleComplete
  - Lógica de validação e salvamento

### 3. Migrar Lógica do OnboardingModal
- **`src/components/onboarding/OnboardingOverlay.tsx`**
  - Migrar toda a lógica de `OnboardingModal.tsx`:
    - Estados e hooks já estarão no `useOnboardingOverlay`
    - Renderização condicional: OnboardingLoader, SendingStep, IntroductionStep, OnboardingStep
  - Usar componentes modulares criados acima
  - Adicionar animações de transição entre steps usando CSS classes

### 4. Modificar AuthenticatedLayout
- **`src/components/AuthenticatedLayout.tsx`**
  - Manter estrutura da plataforma renderizada normalmente
  - Substituir `OnboardingModal` por `OnboardingOverlay`
  - Overlay aparece sobre a plataforma quando `!hasCompletedOnboarding`
  - Plataforma fica visível mas não interagível quando overlay está aberto
  - Adicionar classes condicionais para bloquear pointer-events na plataforma quando overlay está aberto
  - Adicionar blur e opacity reduzida na plataforma quando overlay está aberto
  - Após completar onboarding, overlay desaparece com animação revelando plataforma

### 5. Implementar Animações CSS
- **Transições entre steps:**
  - Adicionar `@keyframes` em `src/index.css`:
    - `slide-in-forward`: opacity 0 → 1, translateX(-20px → 0)
    - `slide-in-backward`: opacity 0 → 1, translateX(20px → 0)
  - Duração: ~300ms
- **Fechamento do overlay:**
  - Fade out + scale (1.0 → 0.95)
  - Após animação completa, remover overlay do DOM
  - Duração: ~300ms
  - Revela plataforma abaixo suavemente
- **Abertura do overlay:**
  - Sem animação - aparece instantaneamente

### 6. Bloqueio de Interação
- Overlay deve ter `pointer-events: auto`
- Conteúdo abaixo (plataforma) deve ter `pointer-events: none` quando overlay está visível
- Bloquear scroll do body quando overlay estiver aberto (usar useEffect para adicionar/remover classe no body)
- Prevenir navegação/escape até completar onboarding

### 7. Estrutura Visual
- Overlay cobre 100% da viewport (fixed inset-0)
- Background sólido
- Plataforma abaixo com blur e opacity reduzida para indicar que está bloqueada
- z-index alto (z-50) para garantir que fica acima de tudo
- Conteúdo centralizado com `max-w-4xl` para espaçamento lateral

## Estrutura de Componentes

```
AuthenticatedLayout
  ├─ Plataforma (SidebarProvider, AppSidebar, etc.)
  │   └─ Conteúdo normal da plataforma (bloqueado quando overlay está aberto)
  └─ OnboardingOverlay (quando !hasCompletedOnboarding)
      ├─ OnboardingOverlayContainer
      │   ├─ OnboardingOverlayHeader (condicional - não aparece no introduction step)
      │   ├─ OnboardingOverlayContent
      │   │   ├─ OnboardingLoader (loading)
      │   │   ├─ IntroductionStep (step -1)
      │   │   ├─ OnboardingStep (steps 0+)
      │   │   └─ SendingStep (enviando)
      │   └─ OnboardingOverlayNavigation (condicional - não aparece no introduction step)
```

## Fluxo de Funcionamento

1. Usuário autenticado acessa `/platform` ou qualquer rota protegida
2. `AuthenticatedLayout` renderiza plataforma normalmente
3. `AuthenticatedLayout` verifica `hasCompletedOnboarding`
4. Se `false`, renderiza `OnboardingOverlay` sobre a plataforma
5. Plataforma fica carregada abaixo, mas não visível/interagível (blur + opacity reduzida)
6. Usuário vê IntroductionStep primeiro (step -1)
7. Usuário clica Next → vai para primeira pergunta (step 0)
8. Usuário completa onboarding no overlay fullscreen
9. Após salvar respostas e completar, animação de saída do overlay
10. Overlay desaparece revelando plataforma abaixo

## Detalhes de Implementação

### Introduction Step
- `currentStep = -1`
- Não mostra header
- Não mostra contador de steps
- Botão Previous desabilitado
- Botão Next sempre habilitado

### Navegação
- Contador mostra "currentStep + 1 / totalSteps"
- Quando currentStep + 1 === totalSteps, número atual fica primário
- Barra "/" sempre primária
- Total sempre primário

### Animações
- Overlay aparece sem animação (opacity-100 scale-100 instantaneamente)
- Transições entre steps: slide-in-forward (próximo) ou slide-in-backward (anterior)
- Fechamento: transition-all duration-300 opacity-0 scale-[0.95]

### Padding
- Header: `px-2` no conteúdo interno
- Content: `px-2` no conteúdo interno de cada step
- Navigation: padding padrão

## Checklist de Implementação

- [ ] Criar `OnboardingOverlayContainer.tsx`
- [ ] Criar `OnboardingOverlayHeader.tsx`
- [ ] Criar `OnboardingOverlayContent.tsx`
- [ ] Criar `OnboardingOverlayNavigation.tsx`
- [ ] Criar `IntroductionStep.tsx`
- [ ] Criar `useOnboardingOverlay.ts` hook
- [ ] Criar `OnboardingOverlay.tsx` principal
- [ ] Adicionar animações CSS em `index.css`
- [ ] Adicionar animações no `tailwind.config.ts`
- [ ] Modificar `AuthenticatedLayout.tsx` para usar overlay
- [ ] Remover `OnboardingModal.tsx` (ou manter como backup temporário)
- [ ] Testar fluxo completo de onboarding
- [ ] Verificar bloqueio de interação com plataforma
- [ ] Verificar animações de transição entre steps
- [ ] Verificar animação de fechamento

