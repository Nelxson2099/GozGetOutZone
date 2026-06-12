# PROJECT.md — Estado del Proyecto Equilibrium

> Documento vivo. Actualizado con cada release o sprint.

---

## 📊 Estado Actual: v1.0.0 — STABLE ✅

**Última actualización:** 2026-05-14
**Ambiente:** Electron 33 + React 18 + Vite 6 + SQLite (better-sqlite3)
**Gestor de paquetes:** pnpm 11

---

## ✅ Features Implementadas (v1.0)

### Core
- [x] Arquitectura Electron + Vite + React (frameless window)
- [x] Base de datos SQLite local con WAL mode y foreign keys
- [x] Esquema: `zones`, `sentiments`, `activities` con seeds automáticos
- [x] API IPC completa (8 canales: CRUD + stats + insights + window controls)
- [x] Preload con `contextBridge` (seguridad máxima, no `nodeIntegration`)

### UI / UX
- [x] TitleBar custom con drag region y controles de ventana
- [x] Sidebar con navegación y live stats por zona
- [x] Dashboard: Radar Chart (Chart.js), recent activity, stat cards
- [x] Timeline con filtros por zona, expandir detalles, eliminar
- [x] InsightsPanel: Score de Equilibrio (gauge SVG) + recomendaciones
- [x] ActivityModal 2-pasos: selección de zona → formulario dinámico
- [x] FAB con animación de rotación hover
- [x] InsightBanner conductual en Dashboard
- [x] Demo mode (funciona en navegador sin Electron)

### Diseño
- [x] Dark mode por defecto (forzado vía `nativeTheme`)
- [x] Glassmorphism + grid background
- [x] Paleta por zona: comfort/fear/learning/growth tokens
- [x] Animaciones: slide-up, fade-in, pulse, glow
- [x] Google Fonts: Outfit (display) + Inter (body)
- [x] Custom scrollbar, inputs, range slider

### Documentación
- [x] README.md completo (stack, schema, IPC API, arquitectura)
- [x] SOUL.md (filosofía y visión)
- [x] PROJECT.md (este archivo)
- [x] Launcher .vbs silencioso
- [x] Guía HTML "de 0 a 100"

---

## 🔄 Roadmap

### v1.1 — Polish & Export
- [ ] Exportar actividades a CSV
- [ ] Exportar Timeline a PDF
- [ ] Editar actividades existentes
- [ ] Filtro de fechas en Timeline

### v1.2 — Notificaciones
- [ ] Notificación de sistema si llevas 3+ días sin actividad en una zona
- [ ] Recordatorio diario configurable (hora personalizable)
- [ ] Tray icon con acceso rápido

### v1.3 — Retos
- [ ] Sistema de "Reto Semanal" sugerido por zona
- [ ] Rachas (streaks) por zona
- [ ] Historial de scores de equilibrio a lo largo del tiempo

### v2.0 — Sincronización (Opcional)
- [ ] Backup automático a archivo local (JSON export)
- [ ] Sincronización end-to-end encrypted (opcional, opt-in)
- [ ] Multi-perfil (soporte para varios usuarios en misma máquina)
- [ ] Auto-updater via GitHub Releases

---

## 🐛 Issues Conocidos

| # | Descripción | Prioridad | Estado |
|---|-------------|-----------|--------|
| - | - | - | - |

---

## 📐 Decisiones de Arquitectura

### ¿Por qué `better-sqlite3` vs. `electron-store`?
`better-sqlite3` ofrece SQL completo con JOINs, índices y transacciones. `electron-store` es solo JSON. Para datos relacionales con múltiples entidades (zonas, sentimientos, actividades), SQLite es la elección correcta.

### ¿Por qué ventana frameless?
Una app de productividad personal debe sentirse como software nativo premium, no como un sitio web dentro de una ventana. El titlebar personalizado elimina la barra de sistema genérica y refuerza la identidad de marca.

### ¿Por qué `contextIsolation: true` y no `nodeIntegration`?
Máxima seguridad. El renderer (React) nunca tiene acceso directo a Node.js. Todo pasa por el `contextBridge` en `preload.js`, siguiendo las mejores prácticas de Electron 2026.

---

*Mantenido por Nelxson2099 · Powered by Antigravity AI*
