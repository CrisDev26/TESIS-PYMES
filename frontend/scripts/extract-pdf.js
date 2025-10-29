const fs = require('fs');
const path = require('path');
const pdfModule = require('pdf-parse');
const resolvedPdf = (typeof pdfModule === 'function')
  ? pdfModule
  : (pdfModule && typeof pdfModule.default === 'function')
    ? pdfModule.default
    : (pdfModule && pdfModule.default && typeof pdfModule.default.default === 'function')
      ? pdfModule.default.default
      : null;

(async () => {
  try {
    const inputArg = process.argv[2];
    const outputArg = process.argv[3];

    const inputPath = inputArg
      ? path.resolve(process.cwd(), inputArg)
      : path.resolve(__dirname, '..', '..', 'Trabajo Integración Curricular-CORDOVA Y SANCHEZ vfinal.pdf');

    const outputPath = outputArg
      ? path.resolve(process.cwd(), outputArg)
      : path.resolve(__dirname, '..', 'temp', 'documento.txt');

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    if (!fs.existsSync(inputPath)) {
      console.error(`No se encuentra el archivo PDF en: ${inputPath}`);
      process.exit(1);
    }

    const dataBuffer = fs.readFileSync(inputPath);
    if (!resolvedPdf) {
      throw new Error('No se pudo resolver la función de pdf-parse. Prueba con otra versión del paquete.');
    }
    const data = await resolvedPdf(dataBuffer);

    fs.writeFileSync(outputPath, data.text || '', 'utf8');
    console.log(`Texto extraído en: ${outputPath}`);
  } catch (err) {
    console.error('Error extrayendo el PDF:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
