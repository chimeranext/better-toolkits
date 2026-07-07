# Learning Locker xAPI Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.

## Source

`learning-locker-api`

## Endpoints

```
GET {ll_base_url}/data/xAPI/statements
  ?activity={au-id}
  &agent={"mbox":"mailto:learner@example.com"}
  &limit=100
```

Auth: HTTP Basic Auth con Learning Locker username/password, o JWT bearer token.

## Mapping a XapiRecord

xAPI estándar (idéntico a Ralph + SCORM Cloud).

## Particularidades de Learning Locker

- Soporta query language extra (`/data/xAPI/statements/aggregate`) para métricas precomputadas.
- Multi-tenant: usar el `lrs_id` correcto en el path.
- Community edition gratuita; Enterprise tiene features extra (RBAC granular, etc.).

## Referencias

- Learning Locker docs: <https://docs.learninglocker.net/>
- xAPI Statement API: <https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md>
