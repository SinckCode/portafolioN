# -*- coding: utf-8 -*-
"""
Genera las portadas del blog con la identidad visual del sitio.

Por que existe: las portadas generadas con IA en articulos tecnicos se leen como
relleno, y lo que da credibilidad a estos posts son los artefactos reales — la
tabla de PM2 con 24,000 reinicios, el disco al 93%, el ENOENT de la plantilla.
Este script renderiza esa salida real con los colores y tipografias del sitio,
asi que cada portada es a la vez la prueba de lo que cuenta el articulo y una
pieza consistente con las demas.

Uso:
    python tools/covers/generar.py            # genera todas
    python tools/covers/generar.py <slug>     # solo una

Salida: portfolio-frontend/public/covers/<slug>.png  (1200x630)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- rutas

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
FUENTES = os.path.join(AQUI, 'fonts')
SALIDA = os.path.join(RAIZ, 'portfolio-frontend', 'public', 'covers')

# ---------------------------------------------------- paleta del sitio

FONDO = (15, 17, 21)          # --bg-surface
FONDO_PANEL = (10, 12, 15)
PRIMARIO = (0, 180, 216)      # --primary
PRIMARIO_CLARO = (72, 202, 228)
RETICULA = (24, 27, 33)
TEXTO = (255, 255, 255)
TEXTO_SUAVE = (148, 155, 168)
BORDE = (36, 40, 48)
ROJO = (239, 68, 68)

ANCHO, ALTO = 1200, 630
MARGEN = 64


def fuente(nombre, tam):
    """Carga una fuente de marca; cae a una del sistema si falta el archivo."""
    ruta = os.path.join(FUENTES, nombre)
    if os.path.exists(ruta):
        return ImageFont.truetype(ruta, tam)
    respaldo = {
        'SpaceGrotesk.ttf': 'C:/Windows/Fonts/arialbd.ttf',
        'JetBrainsMono-Bold.ttf': 'C:/Windows/Fonts/consolab.ttf',
        'JetBrainsMono-Regular.ttf': 'C:/Windows/Fonts/consola.ttf',
    }.get(nombre)
    if respaldo and os.path.exists(respaldo):
        return ImageFont.truetype(respaldo, tam)
    return ImageFont.load_default()


def envolver(texto, fnt, ancho_max, dibujo):
    """Parte el texto en lineas que caben en ancho_max."""
    palabras = texto.split()
    lineas, actual = [], ''
    for p in palabras:
        prueba = (actual + ' ' + p).strip()
        if dibujo.textlength(prueba, font=fnt) <= ancho_max:
            actual = prueba
        else:
            if actual:
                lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


def base():
    """Lienzo con el fondo y la reticula tenue comunes a todas las portadas."""
    img = Image.new('RGB', (ANCHO, ALTO), FONDO)
    d = ImageDraw.Draw(img)
    for x in range(0, ANCHO, 48):
        d.line([(x, 0), (x, ALTO)], fill=RETICULA, width=1)
    for y in range(0, ALTO, 48):
        d.line([(0, y), (ANCHO, y)], fill=RETICULA, width=1)
    # Barra de acento a la izquierda: el ancla visual de la marca.
    d.rectangle([0, 0, 6, ALTO], fill=PRIMARIO)
    return img, d


def pie(d, categoria):
    """Categoria a la izquierda y dominio a la derecha, alineados abajo."""
    f_pie = fuente('JetBrainsMono-Regular.ttf', 19)
    y = ALTO - MARGEN - 8

    etiqueta = categoria.upper()
    ancho_chip = d.textlength(etiqueta, font=f_pie) + 26
    d.rounded_rectangle([MARGEN, y - 6, MARGEN + ancho_chip, y + 26],
                        radius=6, outline=PRIMARIO, width=1)
    d.text((MARGEN + 13, y + 1), etiqueta, font=f_pie, fill=PRIMARIO)

    dominio = 'angelonesto.com'
    d.text((ANCHO - MARGEN - d.textlength(dominio, font=f_pie), y + 1),
           dominio, font=f_pie, fill=TEXTO_SUAVE)


def panel_terminal(d, lineas, y0, alto_panel):
    """
    Dibuja un panel con la salida real de una terminal.

    Cada linea es (texto, color). El panel lleva tres circulos arriba, que es la
    convencion habitual de una ventana de terminal.
    """
    x0, x1 = MARGEN, ANCHO - MARGEN
    d.rounded_rectangle([x0, y0, x1, y0 + alto_panel], radius=10,
                        fill=FONDO_PANEL, outline=BORDE, width=1)

    # Barra superior de la ventana.
    d.line([(x0 + 1, y0 + 38), (x1 - 1, y0 + 38)], fill=BORDE, width=1)
    for i, col in enumerate([(90, 96, 106), (90, 96, 106), PRIMARIO]):
        d.ellipse([x0 + 18 + i * 20, y0 + 14, x0 + 28 + i * 20, y0 + 24], fill=col)

    f_mono = fuente('JetBrainsMono-Regular.ttf', 21)
    f_mono_b = fuente('JetBrainsMono-Bold.ttf', 21)
    y = y0 + 58
    for texto, color in lineas:
        usar = f_mono_b if color == PRIMARIO or color == ROJO else f_mono
        d.text((x0 + 26, y), texto, font=usar, fill=color)
        y += 30


def portada(slug, titulo, categoria, terminal=None):
    """Genera una portada. Con `terminal`, incluye el panel de salida real."""
    img, d = base()

    if terminal:
        alto_panel = 58 + 30 * len(terminal) + 18
        f_tit = fuente('SpaceGrotesk.ttf', 46)
        lineas_tit = envolver(titulo, f_tit, ANCHO - MARGEN * 2, d)[:2]

        y = MARGEN + 4
        for ln in lineas_tit:
            d.text((MARGEN, y), ln, font=f_tit, fill=TEXTO)
            y += 56

        panel_terminal(d, terminal, y + 18, alto_panel)
    else:
        f_tit = fuente('SpaceGrotesk.ttf', 62)
        lineas_tit = envolver(titulo, f_tit, ANCHO - MARGEN * 2 - 40, d)[:4]
        alto_bloque = len(lineas_tit) * 74
        y = (ALTO - alto_bloque) // 2 - 20

        d.rectangle([MARGEN, y + 8, MARGEN + 5, y + alto_bloque - 10], fill=PRIMARIO)
        for ln in lineas_tit:
            d.text((MARGEN + 26, y), ln, font=f_tit, fill=TEXTO)
            y += 74

    pie(d, categoria)

    os.makedirs(SALIDA, exist_ok=True)
    ruta = os.path.join(SALIDA, '%s.png' % slug)
    img.save(ruta, 'PNG', optimize=True)
    return ruta


# ------------------------------------------------------------- articulos
# La salida de terminal de cada uno es real, tomada del servidor.

POSTS = [
    {
        'slug': 'ping-responde-el-puerto-no',
        'titulo': '24,000 reinicios: cuando el ping responde pero el puerto no',
        'categoria': 'infraestructura',
        'terminal': [
            ('$ pm2 list', TEXTO_SUAVE),
            ('  SensoresApi   online   restarts 24246   uptime 11s', ROJO),
            ('  erp-backend   online   restarts 24097   uptime 29s', ROJO),
            ('', TEXTO_SUAVE),
            ('$ ping 10.10.30.101   ->  2.5 ms, 0% loss', TEXTO),
            ('$ tcp  :27017        ->  timed out', PRIMARIO),
        ],
    },
    {
        'slug': 'docker-logs-llenaron-mi-disco',
        'titulo': 'Un contenedor de Mongo se comió 10 GB de disco en logs',
        'categoria': 'devops',
        'terminal': [
            ('$ df -h /', TEXTO_SUAVE),
            ('  /dev/sda1   30G   28G   1.4G   93%  /', ROJO),
            ('', TEXTO_SUAVE),
            ('$ du -m /var/lib/docker/containers/*/*-json.log', TEXTO_SUAVE),
            ('  10179 MB   whatsup-mongo', PRIMARIO),
            ('   1743 MB   whatsup-loki', TEXTO),
        ],
    },
    {
        'slug': 'tres-bugs-para-que-un-correo-no-saliera',
        'titulo': 'Tres bugs apilados para que un solo correo no saliera',
        'categoria': 'desarrollo web',
        'terminal': [
            ('$ curl -X POST /api/auth/forgot-password', TEXTO_SUAVE),
            ('  201  "a reset link has been sent"', TEXTO),
            ('', TEXTO_SUAVE),
            ('# en los logs de la API:', TEXTO_SUAVE),
            ('  ENOENT: no such file or directory, open', ROJO),
            ("    '.../dist/modules/mail/templates/reset-password.hbs'", ROJO),
        ],
    },
    {
        'slug': 'por-que-google-no-indexaba-mi-home',
        'titulo': 'Por qué Google no indexaba mi página de inicio',
        'categoria': 'desarrollo web',
        'terminal': [
            ('# Search Console', TEXTO_SUAVE),
            ('  1 página indexada', TEXTO),
            ('  26 descubiertas: actualmente sin indexar', ROJO),
            ('', TEXTO_SUAVE),
            ('$ canonical en /            ->  ninguno', ROJO),
            ('$ lastmod de las 28 urls    ->  todas "ahora"', PRIMARIO),
        ],
    },
    {
        'slug': 'autohospedar-correo-en-casa-limites',
        'titulo': 'Monté un servidor de correo en casa: lo que sí puede y lo que no',
        'categoria': 'infraestructura',
        'terminal': [
            ('$ tcp  mx1.improvmx.com:25     ->  timeout', ROJO),
            ('$ tcp  smtp-relay:587          ->  conecta', TEXTO),
            ('', TEXTO_SUAVE),
            ('# el relay que sí tenía configurado:', TEXTO_SUAVE),
            ('  451 Authentication failed:', ROJO),
            ('      Maximum credits exceeded', ROJO),
        ],
    },
    {
        'slug': 'mi-propia-api-de-despliegue',
        'titulo': 'Mi propia API de despliegue: un POST por proyecto',
        'categoria': 'devops',
        'terminal': [
            ('$ POST /deploy/portfolio-api', TEXTO_SUAVE),
            ('  OK  sync-repo        0.5s', TEXTO),
            ('  OK  deps            13.6s', TEXTO),
            ('  OK  build            8.9s', TEXTO),
            ('  OK  seed-proyectos   1.6s', PRIMARIO),
            ('  verify  200  api.angelonesto.com/health', PRIMARIO),
        ],
    },
    {
        'slug': 'credenciales-en-117-scripts',
        'titulo': 'Tenía la contraseña de root de mi hipervisor en 117 archivos',
        'categoria': 'devops',
        'terminal': [
            ('$ grep -rl "<contraseña>" --include=*.py . | wc -l', TEXTO_SUAVE),
            ('  117', ROJO),
            ('', TEXTO_SUAVE),
            ('# y también, miles de veces, en:', TEXTO_SUAVE),
            ('  ~/.pm2/logs/erp-backend-error.log', ROJO),
            ('  835 MB de credencial repetida', PRIMARIO),
        ],
    },
    {
        'slug': 'contenido-como-codigo',
        'titulo': 'Mis 17 proyectos tenían la descripción vacía en producción',
        'categoria': 'desarrollo web',
        'terminal': [
            ('$ db.projects.find({}, {details: 1})', TEXTO_SUAVE),
            ('  projects: 17   details min: 0   max: 0', ROJO),
            ('  vacíos: los 17', ROJO),
            ('', TEXTO_SUAVE),
            ('# y el sitio se veia bien:', TEXTO_SUAVE),
            ('  el fallback estático lo tapaba', PRIMARIO),
        ],
    },
    {
        'slug': 'portal-de-tours-360-para-oculus',
        'titulo': 'Monté un portal de tours 360 para Oculus en mi propio servidor',
        'categoria': 'tutorial',
    },
    {
        'slug': 'cloudflare-tunnel-sin-abrir-puertos',
        'titulo': 'Cloudflare Tunnel: publicar tu homelab sin abrir un solo puerto',
        'categoria': 'infraestructura',
        'terminal': [
            ('# el modelo de siempre:', TEXTO_SUAVE),
            ('  internet  ->  puerto abierto  ->  tu red', ROJO),
            ('', TEXTO_SUAVE),
            ('# con el tunel, la conexion sale desde dentro:', TEXTO_SUAVE),
            ('  tu VM  ->  (saliente)  ->  Cloudflare  ->  visitante', PRIMARIO),
            ('  reglas de entrada en el router:  0', PRIMARIO),
        ],
    },
    {
        'slug': 'deploy-docker-github-actions',
        'titulo': 'CI/CD con GitHub Actions contra tu propio servidor, sin exponer SSH',
        'categoria': 'devops',
        'terminal': [
            ('# lo que casi todos los tutoriales piden:', TEXTO_SUAVE),
            ('  secrets.SSH_PRIVATE_KEY   ->  shell en tu servidor', ROJO),
            ('', TEXTO_SUAVE),
            ('# lo que uso en su lugar:', TEXTO_SUAVE),
            ('  POST /deploy/<proyecto>', PRIMARIO),
            ('  Authorization: Bearer <token revocable>', PRIMARIO),
        ],
    },
    {
        'slug': 'mi-homelab-con-proxmox-aprender-infraestructura-rompiendo-cosas-en-casa',
        'titulo': 'Mi homelab con Proxmox: aprender infraestructura rompiendo cosas',
        'categoria': 'tutorial',
        'terminal': [
            ('$ pvecm status', TEXTO_SUAVE),
            ('  cluster:  2 nodos', TEXTO),
            ('  quorum:   OK', TEXTO),
            ('', TEXTO_SUAVE),
            ('# red segmentada por funcion, no plana:', TEXTO_SUAVE),
            ('  OPNsense enrutando 4 subredes', PRIMARIO),
        ],
    },
    {
        'slug': '17-proyectos-como-estudiante',
        'titulo': 'Lo que aprendí construyendo 17 proyectos como estudiante',
        'categoria': 'reflexión',
    },
]



# --------------------------------------------------------- proyectos
# Las portadas de proyecto van a public/projects/<slug>/, que es la convencion
# que ya usa el portafolio, no a public/covers/ (eso es del blog).

SALIDA_PROYECTOS = os.path.join(RAIZ, 'portfolio-frontend', 'public', 'projects')

PROYECTOS = [
    {
        'slug': 'deploy-api',
        'titulo': 'Deploy API',
        'categoria': 'devops',
        'terminal': [
            ('$ POST /deploy/<proyecto>', TEXTO_SUAVE),
            ('  OK  sync-repo   OK  deps   OK  build', TEXTO),
            ('  OK  seed        OK  sync   OK  reload', TEXTO),
            ('  verify 200', PRIMARIO),
            ('', TEXTO_SUAVE),
            ('8 proyectos · 3 maquinas · pipelines en JSON', PRIMARIO),
        ],
    },
    {
        'slug': 'portal-vr-tours-360',
        'titulo': 'Portal VR de tours 360',
        'categoria': 'realidad virtual',
        'terminal': [
            ('# un dominio, una carpeta por tour', TEXTO_SUAVE),
            ('  vr.angelonesto.com/<tour>/', TEXTO),
            ('', TEXTO_SUAVE),
            ('krpano + nginx + Cloudflare Tunnel', PRIMARIO),
            ('HTTPS obligatorio para el modo VR del Quest', TEXTO),
            ('3DoF · publicar un tour = copiar una carpeta', PRIMARIO),
        ],
    },
    {
        'slug': 'el-bucle-360',
        'titulo': 'EL BUCLE — experiencia inmersiva 360',
        'categoria': 'realidad virtual',
        'terminal': [
            ('# render 360 equirectangular', TEXTO_SUAVE),
            ('  8192 x 4096 · 24 fps · Cycles/OptiX', TEXTO),
            ('  camara equirect en (90, 0, 0) · ojos a 1.6 m', TEXTO),
            ('', TEXTO_SUAVE),
            ('110 s · 6 bloques de 15 s · 5 niveles', PRIMARIO),
            ('3DoF para YouTube VR · found footage', PRIMARIO),
        ],
    },
]


def generar_proyectos():
    """Una imagen por proyecto, con el mismo lenguaje visual que el blog."""
    for p in PROYECTOS:
        carpeta = os.path.join(SALIDA_PROYECTOS, p['slug'])
        os.makedirs(carpeta, exist_ok=True)
        img, d = base()

        alto_panel = 58 + 30 * len(p['terminal']) + 18
        f_tit = fuente('SpaceGrotesk.ttf', 46)
        lineas = envolver(p['titulo'], f_tit, ANCHO - MARGEN * 2, d)[:2]
        y = MARGEN + 4
        for ln in lineas:
            d.text((MARGEN, y), ln, font=f_tit, fill=TEXTO)
            y += 56
        panel_terminal(d, p['terminal'], y + 18, alto_panel)
        pie(d, p['categoria'])

        destino = os.path.join(carpeta, '%s1.png' % p['slug'])
        img.save(destino, 'PNG', optimize=True)
        print('  %-44s %3d KB' % (
            '/projects/%s/%s1.png' % (p['slug'], p['slug']),
            os.path.getsize(destino) // 1024))



# ----------------------------------------------------------- cursos
# Ficha de catalogo, no articulo: aqui lo que vende es el alcance del curso
# (nivel, duracion, cuanto material hay), asi que manda el titulo y debajo van
# las cifras. Sin panel de terminal, que es el lenguaje del blog.

SALIDA_CURSOS = os.path.join(RAIZ, 'portfolio-frontend', 'public', 'courses')

NIVELES = {
    'beginner': ('principiante', (82, 196, 136)),
    'intermediate': ('intermedio', PRIMARIO),
    'advanced': ('avanzado', (244, 162, 97)),
}

CURSOS = [
    {
        'slug': 'homelab-desde-cero',
        'titulo': 'Homelab desde cero: tu propio servidor en casa',
        'nivel': 'beginner', 'duracion': '5h 20m', 'modulos': 6, 'lecciones': 33,
        'categoria': 'devops',
    },
    {
        'slug': 'cicd-propio-sin-exponer-ssh',
        'titulo': 'CI/CD propio: despliega sin entregar tus llaves',
        'nivel': 'intermediate', 'duracion': '3h 45m', 'modulos': 6, 'lecciones': 28,
        'categoria': 'devops',
    },
    {
        'slug': 'iot-del-sensor-al-dashboard',
        'titulo': 'IoT real: del sensor ESP32 al dashboard en internet',
        'nivel': 'beginner', 'duracion': '4h 15m', 'modulos': 6, 'lecciones': 29,
        'categoria': 'iot',
    },
    {
        'slug': 'seo-tecnico-en-nextjs',
        'titulo': 'SEO técnico en Next.js: que Google sí indexe tu sitio',
        'nivel': 'intermediate', 'duracion': '2h 50m', 'modulos': 6, 'lecciones': 24,
        'categoria': 'desarrollo web',
    },
    {
        'slug': 'nextjs-nestjs-en-produccion',
        'titulo': 'Next.js + NestJS en producción: del localhost al dominio propio',
        'nivel': 'advanced', 'duracion': '6h 30m', 'modulos': 7, 'lecciones': 36,
        'categoria': 'desarrollo web',
    },
    {
        'slug': 'react-practico-de-cero-a-deploy',
        'titulo': 'React práctico: de cero a deploy',
        'nivel': 'intermediate', 'duracion': '6h 15m', 'modulos': 3, 'lecciones': 9,
        'categoria': 'desarrollo web',
    },
    {
        'slug': 'docker-y-cicd-desde-cero',
        'titulo': 'Docker y CI/CD desde cero',
        'nivel': 'beginner', 'duracion': '4h 30m', 'modulos': 3, 'lecciones': 11,
        'categoria': 'devops',
    },
]


def portada_curso(c):
    img, d = base()

    etiqueta, color_nivel = NIVELES[c['nivel']]
    f_mono = fuente('JetBrainsMono-Regular.ttf', 20)

    # Insignia de nivel arriba, que es lo primero que filtra quien mira el
    # catalogo: saber si le queda grande o chico.
    y = MARGEN
    ancho = d.textlength(etiqueta.upper(), font=f_mono) + 28
    d.rounded_rectangle([MARGEN, y, MARGEN + ancho, y + 34], radius=17,
                        fill=color_nivel)
    d.text((MARGEN + 14, y + 6), etiqueta.upper(), font=f_mono, fill=(10, 12, 15))

    # Titulo
    f_tit = fuente('SpaceGrotesk.ttf', 54)
    lineas = envolver(c['titulo'], f_tit, ANCHO - MARGEN * 2 - 30, d)[:3]
    y += 72
    for ln in lineas:
        d.text((MARGEN, y), ln, font=f_tit, fill=TEXTO)
        y += 66

    # Cifras del alcance, separadas por puntos medios.
    f_cifras = fuente('JetBrainsMono-Regular.ttf', 23)
    cifras = '%s   ·   %d módulos   ·   %d lecciones' % (
        c['duracion'], c['modulos'], c['lecciones'])
    y += 14
    d.line([(MARGEN, y), (MARGEN + 70, y)], fill=color_nivel, width=3)
    d.text((MARGEN, y + 22), cifras, font=f_cifras, fill=TEXTO_SUAVE)

    pie(d, c['categoria'])

    os.makedirs(SALIDA_CURSOS, exist_ok=True)
    destino = os.path.join(SALIDA_CURSOS, '%s.png' % c['slug'])
    img.save(destino, 'PNG', optimize=True)
    return destino


def generar_cursos():
    for c in CURSOS:
        ruta_png = portada_curso(c)
        print('  %-44s %3d KB' % ('/courses/%s.png' % c['slug'],
                                  os.path.getsize(ruta_png) // 1024))


def main():
    pedido = sys.argv[1] if len(sys.argv) > 1 else None

    if pedido == 'proyectos':
        generar_proyectos()
        return 0

    if pedido == 'cursos':
        generar_cursos()
        return 0

    hechas = 0
    for p in POSTS:
        if pedido and p['slug'] != pedido:
            continue
        ruta = portada(p['slug'], p['titulo'], p['categoria'], p.get('terminal'))
        tam = os.path.getsize(ruta) // 1024
        print('  %-46s %3d KB' % (os.path.basename(ruta), tam))
        hechas += 1

    if pedido and hechas == 0:
        print('  no encontre el slug: %s' % pedido)
        return 1
    print('\n%d portada(s) en portfolio-frontend/public/covers/' % hechas)
    return 0


if __name__ == '__main__':
    sys.exit(main())
