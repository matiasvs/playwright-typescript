# Tutorial: Integración y Despliegue Continuo (CI/CD) con GitHub Actions y Playwright

Este documento es una guía paso a paso de cómo construimos nuestro circuito automatizado de pruebas de API para el proyecto **Playwright-Gherkin**.

Aquí se detalla cómo usamos ramas en Git para desarrollar nuevas funcionalidades de forma segura (pruebas de los endpoints de `USER`) y cómo configuramos **GitHub Actions** para integrar y publicar esos reportes en la web usando **GitHub Pages**.

---

## 1. Flujo de Trabajo con Ramas (Git Branches)

Para no alterar el código estable en nuestra rama principal (`main`), siempre desarrollamos nuevas pruebas (features) en ramas aisladas.

### Paso a paso del desarrollo:
1. **Crear y moverse a una nueva rama:**
   ```bash
   git checkout -b feature-user
   ```
   *(Este comando crea la rama y te cambia a ella inmediatamente).*

2. **Programar los tests:**
   Aquí es donde codificamos el archivo `tests/user.spec.ts` para probar los 8 endpoints del *Tag User* de Swagger Petstore (POST, GET, PUT, DELETE). También agregamos un script especial en `package.json` para correr solo esta suite: `"test:api-USER": "yarn playwright test tests/user.spec.ts"`.

3. **Verificar que las pruebas pasen localmente:**
   ```bash
   yarn test:api-USER
   ```

4. **Subir la rama a GitHub:**
   ```bash
   git add .
   git commit -m "Añadir pruebas para el endpoint USER"
   git push origin feature-user
   ```

5. **Mezclar código (Integración):**
   Una vez en GitHub, desde la página web, hicimos clic en el botón verde **"Compare & pull request"**. Esto permite que el equipo revise el código antes de fusionarlo (*Merge*) oficialmente con la rama `main`.

---

## 2. Integración Continua (CI) con GitHub Actions

La Integración Continua (CI) es el proceso de correr nuestras pruebas automáticamente cada vez que alguien intenta unir código nuevo a la rama `main`. Esto evita que código roto dañe el proyecto.

Para esto, creamos el archivo de configuración `.github/workflows/playwright.yml`.

### Explicación del bloque CI:
```yaml
name: Playwright API Tests CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```
> **¿Qué hace?** Le dice a GitHub: *"Cada vez que alguien haga un push directo a `main` o intente hacer un Pull Request hacia `main`, despierta a este bot"*.


```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'yarn'
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium
    - name: Run Playwright tests
      run: yarn playwright test
```
> **¿Qué hace?** Son las instrucciones paso a paso para el servidor en la nube de GitHub: 
> 1. Descarga el código.
> 2. Instala Node.js.
> 3. Instala las dependencias y navegadores.
> 4. **Completamente invisible para ti, corre `yarn playwright test`.** Si un solo *expect()* falla, el flujo se detiene y marca una **X** roja, cancelando la integración.

---

## 3. Despliegue Continuo (CD) con GitHub Pages

El Despliegue Continuo (CD) es el paso final. Una vez que la Integración Continua (CI) verificó que todos los tests pasaron (✅ verde), el CD toma ese código o resultado final y lo pone "en vivo" para que los usuarios (o tu equipo de Quality Assurance) puedan verlo al instante.

Nosotros usamos la librería `peaceiris/actions-gh-pages` para publicar el reporte HTML de Playwright en la nube de GitHub Pages.

### Explicación del bloque CD:

Primero, tuvimos que darle permisos al bot para que pudiera escribir en nuestro repositorio y crear la rama `gh-pages`:
```yaml
permissions:
  contents: write
```

Luego, añadimos los últimos dos pasos a nuestro `.github/workflows/playwright.yml`:

```yaml
    - name: Deploy report to GitHub Pages
      if: github.ref == 'refs/heads/main' && always()
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./playwright-report
```
> **¿Qué hace?** 
> 1. Si los tests terminaron de correr y estamos empujando a la rama `main`, este bloque intercepta la carpeta interna de Playwright llamada `./playwright-report` (donde está el `index.html`).
> 2. Crea de forma invisible una rama especial en tu repositorio llamada **`gh-pages`**.
> 3. Empuja (*push*) únicamente el reporte a esa rama.

### Cómo visualizar el Repo en GitHub Pages
Para que el reporte sea visible en el navegador (en tu caso: `https://matiasvs.github.io/playwright-typescript/`), tuvimos que activar GitHub Pages manualmente la primera vez:
1. Ir a **Settings > Pages**.
2. Bajo *Source*, seleccionar **Deploy from a branch**.
3. Asegurarnos que la rama seleccionada sea explícitamente **`gh-pages`**.
4. ¡Listo! A partir de ese momento, cada vez que hagas un *push* a `main`, la página web completa se actualizará sola con los últimos reportes de pruebas sin que tengas que descargar archivos adjuntos.
