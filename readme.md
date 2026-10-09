# Introducción a la Inteligencia Artificial

Presentación (conferencia) **"Introducción a la Inteligencia Artificial — El futuro ya está aquí"**, por **Joel Ibaceta**.

Deck de **24 diapositivas** construido con [reveal.js](https://revealjs.com), con sistema de diseño propio (tipografía Archivo/Manrope, títulos a dos tonos, estética limpia) e imágenes incluidas.

## ▶️ Cómo levantar la presentación

**Opción A — la más simple:** abre `index.html` en tu navegador (doble clic).

**Opción B — recomendada (servidor local):**

```bash
python3 -m http.server 8080
# luego abre:  http://localhost:8080
```

> Requiere **conexión a internet**: reveal.js y las fuentes (Archivo/Manrope) se cargan desde CDN.
> Las **imágenes son locales** (`assets/img/`), así que no dependen de nada externo.

### Navegación
| Tecla | Acción |
|---|---|
| `←` `→` / `Espacio` | Anterior / siguiente |
| `F` | Pantalla completa |
| `Esc` | Vista general (todas las slides) |
| `S` | Notas del orador (si aplica) |

## 📁 Estructura

```
index.html                 Deck (24 slides)
css/theme.css              Sistema de diseño
assets/img/                Imágenes de cada slide
assets/prompts/            Prompt maestro de estilo (consistencia)
guion-boceto.txt           Guion de la conferencia
output/                    Exports: PDF y PPTX
```

## 📄 Exports

En `output/` están las versiones ya generadas:
- `output/pdf/…pdf` — presentación en PDF
- `output/pptx/…pptx` — presentación en PowerPoint

---

*No se necesita instalar nada más: con un navegador y conexión a internet, la presentación corre tal cual.*
