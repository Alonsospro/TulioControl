# Tulio Control

Aplicación web ligera para llevar un control personal de ingresos y gastos en bolivianos (BOB). Los movimientos se guardan en el almacenamiento local del navegador.

## Uso

Abre `index.html` en un navegador moderno. No requiere instalación ni dependencias.

- Registra ingresos y gastos con descripción, monto, categoría y fecha.
- Consulta el balance acumulado y los totales del mes actual.
- Busca, filtra y elimina movimientos.
- Los datos permanecen en el navegador donde fueron registrados.

## Archivos

- `index.html`: estructura de la aplicación.
- `styles.css`: estilos adaptable a escritorio y móvil.
- `app.js`: cálculos y persistencia local.

## Privacidad

Los datos se guardan en `localStorage` del navegador y no se envían a un servidor. Borrar los datos del sitio o cambiar de navegador elimina o separa esos registros.
