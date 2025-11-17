import { cpSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📦 Copiando archivos JS y CSS al dist...');

try {
    // Copiar carpeta js (si existe, ya que algunos pueden estar en el build de Vite)
    const jsSource = join(__dirname, '../frontend/js');
    const jsDest = join(__dirname, '../dist/js');
    if (existsSync(jsSource)) {
        cpSync(jsSource, jsDest, { recursive: true, force: true });
        console.log('✅ Carpeta js copiada');
    }

    // Copiar carpeta css
    const cssSource = join(__dirname, '../frontend/css');
    const cssDest = join(__dirname, '../dist/css');
    if (existsSync(cssSource)) {
        cpSync(cssSource, cssDest, { recursive: true, force: true });
        console.log('✅ Carpeta css copiada');
    }

    // Copiar archivo _redirects para Render (SPA routing)
    const redirectsSource = join(__dirname, '../frontend/_redirects');
    const redirectsDest = join(__dirname, '../dist/_redirects');
    if (existsSync(redirectsSource)) {
        copyFileSync(redirectsSource, redirectsDest);
        console.log('✅ Archivo _redirects copiado');
    }

    console.log('🎉 Assets copiados exitosamente!');
} catch (error) {
    console.error('❌ Error copiando assets:', error);
    process.exit(1);
}
