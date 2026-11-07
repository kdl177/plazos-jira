# Codegeist 2026: lo que falta y quién lo hace

App: `Apps/plazos-jira` (Plazos: court deadlines for Jira). Categoría: Apps for Specialized Industries. Premio extra al que optamos: Best Agents (Rovo), 1.500 $. Primer premio por categoría 15.000 $, segundo 8.000 $, tercero 5.000 $.

Fechas (hora de Málaga): entrega hasta el 22 de diciembre de 2026 a las 21:00. Jurado del 5 de enero al 3 de febrero de 2027. Ganadores hacia el 15 de febrero de 2027. Hay 1.809 participantes apuntados a 5 de noviembre.

## Lo que haces tú (cuentas a tu nombre)

1. Cuenta de Atlassian y sitio de desarrollo gratuito: https://go.atlassian.com/cloud-dev (elige Jira; tarda unos minutos en crearse).
2. Token de API de Atlassian: https://id.atlassian.com/manage-profile/security/api-tokens → "Create API token". No me lo pases: lo usas tú en el paso 3.
3. En `Apps/plazos-jira`, ejecuta `pnpm exec forge login` y pega tu email y el token. Queda guardado en tu equipo y a partir de ahí yo puedo registrar, desplegar e instalar la app.
4. Cuenta en Devpost y apúntate al hackathon: https://codegeist2026.devpost.com/ (botón Join hackathon).
5. Cuando la app esté desplegada: grabar o aprobar el vídeo (menos de 5 minutos, en YouTube público; el guion lo escribo yo) y pulsar Submit en Devpost con los textos que te dejo preparados.

## Lo que hago yo

- App completa: motor de plazos con 11 pruebas, panel, ajustes de festivos, agente Rovo y aviso diario. Hecho el 5 de noviembre; falta probarla en un sitio real (necesita el paso 3).
- Registro, despliegue e instalación en tu sitio de desarrollo, y el enlace de instalación para el jurado (Distribute → Start sharing).
- Datos de demostración en el sitio: un proyecto "Despacho demo" con expedientes y plazos en los tres estados (vencido, a pocos días, confirmado).
- Guion del vídeo y textos de la entrega (descripción, cómo cumple el requisito, categoría, premio extra).
- Si da tiempo: publicar en el Marketplace (otro premio extra de 1.500 $; exige revisión de Atlassian, que tarda semanas, por eso va al final).

## Riesgos conocidos

- Rovo tiene que estar activado en el sitio del jurado para probar el agente. En los sitios de desarrollo viene incluido; en el texto de la entrega se explica que el resto de la app funciona sin Rovo.
- `forge lint` y el id de la app solo se pueden comprobar con sesión iniciada (paso 3). Hasta entonces el manifest tiene `REPLACE-WITH-FORGE-REGISTER`. Node se actualizó a 24.22.1 el 7 de noviembre para poder usar la CLI 15.
- La UI usa UI Kit (sin bundler propio). Si algún componente no se comporta como en la documentación, se ajusta al probar en el sitio.
