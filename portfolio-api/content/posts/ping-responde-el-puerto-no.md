---
title: "24,000 reinicios: cuando el ping responde pero el puerto no"
slug: ping-responde-el-puerto-no
category: infraestructura
tags: ["Redes", "Debugging", "ufw", "Firewall", "MongoDB", "PM2"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
excerpt: "Dos servicios llevaban semanas reiniciándose cada 30 segundos. El ping a la base de datos respondía en 2.5 ms. La diferencia entre un timeout y un connection refused fue lo que resolvió el caso."
metaTitle: "Ping responde pero el puerto no: diagnosticar un firewall que dropea"
metaDescription: "Caso real: dos APIs en crash loop por 24,000 reinicios. ICMP cruzaba pero TCP no. Cómo distinguir un DROP de un REJECT y por qué un timeout apunta siempre al firewall."
metaKeywords: ["connection timed out mongodb", "ufw allow from ip", "ping funciona pero puerto no", "drop vs reject firewall", "crash loop pm2", "MongooseServerSelectionError", "debugging red"]
---

Abrí PM2 en una de mis VMs y vi esto:

```
│ SensoresApi  │ online │ ↺ 24246 │ uptime 11s  │
│ erp-backend  │ online │ ↺ 24097 │ uptime 29s  │
```

Veinticuatro mil reinicios. Uptime de segundos. Los dos servicios llevaban
semanas muriendo y levantándose cada 30 segundos sin que nadie se diera cuenta,
porque desde afuera el dominio contestaba —mal, con un 502, pero contestaba— y
nadie estaba mirando.

Este es el proceso que me llevó a la causa, y la pista que lo resolvió no fue la
que yo esperaba.

## La primera hipótesis, que era falsa

Hacía meses había migrado mi red de casa: las VMs pasaron de `192.168.100.x` a un
esquema segmentado con subredes por función. Mi apuesta inmediata fue que a esas
dos apps se les había quedado la IP vieja de MongoDB en el `.env`.

Tenía sentido. Era verificable. Y estaba equivocada:

```
SensoresApi   → mongodb://<cred>@10.10.30.101:27017/esp32_sensors_db
erp-backend   → mongodb://<cred>@10.10.30.101:27017/erp_universidad
```

Las dos apuntaban a la dirección nueva y correcta. Lección número uno: la
hipótesis cómoda es la que hay que verificar primero, precisamente porque da
flojera dudar de ella.

## El error real

```
MongooseServerSelectionError: Socket 'connect' timed out after 30000ms
```

Un **timeout**. Guárdate esa palabra, porque es toda la respuesta.

## Ping contra TCP

Lo siguiente fue lo obvio: ¿se ven las dos máquinas?

```bash
ping -c 2 10.10.30.101
# 2 packets transmitted, 2 received, 0% packet loss
# rtt min/avg/max = 2.462/2.524/2.586 ms
```

Perfecto. 2.5 ms entre subredes distintas, cero pérdida. El ruteo funciona, el
firewall de por medio deja pasar el tráfico, la VM de la base está viva.

Y sin embargo:

```bash
timeout 6 bash -c "cat < /dev/null > /dev/tcp/10.10.30.101/27017"
# (se cuelga y muere por timeout)
```

Aquí es donde mucha gente se va por el camino equivocado y empieza a revisar
Mongo: el `bindIp`, la autenticación, los usuarios. Yo estuve tentado.

**Pero el ping y el puerto viajan por caminos distintos.** `ping` es ICMP;
`27017` es TCP. Que el ICMP cruce prueba que hay ruta, nada más. Un firewall
puede permitir ICMP y bloquear TCP sin ninguna contradicción — de hecho es la
configuración más común, porque casi todo el mundo deja el ping abierto para
poder diagnosticar.

## La pista de oro: timeout, no refused

Esta distinción vale más que cualquier herramienta:

| Lo que ves | Lo que significa |
|---|---|
| **Connection refused** | Algo contestó "aquí no hay nadie en ese puerto". Llegaste al host. El servicio no está escuchando, o escucha en otra interfaz. |
| **Connection timed out** | Nadie contestó nada. Tus paquetes se fueron a un agujero negro. |

Un `refused` es un `RST` de vuelta: el host existe y te respondió. Un `timeout`
significa que el paquete se **descartó en silencio**, y eso es exactamente lo que
hace una regla de firewall con política `DROP`. Un firewall configurado con
`REJECT` te daría `refused`; con `DROP`, timeout.

Así que el error ya me estaba diciendo "firewall", yo simplemente no lo estaba
escuchando.

## La prueba que cerró el caso

Tenía una tercera máquina, la del servidor de aplicaciones, que sí usa esa misma
base sin problemas. La comparación fue inmediata:

| Desde | ping | TCP 27017 |
|---|---|---|
| VM del app server | ✅ | ✅ **abierto** |
| VM de los proyectos | ✅ 2.5 ms | ❌ **timeout** |

Dos máquinas en la misma subred, mismo destino, resultados distintos. Eso
descarta el ruteo y descarta a Mongo: si fuera cualquiera de los dos, fallarían
las dos por igual. Solo queda algo que distinga **por IP de origen**.

Entré a la VM de la base:

```bash
sudo ufw status
```

```
27017/tcp    ALLOW    10.10.20.100    # Mongo desde app VM100
```

Ahí estaba, con su comentario y todo. Una sola regla, autorizando una sola IP.

Cuando migré la red, autoricé la máquina de la que me acordaba —la del sitio
principal— y las dos apps de la otra VM quedaron fuera. Sus paquetes llegaban al
servidor de la base y `ufw` los descartaba sin decir nada. De ahí el timeout. De
ahí los 30 segundos exactos antes de morir: el `connectTimeoutMS` por defecto de
Mongoose.

El arreglo fueron dos líneas:

```bash
sudo ufw allow from 10.10.20.103 to any port 27017 proto tcp \
  comment 'Mongo desde VM103 (sensores, erp)'
```

```bash
pm2 restart SensoresApi erp-backend
```

Y en los logs, por primera vez en semanas:

```
✅ MongoDB conectado
Servidor escuchando en http://0.0.0.0:4000
```

## El daño colateral que no había visto

Esta parte me pareció lo más interesante de todo el episodio. Fui a revisar el
disco de esa VM y estaba al **93%**. Los culpables:

```
835 MB  erp-backend-error.log
295 MB  SensoresApi-error.log
```

Veinticuatro mil ciclos de crash escribiendo el mismo volcado de error de
Mongoose habían generado **1.1 GB de logs**. Un bug de red se había convertido en
un problema de capacidad, y si el disco hubiera llegado al 100% se habría
convertido en una caída total de esa VM — incluidos los servicios que sí
funcionaban.

Peor: esas apps imprimían la URI de conexión completa al arrancar, **con usuario
y contraseña en claro**. Así que la credencial de mi base de datos quedó escrita
miles de veces en disco, legible por cualquiera con acceso de lectura a
`~/.pm2/logs`. Eso lo arreglé también, redactando la credencial del log y
truncando los archivos viejos.

## Lo que me llevo

**Un servicio "online" en PM2 no significa nada.** El contador `↺` es el dato que
importa, y no lo estaba mirando nadie. 24,000 reinicios es un grito, no un
susurro.

**El endpoint de health tiene que mirar la base.** Los dos servicios tenían uno
que devolvía `{ok: true}` sin comprobar nada. Ese punto ciego es lo que permitió
que esto durara semanas. Ahora reportan el estado real de la conexión y devuelven
`503` si no está lista:

```js
app.get('/health', (req, res) => {
  const listo = mongoose.connection.readyState === 1;
  res.status(listo ? 200 : 503).json({
    ok: listo,
    db: listo ? 'conectado' : 'desconectado',
    uptime: Math.round(process.uptime()),
  });
});
```

**Cuando cambias una regla de firewall, la lista de clientes es más larga de lo
que recuerdas.** Yo autoricé una VM y me olvidé de otra. El comentario de la
regla (`# Mongo desde app VM100`) delataba el error desde el primer día: hablaba
de una máquina en singular.

**Y el reflejo que me quedó grabado:** cuando un timeout y un ping conviven, deja
de mirar la aplicación. El problema está entre los dos, y casi siempre es una
regla que autoriza por IP.
