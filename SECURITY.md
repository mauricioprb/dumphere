# Security Policy

## Supported versions

Only `main` is supported. There are no maintained release branches.

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/mauricioprb/dumphere/security/advisories/new).
Do not open a public issue for a vulnerability.

Include what you did, what happened, and what you expected. A proof of concept
against a local instance helps. Expect a first reply within seven days.

## Scope

Every page is public by design. Anyone who knows or guesses an address can read
and edit it, and a report saying so will be closed. Reserved prefixes, visitor
passwords and owner passwords are the only access controls, and reports about
bypassing those are in scope.

Also in scope: stored XSS through document content, WebSocket token forgery or
replay, cross-document data leaks, and injection anywhere in the stack.

Out of scope: missing rate limits on a local instance, anything requiring a
compromised server, and findings that only reproduce with `APP_DEBUG=true`.
