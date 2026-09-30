# Plantilla de curso

Copia este archivo, renómbralo con el slug del curso y llénalo. Los campos
corresponden al schema real de `Course` de la API, así que lo que escribas aquí se
puede cargar sin traducir nada.

---

## Metadatos

```yaml
title: ""                    # Cómo se ve en el catálogo
slug: ""                     # kebab-case, único, no se cambia después de publicar
description: ""              # 2-3 frases. Qué construye el alumno y para quién es
category: ""                 # desarrollo-web-curso | devops-curso | iot-curso
level: ""                    # beginner | intermediate | advanced
duration: ""                 # "4h 30m" — la suma real de las lecciones
price: 0                     # 0 = gratis
status: draft                # draft | published | archived
tags: []
coverImage: ""
```

### `requirements`

Lo que el alumno necesita **antes** de empezar. Sé concreto: no "saber
programar", sino "haber escrito un `for` en JavaScript". Si un requisito se puede
cubrir en 5 minutos, mejor conviértelo en una lección.

```yaml
requirements:
  - ""
  - ""
```

### `whatYouLearn`

De 4 a 6 puntos, cada uno una **capacidad verificable**. La prueba: si el alumno
puede decir "sí, eso ya lo puedo hacer", está bien escrito.

Mal: "Aprenderás sobre Docker."
Bien: "Publicarás tu propia app con HTTPS y dominio propio, sin abrir puertos."

```yaml
whatYouLearn:
  - ""
  - ""
```

---

## Estructura

Módulos con lecciones. Cada lección lleva `type` (`video`, `text` o `quiz`),
`duration` en minutos, y `isFree` para las que sirven de muestra.

**Regla del módulo 1:** las primeras lecciones van marcadas `isFree: true`. Es la
vista previa del curso y es lo que decide si alguien paga.

**Regla de duración:** ninguna lección de video por encima de 12 minutos. Si se
pasa, es que contiene dos ideas y hay que partirla.

```yaml
modules:
  - title: "Módulo 1 — "
    order: 1
    lessons:
      - title: ""
        slug: ""
        type: video
        duration: 8
        isFree: true
        order: 1
        content: ""        # para type: text, el markdown completo
        videoUrl: ""
```

---

## Guion

Una sección por lección. Este archivo es lo que se lee al grabar, así que lo que
esté aquí tiene que poder decirse en voz alta.

### Lección X — Título

**Objetivo:** lo que el alumno sabe hacer al terminar, en una frase.

**Gancho (0:00–0:20).** El problema concreto, no la teoría. "Tu app funciona en
local y no sabes cómo ponerla en internet sin exponer tu casa."

**Desarrollo.** Pasos numerados. En los de código, el bloque exacto que aparece en
pantalla — no lo improvises al grabar.

```
comando o código literal
```

**El error que van a cometer.** La parte más valiosa de cualquier lección. Si sabes
dónde se tropieza la gente, muéstralo *pasando*, no lo adviertas de palabra.

**Cierre (últimos 20s).** Lo que acaba de quedar funcionando, y la frase puente a
la lección siguiente.

**Qué hay en pantalla.** Terminal, editor, navegador, diagrama. Escríbelo ahora y
te ahorras decidirlo con la cámara encendida.

---

## Antes de grabar

- [ ] Recorrer el curso completo desde una máquina limpia, siguiendo solo el guion
- [ ] Repositorio con una rama o tag por módulo, para que se pueda entrar a mitad
- [ ] Decidir las 2-3 lecciones gratuitas
- [ ] Sumar las duraciones reales y corregir `duration`
- [ ] Revisar que no aparezcan credenciales, IPs internas ni rutas personales en
      pantalla — ni en el prompt de la terminal
