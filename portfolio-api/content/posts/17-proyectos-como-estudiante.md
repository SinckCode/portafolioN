---
title: "Lo que aprendí construyendo 17 proyectos como estudiante"
slug: 17-proyectos-como-estudiante
category: reflexion
tags: ["Carrera", "Aprendizaje", "Full Stack", "Estudiantes", "Portafolio"]
status: published
publishedAt: 2026-06-02
contentFormat: markdown
excerpt: "Ninguna clase me enseñó tanto como terminar proyectos reales. Estas son las lecciones concretas que me dejaron 17 proyectos, incluidos los que salieron mal."
metaTitle: "17 proyectos como estudiante: lo que aprendí construyendo"
metaDescription: "Lecciones reales de construir 17 proyectos entre prepa y universidad: webs, APIs, apps de escritorio e IoT con ESP32. Qué funcionó, qué no, y cómo elegir tecnología."
metaKeywords: ["proyectos para portafolio", "aprender programación", "estudiante de software", "portafolio desarrollador", "proyectos personales programación", "primer trabajo desarrollador"]
---

Entre el CBTIS y la universidad he construido 17 proyectos completos: webs, APIs, apps de escritorio, sistemas IoT con ESP32 y hasta un clon de Amazon. Algunos nacieron por tarea, otros por pura curiosidad. Esto es lo que ese recorrido me enseñó y que ningún curso me dio.

## Terminar vale más que empezar

El 80% del aprendizaje está en el último 20% del proyecto.

Los primeros días son cómodos: elegir el stack, montar el repo, ver la pantalla inicial funcionando. Ahí no se aprende casi nada, porque todo eso está en cualquier tutorial. Lo que enseña viene después: el deploy que falla por una variable de entorno, el usuario que mete un apóstrofo en un campo y rompe la consulta, el bug que solo aparece en producción, la migración que hay que correr sin perder datos.

Un proyecto terminado y en línea vale más que cinco repos abandonados al 60%. Y para un portafolio la diferencia es aún mayor: un enlace que alguien puede abrir dice infinitamente más que un README prometiendo lo que hará.

**Si estás a la mitad de tres proyectos, cierra uno.** Aunque le recortes funciones. Un proyecto pequeño y terminado enseña más que uno ambicioso y abandonado.

## La tecnología se elige por el problema

He usado React, SwiftUI, Electron, FastAPI, Vapor, Express, NestJS, Next.js. La lección es que ninguna es "la buena".

- El control de acceso con ESP32 pedía MySQL y C# porque tenía que integrarse con lo que ya existía en el sitio.
- La librería digital pedía FastAPI y SQLite porque era un servicio pequeño que debía arrancar en segundos.
- El portafolio pedía Next.js porque necesitaba SEO y renderizado en servidor.

Elegir bien no es saber muchas tecnologías, es saber **qué restricción manda** en cada proyecto: ¿latencia, SEO, el equipo que lo va a mantener, la plataforma de destino, lo que ya existe? Esa pregunta se responde distinto cada vez.

El efecto secundario bueno: cuando has cambiado de stack varias veces dejas de identificarte con una herramienta. Aprender la siguiente cuesta cada vez menos, porque los conceptos —estado, rutas, autenticación, consultas— se repiten con nombres distintos.

## Documenta para tu yo del futuro

Volver a un proyecto seis meses después sin README es arqueología.

Ahora cada repo lleva instrucciones de instalación, un `.env.example` con todas las variables, y capturas de cómo se ve funcionando. Me toma veinte minutos al cerrar el proyecto y me ha ahorrado tardes enteras.

Lo mínimo que sirve:

```markdown
## Cómo correrlo
1. `npm install`
2. Copia `.env.example` a `.env` y llena las variables
3. `npm run dev` → http://localhost:3000

## Decisiones
- Por qué X en vez de Y
- Qué falta / qué está roto a propósito
```

Esa sección de "decisiones" es la más valiosa. El código dice *qué* hace; nunca dice *por qué* elegiste eso en lugar de la alternativa obvia.

## El hardware te hace mejor developer de software

Conectar sensores físicos a una API te obliga a pensar en fallos que en la web ignoras.

¿Qué pasa si el sensor manda basura? ¿Si se corta el WiFi a medio envío? ¿Si llegan cien lecturas por segundo? ¿Si el dispositivo se reinicia y pierde lo que no alcanzó a mandar?

En una app web normal el navegador te protege de casi todo eso. Con un ESP32 no hay red de seguridad: si no manejas el caso, el dispositivo se cuelga y hay que ir físicamente a reiniciarlo.

Programar con esas restricciones cambia cómo diseñas todo lo demás. Después de eso, validar entradas y manejar reconexiones en una app web te sale por reflejo.

## Lo que haría distinto

**Empezaría a usar Git bien desde el primer proyecto.** Mis primeros repos tienen commits llamados "cambios" y "cambios2". Ahora escribo mensajes que explican el porqué, y cuando busco cuándo se introdujo un bug, el historial me responde.

**Desplegaría desde el día uno, no al final.** Dejar el deploy para el último día garantiza que el último día sea horrible. Si despliegas una versión vacía desde el inicio, cada cambio llega a producción en pequeño y los problemas aparecen de uno en uno.

**Escribiría pruebas para lo que da miedo.** No para todo — para lo que te pone nervioso tocar. Normalmente es autenticación, pagos o cualquier cosa que borre datos.

**Pediría revisión antes.** Enseñé proyectos hasta que estaban "listos". La retroalimentación llegaba cuando ya era caro cambiar. Mostrarlo feo y a medias duele menos y ahorra más.

## Si estás estudiando ahora

La duda más común es entre "aprender más teoría" o "construir algo". Construye. La teoría se te queda cuando la usas para resolver un problema tuyo; leída en abstracto se evapora en una semana.

Y elige proyectos que te resuelvan algo real, aunque sea pequeño. La motivación para terminar el 20% difícil no sale del entusiasmo inicial — sale de que de verdad quieras usar la cosa cuando esté lista.
