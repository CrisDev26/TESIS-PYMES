# Assets Directory

Esta carpeta contiene todos los archivos estáticos del proyecto.

## Estructura de carpetas:

```
src/assets/
├── images/           # Imágenes e ilustraciones
│   ├── login-illustration.svg     # Ilustración para el panel izquierdo
│   ├── register-illustration.svg  # Ilustración para el panel derecho
│   ├── logo.png                   # Logo de la empresa
│   └── backgrounds/               # Imágenes de fondo
├── icons/            # Iconos personalizados
└── fonts/            # Fuentes personalizadas (si las hay)
```

## Cómo usar las imágenes:

En los componentes Angular, las imágenes se referencian con la ruta:
```html
<img src="assets/images/nombre-imagen.ext" alt="descripción">
```

## Formatos recomendados:

- **SVG**: Para iconos e ilustraciones (escalables)
- **PNG**: Para imágenes con transparencia
- **JPG**: Para fotografías
- **WebP**: Para mejor optimización (navegadores modernos)

## Ejemplos de uso:

```html
<!-- Logo -->
<img src="assets/images/logo.png" alt="Logo PYMES">

<!-- Ilustración -->
<img src="assets/images/login-illustration.svg" alt="Ilustración de login">

<!-- Ícono -->
<img src="assets/icons/dashboard.svg" alt="Dashboard">
```