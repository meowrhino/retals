# workers/

Cloudflare Workers para componentes que necesitan estado compartido (counter, guestbook).

ver `ROADMAP.md → Fase 6` para detalles.

cada Worker debe:
- ser self-contained (un archivo)
- documentar cómo desplegarlo con `wrangler deploy`
- documentar cómo el user puede self-hostearlo y configurar el endpoint en su componente
- incluir rate limiting básico
