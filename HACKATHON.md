# Codegeist 2026: lo que falta y quién lo hace

App: `Apps/plazos-jira` (Plazos: court deadlines for Jira). Categoría: Apps for Specialized Industries. Premio extra al que optamos: Best Agents (Rovo), 1.500 $. Primer premio por categoría 15.000 $, segundo 8.000 $, tercero 5.000 $.

Fechas (hora de Málaga): entrega hasta el 22 de diciembre de 2026 a las 21:00. Jurado del 5 de enero al 3 de febrero de 2027. Ganadores hacia el 15 de febrero de 2027. Hay 1.809 participantes apuntados a 5 de noviembre.

## Lo que haces tú (cuentas a tu nombre)

1. ~~Cuenta de Atlassian y sitio de desarrollo~~ Hecho el 8 de noviembre: hidralucasg45.atlassian.net.
2. ~~Token de API~~ Hecho el 9 de noviembre. Está en el `.env` de SIMBAI como `FORGE_EMAIL` y `FORGE_API_TOKEN`; `scripts/env-sync.ps1` lo copia al entorno de Windows y Forge lo lee de ahí. Si caduca, se crea otro en https://id.atlassian.com/manage-profile/security/api-tokens y se repite ese paso.
3. ~~forge login~~ No hace falta: con las variables del paso 2 la CLI ya tiene sesión.
4. Cuenta en Devpost hecha el 8 de noviembre. Falta pulsar «Join hackathon» en https://codegeist2026.devpost.com/ si no lo has hecho.
5. Registrar los plazos de los tres primeros expedientes de demo desde el panel «Court deadline» (la descripción de cada uno dice qué poner): DESP-1 vencido, DESP-2 próximo, DESP-3 confirmado. Es lo único que no puedo hacer por la API: el panel escribe en el almacenamiento de la app. Hecho el 9 de noviembre: DESP-1 vence 2026-10-14 (vencido), DESP-2 2026-11-24, DESP-3 2026-11-12.
   Después, en la consola de desarrollador (https://developer.atlassian.com/console/myapps/252c9fc9-2160-4557-8138-775e3ad9a04b), pestaña Distribute → Start sharing: genera el enlace de instalación que va en la entrega. Hecho el 9 de noviembre: estado «Sharing with anyone», contacto https://simbai.vercel.app/contacto, privacidad y aviso legal de simbai.vercel.app. Enlace de instalación copiado a SUBMISSION.md el 9 de noviembre.
6. Grabar o aprobar el vídeo (menos de 5 minutos, en YouTube público; el guion lo escribo yo) y pulsar Submit en Devpost con los textos que te dejo preparados.

## Lo que hago yo

- App completa: motor de plazos con 11 pruebas, panel, ajustes de festivos, agente Rovo y aviso diario. Hecho el 5 de noviembre.
- Registro, despliegue e instalación: hecho el 9 de noviembre. App `Plazos`, id `252c9fc9-2160-4557-8138-775e3ad9a04b`, Developer Space «SIMBAI», entorno development, instalada en Jira de hidralucasg45.atlassian.net (`forge lint` sin avisos). Consola: https://developer.atlassian.com/console/myapps/252c9fc9-2160-4557-8138-775e3ad9a04b. Desplegada también a production el 9 de noviembre (misma versión que development). El enlace de instalación para el jurado lo genera el usuario en Distribute → Start sharing (paso 5 de arriba).
- Datos de demostración: proyecto `DESP` «Despacho demo» (Kanban, gestionado por el equipo) con cinco expedientes DESP-1 a DESP-5, creado el 9 de noviembre por la API. Los plazos los registra el usuario desde el panel (paso 5 de arriba).
- Guion del vídeo y textos de la entrega (descripción, cómo cumple el requisito, categoría, premio extra).
- Si da tiempo: publicar en el Marketplace (otro premio extra de 1.500 $; exige revisión de Atlassian, que tarda semanas, por eso va al final).

## Riesgos conocidos

- Rovo tiene que estar activado en el sitio del jurado para probar el agente. En los sitios de desarrollo viene incluido; en el texto de la entrega se explica que el resto de la app funciona sin Rovo.
- `forge register` pedía crear un Developer Space con un asistente interactivo que no funciona sin terminal; se resolvió lanzando la CLI desde Node con stdin/stdout marcados como TTY. Solo hace falta una vez. Node se actualizó a 24.22.1 el 7 de noviembre para poder usar la CLI 15.
- La UI usa UI Kit (sin bundler propio). Probada en el sitio el 9 de noviembre; tres fallos corregidos ese día: `"type": "module"` rompía el empaquetado del backend (el runtime es CommonJS), el formulario bloqueaba el envío sin avisar si faltaba la unidad, y un resolver que devolvía `undefined` llegaba al frontend como `{}` y el panel pintaba la vista vacía en vez del formulario.
