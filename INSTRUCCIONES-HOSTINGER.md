# INSTRUCCIONES PARA SUBIR A HOSTINGER (Solo hosting compartido)

## PASO 1: Crear un ZIP del proyecto
1. Selecciona TODOS los archivos del proyecto EXCEPTO:
   - node_modules/
   - .next/
   - .git/
   - .env*
   
2. Comprime en un archivo ZIP llamado "inegol.zip"

## PASO 2: Subir via File Manager
1. Entra al hPanel de Hostinger
2. Ve a "File Manager"
3. Navega a /public_html/
4. Sube el archivo inegol.zip
5. Extrae el contenido del ZIP
6. Elimina el archivo ZIP

## PASO 3: Configurar la base de datos
1. Ve a "MySQL Databases" en hPanel
2. Crea una nueva base de datos
3. Anota: nombre_db, usuario, contraseña, host

## PASO 4: Editar .env.production
Edita el archivo con los datos reales de tu base de datos

## PASO 5: Instalar dependencias (si tienes SSH)
ssh tu_usuario@tu_servidor
cd public_html
npm install
npm run build

## LIMITACIONES:
- No podrás usar las APIs (/api/*)
- No funcionará la base de datos
- Solo será un sitio estático

## RECOMENDACIÓN:
Usa Vercel o Netlify - son GRATUITOS y compatibles con tu proyecto
