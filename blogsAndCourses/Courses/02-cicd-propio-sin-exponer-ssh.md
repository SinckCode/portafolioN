# CI/CD propio: despliega a tu servidor sin entregar tus llaves

> Estado: esqueleto. Falta guion detallado por lección.

## Metadatos

```yaml
title: "CI/CD propio: despliega a tu servidor sin entregar tus llaves"
slug: cicd-propio-sin-exponer-ssh
description: "Construye tu propia API de despliegue: un POST por proyecto, pipelines declarados en JSON y GitHub Actions que despliega a tu servidor sin tener nunca una credencial SSH de tu red."
category: devops-curso
level: intermediate
duration: "3h 45m"
price: 0
status: draft
tags: ["CI/CD", "GitHub Actions", "Node.js", "Deploy", "Seguridad", "DevOps"]
```

### requirements

- Haber desplegado algo a un servidor, aunque haya sido copiando archivos a mano
- JavaScript y Node a nivel de escribir un servidor de Express básico
- Un servidor accesible (VPS o homelab) con acceso SSH

### whatYouLearn

- Escribirás una API de despliegue que ejecuta el pipeline correcto según el
  proyecto que se le pida
- Declararás pipelines como datos, de modo que agregar un proyecto no toque código
- Conectarás GitHub Actions a tu servidor sin darle ninguna llave SSH
- Diagnosticarás un despliegue fallido sabiendo exactamente qué paso se rompió
- Aplicarás autenticación que falla cerrada, en tiempo constante y sin filtrar el
  token a los logs

---

## Por qué este curso

La mayoría de los tutoriales de "deploy con GitHub Actions" te dicen que guardes
tu llave SSH privada en un secret del repositorio. Funciona, y significa entregarle
a una plataforma de terceros acceso de shell a tu servidor.

Este curso construye la alternativa: un intermediario que tú controlas, al que
GitHub solo puede pedirle "despliega el proyecto X" con un token revocable.

---

## Estructura

### Módulo 1 — El problema (30m)

| # | Lección | Tipo | Min | Gratis |
|---|---|---|---|:---:|
| 1 | Las tres formas de desplegar y qué entrega cada una | video | 9 | ✅ |
| 2 | Por qué una llave SSH en un secret es demasiado poder | video | 8 | ✅ |
| 3 | La idea: un intermediario que tú controlas | video | 7 | ✅ |
| 4 | Lo que vamos a construir | video | 6 | |

### Módulo 2 — La primera versión, deliberadamente ingenua (40m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Express, un endpoint, un token | video | 11 |
| 2 | Ejecutar comandos desde Node con `child_process` | video | 12 |
| 3 | Conectarlo a GitHub Actions | video | 10 |
| 4 | Funciona… y tiene cuatro problemas | video | 7 |

> **Enseñar la versión mala a propósito.** El alumno tiene que sentir los
> problemas antes de valorar las soluciones. Los cuatro: comandos hardcodeados,
> cadena de `&&` que no dice qué falló, escapado de comillas frágil, y un token por
> defecto en el código.

### Módulo 3 — Pipelines como datos (50m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Sacar los comandos del código a un JSON | video | 11 |
| 2 | Targets: local y por SSH | video | 10 |
| 3 | Interpolación de variables y por qué debe fallar fuerte | video | 9 |
| 4 | Validar el registro al arrancar | video | 12 |
| 5 | Quiz | quiz | 4 |

> Insistir en el punto de seguridad: una variable no definida que se resuelve a
> cadena vacía dentro de un `rm -rf` borra el directorio raíz. Por eso se valida
> al arrancar y se falla, en lugar de sustituir por vacío.

### Módulo 4 — Un runner que se puede depurar (55m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Pasos de uno en uno en lugar de una cadena de `&&` | video | 11 |
| 2 | **El script por stdin: adiós al escapado de comillas** | video | 12 |
| 3 | `spawn` contra `exec`, y por qué aquí importa | video | 9 |
| 4 | Timeouts por paso | video | 8 |
| 5 | Logs por despliegue en archivo, con retención | video | 11 |
| 6 | Quiz | quiz | 4 |

> **La 4.2 es la lección técnica más valiosa del curso.** Demostrar en vivo cómo
> un comando con comillas anidadas se destroza con `replace(/"/g, '\\"')` y llega
> intacto por `bash -s`. Se ve, no se explica.

### Módulo 5 — Seguridad (35m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Fallar cerrada: sin token, todo es 503 | video | 8 |
| 2 | Comparación en tiempo constante | video | 9 |
| 3 | El token nunca va a un log | video | 7 |
| 4 | Un despliegue a la vez | video | 7 |
| 5 | Quiz | quiz | 4 |

### Módulo 6 — En producción (35m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Verificación post-deploy declarada por proyecto | video | 10 |
| 2 | Publicarla con un túnel, no con un puerto abierto | video | 9 |
| 3 | **Por qué esta API no tiene CI/CD propio** | video | 8 |
| 4 | Agregar un proyecto nuevo, de principio a fin | video | 8 |

> La 6.3 es conceptual y vale el curso entero: el proceso límite no se
> autodespliega. Un commit malo lo dejaría sin forma de arreglarse a sí mismo.

---

## Notas de producción

- Repositorio base público con una rama por módulo.
- El curso tiene un artefacto final tangible: la API funcionando. Eso es lo que se
  enseña en el gancho del módulo 1.
- Referencia: `github.com/SinckCode/deploy-api` es la implementación real de este
  curso, y sirve como material de apoyo descargable.
