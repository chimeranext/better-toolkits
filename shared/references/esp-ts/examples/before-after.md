# Antes / después — ejemplos nucleares

Modo: Strict salvo indicación.

## Rotación de sinónimos + _se_ impersonal

**Antes**

> Se procederá a la realización de una verificación del estado del servicio, pudiendo eventualmente reiniciarse en caso de detectarse alguna anomalía.

**Después**

> El operador verifica el estado del servicio. Si detecta una anomalía, puede reiniciar el servicio.

| Regla               | Qué corrige                                         |
| ------------------- | --------------------------------------------------- |
| ESTE-009            | `Se procederá`                                      |
| ESTE-004            | `realización de una verificación`                   |
| ESTE-016 / ESTE-005 | `eventualmente` / se conserva el matiz como `puede` |
| ESTE-003 / ESTE-024 | una idea + condición clara                          |

## Gerundio de consecuencia + falso amigo

**Antes**

> El sistema soporta la actualización del perfil del usuario actual generando un error si los datos no son válidos.

**Después**

> El sistema actualiza el perfil de este usuario. Si los datos no son válidos, el sistema muestra un error.

| Regla    | Qué corrige          |
| -------- | -------------------- |
| ESTE-016 | `soporta`, `actual`  |
| ESTE-010 | `generando`          |
| ESTE-003 | separar la condición |

## Apilado de rodeos

**Antes**

> Es importante señalar que esta opción podría eventualmente ayudar a mejorar el rendimiento en algunos casos.

**Después**

> Esta opción puede mejorar el rendimiento en algunos casos.

Se mantiene: "puede" / "en algunos casos" — incertidumbre del original.

## Nominalización

**Antes**

> Realiza la configuración de la autenticación antes de la ejecución del despliegue.

**Después**

> Configura la autenticación. Después despliega.

## Cambio de trato (UI)

**Antes**

> Pulse Guardar y luego revisa el resumen. Seguidamente se debe confirmar la operación.

**Después**

> Pulsa Guardar. Revisa el resumen. Confirma la operación.

(O todo en `usted`: `Pulse` / `Revise` / `Confirme`.)
