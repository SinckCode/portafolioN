---
title: "Tenía la contraseña de root de mi hipervisor en 117 archivos"
slug: credenciales-en-117-scripts
category: devops
tags: ["Seguridad", "Secretos", "Python", "Automatización", "Refactor"]
status: published
publishedAt: 2026-09-30
contentFormat: markdown
excerpt: "Cada script de automatización que escribí para mi servidor traía la contraseña escrita dentro. Ciento diecisiete. Así los saqué de ahí sin romper ninguno."
metaTitle: "Sacar credenciales hardcodeadas de 117 scripts sin romperlos"
metaDescription: "Refactor real de secretos a variables de entorno: validación con ast.parse por archivo, inserción automática de imports y los dos bugs que introduje al hacerlo."
metaKeywords: ["credenciales hardcodeadas", "os.environ python", "secretos en codigo", "refactor masivo python", "ast.parse validar", "gitignore credenciales", "f-string comillas anidadas"]
---

Cada vez que necesitaba automatizar algo en mi servidor —revisar VMs, arreglar
rutas, configurar el firewall— escribía un script de Python con Paramiko. Y cada
uno empezaba igual:

```python
pve.connect('192.168.100.50', username='root', password='onesto01', timeout=10)
```

Un día los conté:

```bash
grep -rl "onesto01" --include=*.py . | wc -l
# 117
```

Ciento diecisiete archivos con la contraseña de root de mi hipervisor escrita
dentro. Y la misma contraseña, además, era la de `admin` de mi MongoDB.

## Por qué importa más de lo que parece

Un hipervisor no es una máquina más: es **todas** las máquinas. Quien tenga esa
credencial puede crear, borrar, clonar o montar el disco de cualquier VM, saltándose
cualquier control que haya dentro de ellas.

Y la exposición no era solo teórica. Encontré la misma contraseña en dos sitios
más:

- En los **logs de PM2** de dos aplicaciones que imprimían su URI de conexión
  completa al arrancar. Con un crash loop que llevaba 24,000 reinicios, la
  credencial estaba repetida miles de veces en disco.
- En un cambio **sin commitear** dentro del working tree de una de esas apps, con
  usuario, contraseña y —bonus— la IP vieja de la base, de antes de migrar la red.

## Lo que decidí hacer, y lo que no

Rotar la contraseña era lo obvio. Decidí **no hacerlo todavía**: rotarla implica
tocar el hipervisor, la base, los `.env` de cinco aplicaciones y los scripts, todo
a la vez. Un cambio grande en el momento equivocado es cómo se rompe un servidor.

Lo que sí hice fue quitar la credencial de los 117 archivos y dejarla en un solo
lugar. Separar "está en todas partes" de "es la misma" son dos problemas
distintos, y el primero es el que te muerde primero.

## El refactor

Con 117 archivos, esto se hace con un script. Pero un reemplazo masivo sobre código
que no vas a releer necesita red de seguridad. La mía fue validar cada archivo con
`ast.parse` antes de guardarlo:

```python
REEMPLAZOS = [
    ("password='onesto01'", "password=os.environ['PVE_PASSWORD']"),
    ('password="onesto01"', 'password=os.environ["PVE_PASSWORD"]'),
    # ...las variantes que aparecían de verdad
]

for viejo, reemplazo in REEMPLAZOS:
    nuevo = nuevo.replace(viejo, reemplazo)

nuevo = asegurar_import_os(nuevo)

try:
    ast.parse(nuevo)
except SyntaxError as e:
    saltados.append((ruta, 'quedaria roto: %s' % e))
    continue        # no se guarda, se reporta

io.open(ruta, 'w', encoding='utf-8', newline='\n').write(nuevo)
```

Tres cosas de este bucle que valen más que el reemplazo en sí:

**Si el resultado no parsea, el archivo no se toca.** Se acumula en una lista y se
reporta al final. Nunca guardar algo que no compila.

**Solo uno de los 117 importaba `os`.** Hubo que insertarlo, y el sitio correcto es
antes del primer import existente, no al inicio ciego del archivo — hay shebangs,
declaraciones de encoding y docstrings que tienen que quedarse arriba:

