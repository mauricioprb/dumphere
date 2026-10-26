---
status: aceito
date: 2026-10-25
---

# Functions públicas e dono identificado por token

## Contexto e problema

O Dumphere não tem conta nem login: qualquer pessoa com o endereço lê e edita. O padrão da fábrica (ARQ-04) identifica o usuário pelo cabeçalho `x-appwrite-user-id`, que aqui nunca existe. A versão Laravel reconhecia o dono de um endereço reservado por um cookie derivado da senha, e uma Function chamada pelo SDK não grava cookie no domínio do site.

## Opções consideradas

- Function `documents` com `execute: ["any"]` e autorização por segredos do próprio endereço.
- Sessões anônimas do Appwrite para cada visitante.

## Decisão

Opção escolhida: `execute: ["any"]`. A autorização continua toda na Function (ARQ-01 e ARQ-05):

- dono: `ownerToken`, o mesmo valor que o cookie tinha (hash da senha do dono com a sessão atual), guardado no `localStorage` por endereço. Trocar a senha ou entrar em outro navegador invalida o token anterior;
- endereço com senha de visita: o `wsToken` assinado, ligado ao documento e às regras do endereço;
- limites por IP (`x-appwrite-client-ip`, guardado só como hash) na tabela `attempts`: criação de página, desbloqueio, configurações e recuperação.

A Function `admin` (reservar endereço e limpeza diária) tem `execute: []` e só roda pelo console ou pelo agendamento.

Quando revisar: se o produto ganhar contas.

### Consequências

- Bom: sem sessões anônimas acumulando no projeto; as regras do Laravel foram portadas uma a uma.
- Ruim: o token do dono não expira sozinho (o cookie durava sete dias); ele cai ao trocar a senha ou ao entrar em outro navegador.
