
# PGDEM - Lógica do Sistema de Ranking Automático

Este documento define as regras de negócio e o fluxo de dados para a classificação automática das escolas da província de Malanje.

## 1. Algoritmo de Classificação (Scoring Engine)

O sistema utiliza um cálculo ponderado para gerar os rankings:

### A. Modalidades Colectivas (Futebol, Basquetebol, Andebol, Voleibol)
| Resultado | Pontuação | Observação |
| :--- | :--- | :--- |
| **Vitória** | 3 Pontos | Aplicado após validação final. |
| **Empate** | 1 Ponto | Aplicado a ambas as equipas. |
| **Derrota** | 0 Pontos | - |
| **Falta de Comparência (FC)** | -2 Pontos | Penalização disciplinar automática. |

### B. Modalidades Individuais / Provas (Atletismo, Xadrez, Ginástica)
A classificação baseia-se no sistema de medalhas:
*   **Ouro:** 7 pontos
*   **Prata:** 3 pontos
*   **Bronze:** 1 ponto

## 2. Hierarquia de Agregação

O sistema executa três cálculos em cascata sempre que um resultado é validado:

1.  **Ranking de Escalão:** Pontuação acumulada dentro de uma modalidade e género específica (Ex: Basquetebol Sub-16 Masculino).
2.  **Ranking de Escola (Geral):** Soma de todos os pontos de todas as modalidades da escola. Determina a "Escola do Ano".
3.  **Ranking Municipal:** Média de desempenho das escolas de cada município. Permite à Direção Provincial avaliar o investimento desportivo local.

## 3. Fluxo de Validação e Integridade

1.  **Registo do Jogo:** O sistema gera o evento no calendário.
2.  **Input Provisório:** O Coordenador Municipal insere o score final. (Status: `PENDING`).
3.  **Auditoria:** O Super Admin verifica a súmula do jogo.
4.  **Validação:** Ao clicar em "Validar", o sistema dispara um `Trigger` de base de dados.
5.  **Recálculo:** O ranking é actualizado em < 500ms para todos os utilizadores.

## 4. Critérios de Desempate (Ordem de Prioridade)

1.  Número de Vitórias.
2.  Diferença entre golos/pontos marcados e sofridos.
3.  Maior número de atletas femininas inscritas (Critério de Promoção de Género).
4.  Confronto direto.

---
**PGDEM - Direção Provincial da Educação de Malanje**
