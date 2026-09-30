# IoT real: del sensor ESP32 al dashboard en internet

> Estado: esqueleto. Falta guion detallado por lección.

## Metadatos

```yaml
title: "IoT real: del sensor ESP32 al dashboard en internet"
slug: iot-del-sensor-al-dashboard
description: "Construye la cadena completa: un ESP32 que mide, una API que recibe y guarda, y un dashboard que lo muestra en tiempo real. Con el hardware barato que se consigue en México."
category: iot-curso
level: beginner
duration: "4h 15m"
price: 0
status: draft
tags: ["IoT", "ESP32", "Arduino", "Node.js", "MongoDB", "React", "Sensores"]
```

### requirements

- Un ESP32 y un sensor (DHT22 o BME280). Menos de $300 MXN en total
- Programación básica: variables, condicionales, funciones
- No hace falta saber electrónica: se ve en el curso

### whatYouLearn

- Programarás un ESP32 para leer sensores y mandar datos por WiFi
- Escribirás la API que los recibe, valida y almacena
- Construirás un dashboard con gráficas históricas
- Manejarás el caso real de un dispositivo que pierde la conexión
- Publicarás todo con dominio propio para consultarlo desde el teléfono

---

## Por qué este curso

Los tutoriales de IoT terminan cuando el sensor imprime un número en el monitor
serie. Ahí es donde empieza lo difícil: qué pasa cuando se cae el WiFi, cómo
guardas millones de lecturas sin que la base se vuelva inusable, y cómo lo ves
desde el celular estando fuera de casa.

Este curso recorre la cadena completa, con dos proyectos reales de fondo: un
monitor ambiental de aula y un control de acceso con RFID.

---

## Estructura

### Módulo 1 — Hardware sin miedo (45m)

| # | Lección | Tipo | Min | Gratis |
|---|---|---|---|:---:|
| 1 | Qué es un ESP32 y por qué este y no un Arduino | video | 9 | ✅ |
| 2 | Qué comprar y dónde, con precios reales | video | 8 | ✅ |
| 3 | Entorno de desarrollo y primer parpadeo | video | 10 | ✅ |
| 4 | Conectar el sensor: alimentación, tierra, datos | video | 12 | |
| 5 | Leer y mostrar en el monitor serie | video | 6 | |

### Módulo 2 — El ESP32 en la red (50m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Conectarse al WiFi | video | 9 |
| 2 | Tu primer POST desde el microcontrolador | video | 11 |
| 3 | **Cuando el WiFi se cae: reconexión y reintentos** | video | 12 |
| 4 | No mandar una lectura por segundo: intervalos y promedios | video | 10 |
| 5 | Quiz | quiz | 4 |

> **La 2.3 separa un proyecto de escuela de uno que aguanta.** Un dispositivo que
> se cuelga al perder WiFi y necesita que alguien lo desconecte no sirve para nada.

### Módulo 3 — La API que recibe (55m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Diseñar el endpoint de ingesta | video | 10 |
| 2 | Validar: nunca confíes en lo que manda un dispositivo | video | 11 |
| 3 | Modelar lecturas en MongoDB | video | 12 |
| 4 | Índices: la diferencia entre 10 ms y 8 segundos | video | 11 |
| 5 | Endpoints de consulta y agregación por hora | video | 9 |
| 6 | Quiz | quiz | 4 |

> La 3.4 tiene un antes y un después visible en pantalla: la misma consulta sobre
> la misma colección, con y sin índice. Es el tipo de demostración que se recuerda.

### Módulo 4 — El dashboard (50m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Estructura del frontend | video | 9 |
| 2 | Consumir la API y manejar estados de carga y error | video | 11 |
| 3 | Gráficas de series temporales | video | 12 |
| 4 | Actualización en vivo | video | 10 |
| 5 | Que se vea bien en el teléfono | video | 8 |

### Módulo 5 — Que funcione de verdad (45m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | Desplegar la API con dominio propio | video | 11 |
| 2 | **`/health` que mira la base, no que dice "ok"** | video | 10 |
| 3 | El dispositivo dejó de reportar: cómo enterarte | video | 10 |
| 4 | Datos viejos: retención y agregados | video | 10 |
| 5 | Quiz final | quiz | 4 |

> **La 5.2 sale de un caso real.** Dos servicios míos estuvieron semanas
> reiniciándose cada 30 segundos porque no podían conectar a la base, y su
> endpoint de salud devolvía `{ok: true}` sin comprobar nada. Un health que no
> mira sus dependencias es peor que no tener ninguno: da confianza falsa.

### Módulo 6 — Segundo proyecto: control de acceso (30m)

| # | Lección | Tipo | Min |
|---|---|---|---|
| 1 | RFID: leer una tarjeta | video | 10 |
| 2 | Del lector a la decisión de abrir o no | video | 11 |
| 3 | Qué cambia cuando el dispositivo *actúa* y no solo mide | video | 9 |

---

## Notas de producción

- **Grabar el hardware de verdad.** Manos, cables, protoboard. Es lo que distingue
  este curso de uno hecho con simulador, y lo que da confianza al principiante.
- Tener un segundo ESP32 ya configurado fuera de cámara para no perder tomas si el
  primero falla.
- La lección 2.3 necesita cortar el WiFi en vivo. Preparar un punto de acceso
  dedicado que se pueda apagar.
- Publicar los esquemas de conexión como imágenes descargables.
