

# Plano: Submenu "Controle de Férias" para Gestores

## Objetivo
Criar uma nova página no submenu de Gestores que apresenta uma visão estilo planilha para controle de férias dos colaboradores, com colunas de meses e indicação visual de períodos de férias.

---

## O que será criado

### 1. Nova rota e menu
- Adicionar submenu "Controle de Férias" no menu Gestores do sidebar
- Criar nova rota `/gestores/controle-ferias`
- Ícone: `CalendarRange` ou similar do Lucide

### 2. Página com tabela estilo planilha
A visualização seguirá exatamente o layout da referência:

**Colunas:**
| Nome | Status | Venc. | Saldo Início | Team Leader | JAN | FEV | MAR | ABR | MAI | JUN | JUL | AGO | SET | OUT | NOV | DEZ | Saldo Final |

**Funcionalidades:**
- Scroll horizontal para acomodar todas as colunas de meses
- Células de meses mostram:
  - Férias agendadas: "férias (01 a 07)" com fundo colorido (verde para aprovadas)
  - Créditos: "Crédito: 20" em amarelo quando aplicável
  - Célula vazia: "-" 
- Filtro por setor (gestores veem apenas seus setores, admins veem todos)

---

## Detalhes Técnicos

### Arquivos a criar/modificar:

```text
1. src/pages/gestores/ControleFerias.tsx  (NOVO)
   - Componente principal da página
   - Query para buscar vacation_requests
   - Lógica para agrupar férias por colaborador e mês
   - Tabela com scroll horizontal

2. src/components/layout/AppSidebar.tsx  (MODIFICAR)
   - Adicionar item "Controle de Férias" no submenu Gestores
   - URL: /gestores/controle-ferias
   - Ícone: CalendarRange

3. src/App.tsx  (MODIFICAR)
   - Adicionar rota protegida para /gestores/controle-ferias
```

### Estrutura de dados para a tabela:

```typescript
interface EmployeeVacationRow {
  employeeId: string;
  employeeName: string;
  status: "Ativo" | "Afastado" | "Férias";
  vencimento: string;         // Data de vencimento (MM/YYYY)
  saldoInicio: number;        // Saldo de dias no início do ano
  teamLeader: string;         // Nome do gestor responsável
  meses: MonthVacation[];     // Array com dados de cada mês
  saldoFinal: number;         // Saldo restante
}

interface MonthVacation {
  month: number;              // 1-12
  type: "ferias" | "credito" | "vazio";
  label?: string;             // Ex: "férias (01 a 07)" ou "Crédito: 20"
  days?: { start: number; end: number };
}
```

### Lógica de processamento:
1. Buscar todas as vacation_requests do setor do gestor
2. Agrupar por `employee_id` e `employee_name`
3. Para cada colaborador, mapear os 12 meses do ano
4. Para cada mês, verificar se há férias aprovadas naquele período
5. Calcular saldo final baseado nos dias utilizados

### Componente visual da célula de mês:

```typescript
// Célula verde para férias aprovadas
<div className="bg-emerald-100 text-emerald-800 text-xs px-1 py-0.5 rounded text-center">
  férias<br/>(01 a 07)
</div>

// Célula azul para créditos
<div className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded text-center">
  Crédito: 20
</div>

// Célula vazia
<span className="text-muted-foreground">-</span>
```

---

## Filtros e Permissões

- **Gestores**: Visualizam apenas colaboradores dos setores atribuídos
- **Admins**: Visualizam todos os colaboradores de todos os setores
- Badge visual indicando o modo de visualização
- Aviso se gestor não possui setores atribuídos

---

## Interface Final

A página terá:
1. **Header** com título e badges de setor
2. **Cards de estatísticas** (Total colaboradores, Em férias, Saldo disponível)
3. **Tabela com scroll horizontal** para comportar todas as 17+ colunas
4. **Células coloridas** conforme o tipo de evento (férias/crédito)
5. **Ano seletor** para visualizar diferentes anos

---

## Observação sobre dados

Atualmente, a tabela `vacation_requests` não possui campos para:
- `saldo_inicio` (saldo de férias inicial)
- `team_leader` (gestor responsável)
- `vencimento` (data de vencimento das férias)

**Opções:**
1. Usar dados mockados inicialmente para demonstrar o layout
2. Criar novos campos na tabela posteriormente

O plano inicial será implementar a visualização completa usando os dados existentes (`employee_name`, `start_date`, `end_date`, `days_count`, `department`) e exibir "-" ou valores calculados para os campos ainda não disponíveis.

