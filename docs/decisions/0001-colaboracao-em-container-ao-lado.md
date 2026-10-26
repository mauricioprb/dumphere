---
status: aceito
date: 2026-10-25
---

# Servidor Yjs num container ao lado do Appwrite

## Contexto e problema

A edição ao vivo usa Yjs, que precisa de um WebSocket longo com o documento em memória. O Appwrite não hospeda servidor próprio: as Functions respondem e encerram, e o Realtime só repassa eventos de banco, storage, contas e presença, sem canal livre para mensagens.

## Opções consideradas

- Container `yjs-server` no mesmo servidor, atrás do Traefik do Appwrite, gravando no TablesDB pela API.
- Só Appwrite: cada alteração vira uma linha numa tabela, os navegadores recebem pelo Realtime e a presença usa a API Presences.
- Sem tempo real: uma pessoa edita por vez.

## Decisão

Opção escolhida: container ao lado, porque mantém a coedição, os cursores e a presença sem reescrever o protocolo. A opção "só Appwrite" exigiria um provider Yjs próprio, uma execução de Function por alteração e perderia os cursores.

O container não aparece no console do Appwrite. As Functions avisam o container sobre mudança de regra ou exclusão por `POST /notify`, com o mesmo `YJS_WS_SECRET`, no lugar do `LISTEN/NOTIFY` do PostgreSQL.

Quando revisar: quando o Appwrite oferecer canal Realtime de mensagens livres ou hospedagem de processo longo.

### Consequências

- Bom: comportamento igual ao da versão Laravel; o estado do Yjs fica no TablesDB, com backup junto do resto.
- Ruim: um processo fora do console, publicado à mão no servidor (ver `docs/deploy.md`); precisa de uma chave de API do projeto com `rows.read` e `rows.write`.
