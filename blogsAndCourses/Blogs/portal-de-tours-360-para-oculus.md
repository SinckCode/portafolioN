---
title: "Monté un portal de tours 360 para Oculus en mi propio servidor"
slug: portal-de-tours-360-para-oculus
category: tutorial
tags: ["Realidad Virtual", "krpano", "Oculus", "nginx", "Proxmox", "360"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
coverImage: /covers/portal-de-tours-360-para-oculus.png
excerpt: "Una VM, krpano, nginx y un túnel: tours panorámicos con link propio que se abren en el navegador del Quest. Lo que aprendí sobre servir contenido inmersivo desde casa."
metaTitle: "Portal de tours 360 con krpano y nginx para Oculus Quest"
metaDescription: "Cómo publico tours panorámicos en mi homelab: estructura de carpetas por proyecto, la trampa de las rutas relativas de krpano, nginx, HTTPS por túnel y el límite de 3DoF."
metaKeywords: ["krpano tour 360", "oculus quest navegador", "tour virtual self hosted", "panorama 360 nginx", "3dof 6dof", "realidad virtual web", "vr homelab"]
---

Tenía un requisito concreto: poder mandarle a alguien un link y que lo abriera con
unas Oculus Quest para recorrer un espacio en 360°. Sin instalar una app, sin
subirlo a una plataforma de terceros, con mi propio dominio.

Acabó siendo una VM dedicada, krpano, nginx y un túnel. Esto es cómo funciona y lo
que me costó entender.

## La decisión de arquitectura

Lo primero que resolví fue cómo organizar varios tours. Mi primer instinto era un
subdominio por proyecto: `cancha.vr.midominio.com`, `parejas.vr.midominio.com`. Es
lo que parece "más profesional" y es la peor opción para esto: cada subdominio
nuevo exige tocar el DNS, tocar la configuración del túnel y reiniciar el servicio.

Me quedé con **un dominio, una carpeta por proyecto**:

```
https://vr.midominio.com/cancha/     → tour
https://vr.midominio.com/parejas/    → tour
https://vr.midominio.com/            → índice con los links
```

Publicar un tour nuevo es copiar una carpeta. Cero configuración.

## La trampa de las rutas relativas

Aquí perdí un rato, y es el detalle más útil de todo el artículo.

krpano genera una carpeta `vtour/` con esta forma:

```
vtour/
├── tour.html
├── tour.js
├── tour.xml
└── panos/
```

El instinto es copiar `vtour/` entera dentro de la carpeta del proyecto, quedando
`/cancha/vtour/tour.html`. No funciona: **`tour.html` carga `tour.js` con ruta
relativa**, y en cuanto la profundidad cambia respecto a lo que krpano asumió, el
visor arranca en blanco. Sin error visible en la página — solo un canvas vacío.

La solución es aplanar: el contenido de `vtour/` va **directo** en la carpeta del
proyecto.

```
/var/www/vr/cancha/
├── tour.html
├── tour.js
├── tour.xml
└── panos/
```

Y en nginx, que `tour.html` sea el índice de la carpeta:

```nginx
server {
    listen 80;
    root /var/www/vr;
    index index.html tour.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Con eso `https://vr.midominio.com/cancha/` abre el tour sin que el visitante
escriba `tour.html`.

Si alguna vez ves un tour de krpano arrancar en negro, revisa la consola del
navegador buscando un 404 de `tour.js` antes de sospechar de cualquier otra cosa.

## Servirlo sin abrir puertos

El portal vive detrás de un Cloudflare Tunnel, igual que el resto de mis
servicios: el HTTPS lo termina Cloudflare y mi router no tiene ninguna regla de
entrada.

```yaml
ingress:
  - hostname: vr.midominio.com
    service: http://localhost:80
  - service: http_status:404
```

Para VR esto no es un lujo: **el navegador del Quest exige HTTPS** para las APIs
inmersivas. Sin certificado válido no hay modo VR, y gestionar certificados en una
VM doméstica con IP dinámica es un dolor que el túnel te quita.

## El peso real de un tour

Me sorprendió lo poco que ocupa:

```
cancha        14 MB
parejas       18 MB
proyecto1    4.7 MB
samuel-tour   46 MB
```

Todo el portal cabe en menos de 100 MB. El coste real de un tour **no está en el
disco**: está en el ancho de banda del primer visitante y, sobre todo, en el tiempo
de producción — capturar las panorámicas bien, con la cámara nivelada y exposición
consistente entre tomas, es el 90% del trabajo. El servidor es la parte fácil.

Por eso le di 80 GB a la VM y lleva usado el 10%. La holgura no es para los tours,
es para los archivos intermedios cuando procesas material nuevo.

## 3DoF y por qué importa la distinción

Un tour panorámico da **3DoF**: tres grados de libertad, los tres giros de cabeza.
Mirás arriba, abajo, alrededor. Lo que no puedes es moverte: no hay acercarse a un
objeto ni asomarse detrás de una columna.

**6DoF** añade el desplazamiento en las tres direcciones, y es otra cosa
técnicamente. Un panorama es una imagen proyectada sobre una esfera; para moverte
hace falta geometría real de la escena. Eso te lleva a fotogrametría, nubes de
puntos o Gaussian Splatting, con pipelines de reconstrucción y hardware de otro
nivel.

Vale saberlo antes de prometer nada: si alguien espera "caminar" por el espacio, un
tour 360 lo va a decepcionar por más pulido que esté. Y al revés, para mostrar un
lugar tal como se ve desde puntos concretos, 3DoF es suficiente y cuesta una
fracción.

## Dos cosas de la licencia

krpano no es libre. La versión de evaluación mete una marca de agua sobre el tour,
y para publicar algo en serio hay que comprar licencia. No es caro para lo que
hace, pero **descúbrelo antes de enseñárselo a alguien**, no el día de la
presentación.

Y una recomendación práctica: la VM del portal arranca automáticamente con el
nodo, pero con orden de arranque **posterior al firewall**. Si levanta antes que el
router virtual, el túnel no encuentra salida y el servicio queda muerto hasta que
alguien lo reinicie a mano. En Proxmox eso es un `startup=order=2,up=15`.

## Lo que me llevo

**Un dominio y carpetas le gana a un subdominio por proyecto** cuando esperas
publicar seguido. La friction de publicar determina cuánto publicas.

**El HTTPS no es opcional en VR.** Y un túnel te lo resuelve sin certificados ni IP
fija.

**Las rutas relativas son la causa del 90% de los visores en blanco.** Antes de
dudar del contenido, mira si el navegador encontró el JavaScript.

**Distingue 3DoF de 6DoF en la primera conversación**, no en la entrega. Es la
diferencia entre "mira alrededor" y "camina por aquí", y entre un fin de semana y
un proyecto entero.
