# Instrucciones para Importar Datos

Este documento explica cómo importar datos desde Google Sheets o archivos CSV a las colecciones de MongoDB.

## Opciones de Importación

### 1. Importación desde Google Sheets (Recomendado)

Para usar esta opción, necesitas:

1. **Configurar Google Sheets API**:
   - Crear un proyecto en Google Cloud Console
   - Habilitar Google Sheets API
   - Crear credenciales de servicio
   - Descargar el archivo JSON de credenciales como `google-credentials.json` en la carpeta `backend/`

2. **Ejecutar el script**:
   ```bash
   npm run import-sheets <SPREADSHEET_ID>
   ```

   Ejemplo:
   ```bash
   npm run import-sheets 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

### 2. Importación desde archivos CSV (Más simple)

Esta opción es más directa y no requiere configuración de API.

1. **Preparar archivos CSV**:
   - Exportar los datos del Google Sheet como CSV
   - Asegurarse de que tengan los encabezados correctos

2. **Ejecutar el script**:
   ```bash
   npm run import-csv [categories.csv] [brands.csv] [subcategories.csv]
   ```

   Ejemplos:
   ```bash
   # Importar solo categorías
   npm run import-csv categories.csv
   
   # Importar categorías y marcas
   npm run import-csv categories.csv brands.csv
   
   # Importar todo
   npm run import-csv categories.csv brands.csv subcategories.csv
   ```

## Formato de los Archivos CSV

### Categorías (categories.csv)
```csv
name,description,vehicleType,order,icon
Motor,Componentes del motor del vehículo,car,1,engine
Transmisión,Sistema de transmisión y embrague,car,2,transmission
```

### Marcas (brands.csv)
```csv
name,description,vehicleType,order,country,website,logo
Toyota,Fabricante japonés de automóviles,car,1,Japón,https://www.toyota.com,toyota-logo.png
Honda,Fabricante japonés de automóviles,car,2,Japón,https://www.honda.com,honda-logo.png
```

### Subcategorías (subcategories.csv)
```csv
name,description,categoryName,vehicleType,order,icon,image
Pistones,Pistones y anillos del motor,Motor,car,1,piston,pistons.jpg
Válvulas,Válvulas de admisión y escape,Motor,car,2,valve,valves.jpg
```

**Nota importante**: En el archivo de subcategorías, la columna `categoryName` debe coincidir exactamente con el nombre de una categoría existente.

## Scripts Disponibles

- `npm run seed`: Ejecuta el script de datos de ejemplo
- `npm run import-sheets <ID>`: Importa desde Google Sheets
- `npm run import-csv [archivos]`: Importa desde archivos CSV

## Archivos de Ejemplo

En la carpeta `backend/` encontrarás archivos de ejemplo:
- `example-categories.csv`
- `example-brands.csv`
- `example-subcategories.csv`

Puedes usar estos archivos como referencia para crear tus propios archivos CSV.

## Solución de Problemas

### Error: "No se pudieron mapear subcategorías"
Esto significa que algunos nombres de categorías en el archivo de subcategorías no coinciden con los nombres en el archivo de categorías. Verifica que los nombres coincidan exactamente.

### Error: "No se pudo conectar a la base de datos"
Verifica que:
1. El archivo `.env` esté configurado correctamente
2. MongoDB esté ejecutándose
3. La URI de conexión sea válida

### Error: "Archivo no encontrado"
Verifica que:
1. Los archivos CSV existan en la ruta especificada
2. Los nombres de archivo sean correctos
3. Tengas permisos de lectura en los archivos 