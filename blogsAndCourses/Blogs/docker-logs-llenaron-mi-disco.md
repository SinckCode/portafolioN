---
title: "Un contenedor de Mongo se comió 10 GB de disco en logs"
slug: docker-logs-llenaron-mi-disco
category: devops
tags: ["Docker", "Logs", "logrotate", "PM2", "Mantenimiento", "Homelab"]
status: draft
publishedAt: 2026-10-08
contentFormat: markdown
excerpt: "El driver de logs por defecto de Docker no rota nada. Descubrí los 10 GB con el disco al 93%, y la forma correcta de limpiarlos no es borrar el archivo."
metaTitle: "Logs de Docker sin rotación: 10 GB de disco y cómo evitarlo"
metaDescription: "El driver json-file de Docker crece sin límite. Cómo encontrar el contenedor culpable, por qué hay que usar truncate y no rm, y la configuración de logrotate con copytruncate."
metaKeywords: ["docker logs disco lleno", "json-file log driver", "docker max-size log", "logrotate docker copytruncate", "var lib docker containers grande", "pm2 logrotate", "limpiar logs docker"]
---

Estaba revisando el estado de mis VMs y me encontré con esto:

```
/dev/sda1   30G   28G  1.4G  93% /
```

Noventa y tres por ciento. Un disco de 30 GB con 1.4 GB libres, en una máquina
que corre cinco aplicaciones y nueve contenedores. A ese nivel las cosas empiezan
a romperse de formas raras: builds que fallan a mitad, bases de datos que no
pueden escribir, logs que se truncan solos.

Lo que encontré cuando fui a buscar no era lo que esperaba.

## Encontrar al culpable

El reflejo es empezar de arriba y bajar:

```bash
sudo du -xh --max-depth=1 / | sort -rh | head -8
```

```
28G  /
16G  /var
6.2G /home
3.8G /usr
```

`/var` con 16 GB. Bajando un nivel:

```bash
sudo du -xh --max-depth=1 /var/lib | sort -rh | head -5
```

```
16G  /var/lib/docker
201M /var/lib/apt
```

Todo Docker. Pero aquí viene la parte interesante, porque lo primero que hice fue
preguntarle a Docker:

```bash
docker system df
```

```
TYPE            TOTAL  ACTIVE  SIZE      RECLAIMABLE
Images          9      9       2.829GB   0B (0%)
Containers      9      9       17.91MB   0B (0%)
Local Volumes   9      6       650.1MB   0B (0%)
Build Cache     0      0       0B        0B
```

**Docker declara 3.5 GB.** El disco dice 16 GB. Doce gigas que Docker no cuenta
como suyos.

`docker system df` no incluye los logs de los contenedores. Y ahí estaban:

```bash
sudo du -xh --max-depth=1 /var/lib/docker | sort -rh | head -3
```

```
16G  /var/lib/docker
12G  /var/lib/docker/containers
2.8G /var/lib/docker/overlay2
```

Doce gigas en `containers/`, que es donde vive el `stdout` de cada contenedor.

## El contenedor

```bash
sudo sh -c 'for f in /var/lib/docker/containers/*/*-json.log; do
  echo "$(du -m $f | cut -f1) MB $(basename $(dirname $f))"
done' | sort -rn | head -3
```

```
10179 MB  6e01167f042b...
1743 MB   58508e0c19d9...
```

Cruzando los IDs con `docker ps`: **10.2 GB era el log de mi contenedor de
MongoDB**, y 1.7 GB el de Loki — que, con cierta ironía, es el servicio que tengo
montado precisamente para agregar logs.

Mongo registra cada conexión que recibe. Con aplicaciones reconectándose en bucle
(otra historia, también mía), eso son millones de líneas.

## Por qué nadie lo limita

El driver de logs por defecto de Docker es `json-file`, y **por defecto no tiene
límite de tamaño ni rotación**. Cada línea que un contenedor escribe a `stdout`
se acumula en un único archivo que crece hasta que el disco se acaba.

