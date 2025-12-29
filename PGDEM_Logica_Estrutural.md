
# PGDEM - Plataforma de Gestão do Desporto Escolar de Malanje
## Documento de Arquitetura e Lógica de Negócio

Como **Arquiteto de Software**, **Analista de Sistemas Educacionais** e **Especialista em Desporto Escolar**, apresento a estrutura lógica detalhada para a implementação da **PGDEM**.

---

### 1. Arquitetura Funcional (Visão Sistémica)

A plataforma será estruturada como uma **Aplicação Web Modular (SPA)** com sincronização em tempo real. A lógica divide-se em três grandes motores:

1.  **Motor de Gestão Organizacional:** Gere a hierarquia Direção Provincial > Municípios > Escolas > Equipas.
2.  **Motor de Competições e Rankings:** Automatiza a geração de calendários e o cálculo dinâmico de classificações.
3.  **Motor de Inteligência e Apoio (PGDEM Bot):** Processamento de linguagem natural para suporte regulamentar e operacional.

---

### 2. Estrutura de Perfis e Hierarquia de Acesso

#### **Nível 1: Super Admin (Provincial)**
*   **Controlo Total:** É o "Owner" da lógica do sistema. Define o que é uma modalidade ativa e quais os escalões (Ex: Sub-14, Sub-16).
*   **Validação Soberana:** Nenhum resultado entra no ranking sem a validação do Super Admin (mecanismo anti-fraude).
*   **Gestão de Identidade:** Define as cores (Rosa Escuro #9D174D e Azul #1E3A8A) e garante a integridade visual.

#### **Nível 2: Coordenador Municipal**
*   **Gestão Territorial:** Supervisiona as escolas do seu município específico.
*   **Operacionalização:** Inscreve escolas e valida o cadastro de professores.
*   **Monitorização:** Acompanha o progresso local e gera relatórios para a Direção Provincial.

#### **Nível 3: Utilizador Comum (Escola/Professor)**
*   **Execução:** Cadastro detalhado de atletas (nome, data de nascimento, BI, fotografia).
*   **Consulta:** Acesso direto ao calendário de jogos da escola e posição nos rankings.

---

### 3. Fluxo de Dados e Processos Críticos

#### **Fluxo de Gestão de Resultados e Rankings:**
1.  **Criação do Jogo:** O Super Admin gera o calendário oficial (Data, Local, Modalidade, Equipas).
2.  **Reporte de Resultado:** Após o jogo, o Coordenador Municipal insere o resultado provisório.
3.  **Auditoria e Validação:** O Super Admin verifica a conformidade (se houve protestos ou irregularidades) e clica em "Validar".
4.  **Atualização em Tempo Real:** O sistema dispara um gatilho (Trigger) que recalcula o **Ranking de Escola por Modalidade**, o **Ranking Municipal** e o **Ranking Provincial** simultaneamente.

#### **Fluxo de Cadastro de Atleta:**
1.  O Professor insere os dados.
2.  O sistema valida automaticamente a idade do atleta face ao Escalão Etário definido pelo Super Admin.
3.  O Coordenador Municipal aprova a inscrição.
4.  O atleta fica disponível para a ficha de jogo.

---

### 4. Sugestão de Base de Dados (Entidades Principais)

Para garantir escalabilidade, a base de dados deve seguir este modelo relacional:

*   **Municipality:** `id, name, coordinator_id`
*   **School:** `id, name, municipality_id, address, contact`
*   **User:** `id, name, email, role, municipality_id (null for SuperAdmin), school_id (null for Coords)`
*   **Modality:** `id, name (Futebol, Xadrez, etc.), rules_pdf_url, is_active`
*   **AgeGroup:** `id, name (Sub-12, etc.), min_age, max_age`
*   **Athlete:** `id, name, birth_date, bi_number, school_id, photo_url`
*   **Team:** `id, school_id, modality_id, age_group_id`
*   **Match:** `id, home_team_id, away_team_id, date, location, score_home, score_away, status (Pending/Validated)`
*   **Ranking:** `id, entity_id (School), point_total, wins, losses, modality_id, season_year`

---

### 5. Chatbot Institucional (PGDEM Bot)

O Chatbot será treinado com o **Gemini API** utilizando uma base de conhecimento (System Instruction) composta por:
*   Regulamento Geral do Desporto Escolar de Angola.
*   Calendários vigentes na província de Malanje.
*   Tabelas de escalões etários.

**Identidade do Bot:** Formal, solícito, utilizando termos técnicos desportivos e tratamento institucional.

---

### 6. Boas Práticas e Implementação com IA

Para um desenvolvimento de alta performance, sugerimos o seguinte Stack e Abordagem:

*   **Interface (UI):** Utilização de Tailwind CSS para aplicar rigorosamente o Rosa Escuro e o Azul institucional, garantindo que os cartões de estatísticas tenham alto contraste (texto branco/creme).
*   **Backend & Real-time:** **Firebase (Firestore)** ou **Supabase** para garantir que, quando o Super Admin validar um jogo, a tabela de classificação "vibre" e atualize no ecrã de todos os utilizadores sem necessidade de "refresh".
*   **Gerador de Relatórios:** Integração com bibliotecas de PDF para exportar súmulas de jogos e rankings oficiais com o timbre da Direção Provincial.
*   **Google AI Studio (Gemini):** Utilizar para o PGDEM Bot, permitindo que coordenadores perguntem: *"Qual é o prazo de inscrição para o basquetebol Sub-16?"* e recebam resposta imediata baseada no regulamento carregado.
*   **Canva IA:** Para geração de banners institucionais e identidades visuais de cada modalidade seguindo o padrão Rosa/Azul.

---

### 7. Identidade Visual (Especificações de Design)

*   **Cores Primárias:**
    *   Rosa Escuro (Institucional): `#9D174D` (Fundo de Sidebars e Cabeçalhos)
    *   Azul (Secundário/Ação): `#1E3A8A` (Botões de ação e Footers)
*   **Tipografia:** Sans-serif moderna (Inter ou Roboto) para máxima legibilidade em dispositivos móveis (professores no campo).
*   **Acessibilidade:** Contrastes calculados para leitura sob luz solar (comum em campos de jogos).

---
**Próximo Passo:** Com esta lógica validada, procederemos à codificação dos componentes React, integração com a API Gemini e configuração das rotas protegidas por perfil de utilizador.
