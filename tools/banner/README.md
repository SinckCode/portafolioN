# Banner de LinkedIn

`linkedin.html` es la fuente. `linkedin-banner.png` es lo que se sube
(3168x792 = 1584x396 a 2x, que es lo que LinkedIn pide).

La paleta y la tipografia salen de
`portfolio-frontend/src/app/globals.css`, para que el perfil y
angelonesto.com se lean como la misma marca.

## Re-renderizar despues de editar el HTML

    chrome --headless=new --disable-gpu --hide-scrollbars \
      --force-device-scale-factor=2 --window-size=1584,396 \
      --virtual-time-budget=8000 \
      --screenshot=linkedin-banner.png linkedin.html

En Windows el binario esta en
`C:\Program Files\Google\Chrome\Application\chrome.exe`.

## Zona que tapa la foto de perfil

LinkedIn encima el avatar sobre la esquina inferior izquierda: ocupa
aproximadamente x 44-368 y de y=229 hacia abajo. Nada legible debe caer
ahi. Por eso el bloque de texto arranca en `left: 372px` y la tira del
stack va arriba y no a media altura.

## Cifras

20 proyectos, 71 tecnologias y 5 anios programando (desde 2021) son
datos reales: los dos primeros salen de
`GET https://api.angelonesto.com/api/projects?limit=100`. Si cambian,
actualiza el HTML a mano.