No es un bug: es el default, documentado, y es el que se queda puesto en el 90% de
las instalaciones porque nadie lo cambia hasta que le pasa esto.

## Limpiarlos: truncate, nunca rm

Aquí está el detalle que importa, y el que más gente hace mal.

La tentación es `rm` el archivo. **No lo hagas con un contenedor corriendo.** El
proceso de Docker tiene ese archivo abierto: si lo borras, el nombre desaparece
del directorio pero el inodo sigue vivo mientras el descriptor esté abierto. El
espacio **no se libera**, Docker sigue escribiendo a un archivo huérfano que ya no
puedes leer, y solo recuperas el disco cuando reinicies el contenedor.

Lo correcto es vaciarlo en sitio:

```bash
sudo truncate -s 0 /var/lib/docker/containers/<id>/<id>-json.log
```

`truncate` respeta el descriptor abierto: el archivo sigue siendo el mismo, solo
mide cero. Docker no se enoja y el espacio se libera al instante.

### Un detalle de permisos que cuesta diez minutos

Mi primer intento pareció funcionar y no liberó nada. La razón:

```bash
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log   # NO funciona
```

`/var/lib/docker` tiene permisos `0710`: solo root puede listarlo. El glob lo
expande **tu shell**, no `sudo`, y tu shell no puede leer ese directorio — así que
`truncate` recibe la ruta literal con asteriscos y falla.

Hay que expandirlo ya siendo root:

```bash
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'
```

Con eso el disco pasó de **93% a 50%**. Trece gigas recuperados contando también
1.1 GB de logs de PM2 y 261 MB de journal de systemd.

## Que no vuelva a pasar

Limpiar es el parche. La solución es que roten solos.

### Para los contenedores que ya corren

Un `logrotate` con `copytruncate` — la misma lógica que arriba, automatizada:

```
# /etc/logrotate.d/docker-containers
/var/lib/docker/containers/*/*.log {
    daily
    rotate 3
    size 50M
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

`copytruncate` es la clave: copia el contenido y vacía el original, en lugar de
mover el archivo. Mover no serviría, por el mismo problema del descriptor abierto.

Valídalo sin aplicar nada:

```bash
sudo logrotate -d /etc/logrotate.d/docker-containers
```

Lo mejor de esta vía es que **no hay que recrear ningún contenedor**. Funciona
sobre lo que ya está corriendo, sin downtime.

### Para los contenedores futuros

En el demonio, para que todo lo que se cree desde ahora nazca limitado:

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "50m", "max-file": "3" }
}
```

Dos advertencias. Requiere `systemctl restart docker`, que reinicia todos los
contenedores. Y **solo aplica a contenedores creados después** — los existentes
conservan su configuración hasta que se recreen.

Por eso yo puse el `logrotate` primero y dejé el `daemon.json` sin reiniciar el
demonio: el problema de hoy ya está resuelto sin tocar nada en producción, y el
`daemon.json` entra en vigor la próxima vez que reinicie por cualquier otra razón.

Si prefieres fijarlo por servicio, va en el `docker-compose.yml`:

```yaml
services:
  mongodb:
    image: mongo:7
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "3"
```

### Y PM2, que tiene el mismo problema

Si además corres Node con PM2, sus logs tampoco rotan solos:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## Lo que me llevo

**`docker system df` no te va a avisar.** No cuenta los logs, así que puedes tener
12 GB invisibles a la herramienta que deberías estar usando para esto.

**El disco lleno casi nunca es "tengo muchos datos".** Es un log sin rotar, y
normalmente de un servicio que ni sabías que era tan hablador.

**Un monitoreo de disco con alerta al 80% te ahorra este día completo.** Yo llegué
al 93% por casualidad, revisando otra cosa. Eso es suerte, no proceso.