```python
RE_IMPORT = re.compile(r'^\s*(?:import|from)\s+\w', re.MULTILINE)

def asegurar_import_os(src):
    if re.search(r'^\s*import\s+os\s*$', src, re.MULTILINE):
        return src
    m = RE_IMPORT.search(src)
    if m:
        return src[:m.start()] + 'import os\n' + src[m.start():]
    # ...caso sin imports
```

**Un barrido final independiente.** Después de todo, volver a buscar el secreto en
el árbol completo. Si el reemplazo funcionó, no debe quedar ni una aparición.

Resultado: 113 archivos en la primera pasada, 7 con patrones que mi lista no
cubría (un `shell.send('...')`, un `sshpass -p "..."`, un `PASS = "..."`), y esos
a mano.

## Usé `os.environ[...]` y no `.get()`

A propósito:

```python
password=os.environ['PVE_PASSWORD']     # KeyError si falta
password=os.environ.get('PVE_PASSWORD') # None si falta
```

El primero explota al arrancar con un mensaje claro. El segundo pasa `None` a
Paramiko y te da un error de autenticación confuso diez segundos después.

Si el objetivo es que nunca vuelva a haber un valor por defecto en el código, el
comportamiento correcto es **fallar ruidosamente**.

## Los dos bugs que introduje

Esto es lo que más me gustó del ejercicio, porque los reemplazos masivos fallan de
formas específicas.

**Comillas anidadas en un f-string.** Uno de los scripts tenía:

```python
cmd(f'sshpass -p "Onesto2026!" ssh root@192.168.100.2 "echo OK"')
```

Mi reemplazo produjo:

```python
cmd(f'sshpass -p "{os.environ['OPNSENSE_PASSWORD']}" ssh ...')
```

Comillas simples dentro de un f-string delimitado por comillas simples. Eso es
**SyntaxError en Python anterior a 3.12**. Mi máquina tiene 3.12, así que
`ast.parse` lo aceptó y no me avisó. Habría estallado en cualquier servidor con una
versión anterior.

La solución no fue cambiar las comillas, fue sacar la lectura del entorno a una
constante:

```python
OPNSENSE_PASSWORD = os.environ["OPNSENSE_PASSWORD"]
# ...
cmd(f'sshpass -p "{OPNSENSE_PASSWORD}" ssh ...')
```

Más legible, un solo punto de lectura, y sin anidamiento.

**Un placeholder en un string que no era f-string.** Este fue peor, porque no
rompía nada: lo silenciaba.

```python
script = """#!/bin/sh
echo '{OPNSENSE_PASSWORD}' | pw usermod root -h 0
"""
```

Un triple-quoted normal. `{OPNSENSE_PASSWORD}` es texto literal: el script habría
enviado la cadena con llaves al servidor como si fuera la contraseña. Sintaxis
perfecta, comportamiento equivocado.

Lo cacé revisando el resultado a ojo, no con una herramienta. **Un reemplazo
masivo exige leer una muestra del diff**, porque ningún validador de sintaxis te
va a decir que cambiaste el significado.

## Dónde viven ahora

En un solo `CREDENCIALES.md` en la carpeta de documentación de mi servidor, con un
`.gitignore` que lo excluye por si esa carpeta alguna vez se vuelve repositorio.

No es una bóveda. Para un homelab de una persona, un archivo local documentado es
infinitamente mejor que 117 archivos con el secreto dentro, y es un paso que sí se
completa en una tarde. Un gestor de secretos de verdad es el siguiente escalón, no
la excusa para no dar este.

Los scripts se usan así:

```powershell
$env:PVE_PASSWORD = '...'
python .\gather_proxmox_info.py
```

## Lo que me llevo

**No escribí 117 archivos con la contraseña de golpe.** Escribí uno, y luego copié
la cabecera 116 veces a lo largo de meses. Los problemas de secretos crecen por
copiar y pegar, no por una decisión.

**Los logs son un sitio donde se filtran credenciales y nadie los revisa.** Yo
buscaba la contraseña en el código y estaba también en `~/.pm2/logs`, miles de
veces, en texto plano.

**Separa el problema.** "Está en 117 archivos" y "es la misma en dos sistemas
críticos" son dos riesgos. Arreglar uno hoy vale más que planear los dos para
algún día.
