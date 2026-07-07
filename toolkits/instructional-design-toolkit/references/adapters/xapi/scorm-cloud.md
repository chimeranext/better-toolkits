# SCORM Cloud xAPI Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.

## Source

`scorm-cloud-api`

## Endpoints

```
GET https://cloud.scorm.com/api/v2/appManagement/courses/{courseId}/registrations
GET https://cloud.scorm.com/api/v2/appManagement/registrations/{registrationId}/instances
```

Auth: OAuth 2.0 Client Credentials con SCORM Cloud App ID + Secret Key.

## xAPI Statement API endpoint

```
GET https://cloud.scorm.com/lrs/{lrsId}/statements
  ?activity={au-id}
  &agent={"mbox":"mailto:learner@example.com"}
  &limit=100
```

## Mapping a XapiRecord

Idéntico al Ralph adapter (xAPI estándar).

## Referencias

- SCORM Cloud API docs: <https://cloud.scorm.com/docs/v2/api/>
- xAPI Statement API spec: <https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md>
- Free tier: hasta 100 registrations/mes — sirve para validation en CI/dev.
