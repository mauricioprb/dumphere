# Dicionário de dados

Banco `dumphere` do TablesDB (igual em todos os ambientes). Nenhuma tabela tem permissão pública: só as Functions e o `yjs-server` leem e gravam, com chave de API.

## documents

Uma linha por página. A página nasce no primeiro acesso ao endereço e some depois de 30 dias sem visita, a não ser que a raiz do endereço esteja reservada.

| Coluna | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| `$id` | texto (até 36) | sim | Identificador gerado pelo Appwrite. Nome da sala no Yjs (`document-<id>`). Não muda. |
| `slug` | texto (até 200) | sim | Endereço público, em minúsculas, até 4 segmentos. Único. |
| `title` | texto (até 255) | não | Título derivado do último segmento. |
| `contentHtml` | texto médio | não | HTML sanitizado, cópia legível do documento. Até 512 KB. |
| `yjsState` | texto médio | não | Estado do Yjs em base64, gravado pelo `yjs-server`. Até 2 MB antes do base64. |
| `lastAccessedAt` | data e hora (UTC) | sim | Último acesso ou salvamento. Base da limpeza de 30 dias. |
| `reservedUntil` | data e hora (UTC) | não | Preenchido só na raiz de um endereço reservado. |
| `ownerPasswordHash` | texto (até 255) | não | Bcrypt da senha do dono (só na raiz reservada). |
| `ownerRecoveryKeyHash` | texto (até 64) | não | SHA-256 da chave de recuperação. |
| `ownerSessionId` | texto (até 64) | não | Sessão atual do dono. Trocar invalida o `ownerToken` anterior. |
| `visitorPasswordHash` | texto (até 255) | não | Bcrypt da senha de visita. |
| `readonly` | booleano | não | Visitantes só leem. |
| `themeHue`, `themeHueDark` | inteiro (0 a 359) | não | Matiz fixo do endereço no tema claro e no escuro. |
| `themeChroma`, `themeChromaDark` | inteiro (0 a 100) | não | Saturação do tema. |

Índices:

- `slug_unique` (`slug`, único): busca por endereço e impede duas páginas no mesmo endereço.
- `last_accessed_at` (`lastAccessedAt`): limpeza diária.
- `reserved_until` (`reservedUntil`): lista de endereços reservados.

## attempts

Registro de tentativas para limitar abuso por IP. Apagado depois de um dia.

| Coluna | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| `key` | texto (até 64) | sim | SHA-256 de `ação:ip`. O IP nunca é gravado em claro. |
| `$createdAt` | data e hora (UTC) | sim | Momento da tentativa. |

Limites: criar página sem dono (10 por hora), desbloquear com senha de visita (10 por minuto), entrar nas configurações com senha (10 por minuto), recuperar a senha do dono (5 por minuto).
