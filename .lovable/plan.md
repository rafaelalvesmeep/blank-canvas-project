

## Resumo
Remover o botão "Cadastrar Colaborador" da interface (pois os colaboradores serão inseridos via API) e inserir os 27 colaboradores do setor Desenvolvimento no banco de dados.

---

## Alterações na Interface

**Arquivo:** `src/pages/gestores/ControleFerias.tsx`

**Remover o botão "Cadastrar Colaborador":**
- Remover o botão das linhas 316-319 (seção de Action Buttons)
- Remover o botão das linhas 444-447 (estado vazio da tabela)
- Manter apenas os botões "Cadastrar Férias" e "Cadastrar Crédito"
- Remover o import do `RegisterEmployeeDialog` e o estado `showEmployeeDialog` se não for mais usado
- Remover o ícone `UserPlus` dos imports se não for mais utilizado

**Ajustar estado vazio:**
- Quando não houver colaboradores, exibir apenas mensagem informativa sem o botão de cadastrar

---

## Inserção dos Colaboradores

**Tabela:** `employees`

Inserir 27 registros com os seguintes dados:

| Nome | department | vacation_balance |
|------|------------|------------------|
| ALEXSANDRO ALVES CRISPIM | Desenvolvimento | 30 |
| DANIEL LUCAS PEREIRA E SILVA | Desenvolvimento | 30 |
| DEIVID AUGUSTO CASTILHO | Desenvolvimento | 30 |
| DOUGLAS LELLIS MOREIRA | Desenvolvimento | 30 |
| FERNANDO D'ANGELO MACHADO | Desenvolvimento | 30 |
| FLAVIA PRATES | Desenvolvimento | 30 |
| GUILHERME GOMES | Desenvolvimento | 30 |
| ISAAC HOUSTON PEREIRA | Desenvolvimento | 30 |
| ISAAC NASCIMENTO | Desenvolvimento | 30 |
| ISABELA MONIQUE ALCANTARA | Desenvolvimento | 30 |
| JOAO PAULO LISBOA DOS SANTOS | Desenvolvimento | 30 |
| JOSEMAR DE LUNA SANTOS SOUSA | Desenvolvimento | 30 |
| LUCAS GUILHERME CAETANO | Desenvolvimento | 30 |
| LUIS GUSTAVO DE SOUZA | Desenvolvimento | 30 |
| MARCOS PEREIRA BENEVIDES | Desenvolvimento | 30 |
| MATHEUS MIRANDA | Desenvolvimento | 30 |
| OSCAR OLIVEIRA DIAS | Desenvolvimento | 30 |
| PAULO HENRIQUE MONTE | Desenvolvimento | 30 |
| PAULO RENATO DE SOUZA | Desenvolvimento | 30 |
| PITER SILVA | Desenvolvimento | 30 |
| RAMON RODRIGUES | Desenvolvimento | 30 |
| RAPHAEL CHRISTIAN MODESTO | Desenvolvimento | 30 |
| RAUL LOPES DE SOUZA | Desenvolvimento | 30 |
| RAYANE SANTIAGO | Desenvolvimento | 30 |
| THIAGO JOSE OLIVEIRA E SILVA | Desenvolvimento | 30 |
| THIAGO NASCIMENTO PEREIRA | Desenvolvimento | 30 |
| UIRA ASSUNÇÃO ALVES PEREIRA | Desenvolvimento | 30 |

Para cada colaborador será gerado:
- `employee_id`: baseado no nome normalizado (ex: `alexsandro.alves.crispim`)
- `email`: `{employee_id}@meep.com.br`

---

## Detalhes Técnicos

**Limpeza de código:**
```text
- Remover: import { RegisterEmployeeDialog }
- Remover: const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
- Remover: import UserPlus (se não usado em outro lugar)
- Remover: <RegisterEmployeeDialog ... /> do JSX
```

**Estrutura final dos botões de ação:**
```text
<div className="flex gap-2 flex-wrap">
  <Button size="sm" variant="outline" onClick={() => setShowVacationDialog(true)} disabled={employees.length === 0}>
    <Plus className="h-4 w-4 mr-1.5" />
    Cadastrar Férias
  </Button>
  <Button size="sm" variant="outline" onClick={() => setShowCreditDialog(true)} disabled={employees.length === 0}>
    <CreditCard className="h-4 w-4 mr-1.5" />
    Cadastrar Crédito
  </Button>
</div>
```

