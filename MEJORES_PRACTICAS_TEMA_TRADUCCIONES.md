# Mejores Prácticas: Tema Claro/Oscuro y Traducciones en Módulos Administrativos

## 🎯 Objetivo
Asegurar que todos los módulos administrativos implementen correctamente:
1. **Sistema de tema claro/oscuro** con transiciones suaves
2. **Sistema de traducciones** en múltiples idiomas (Español, Inglés, Portugués)
3. **Consistencia visual** y de experiencia de usuario

## 📋 Checklist Obligatorio para Nuevos Módulos

### ✅ 1. Imports Requeridos
```typescript
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext'; // Si existe
```

### ✅ 2. Hook de Traducciones
```typescript
const { t, currentLanguage, updateTrigger } = useLanguage();
```

### ✅ 3. Clases CSS para Tema Claro/Oscuro
```typescript
// Textos
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-300"
className="text-gray-500 dark:text-gray-400"

// Fondos
className="bg-white dark:bg-[#333333]"
className="bg-gray-50 dark:bg-[#2a2a2a]"
className="bg-gray-100 dark:bg-[#444444]"

// Bordes
className="border-gray-200 dark:border-gray-700"
className="border-gray-300 dark:border-gray-600"

// Estados hover/focus
className="hover:bg-gray-50 dark:hover:bg-[#444444]"
className="focus:ring-[#FFC300] focus:border-[#FFC300]"
```

### ✅ 4. Estructura de Traducciones
Todas las traducciones deben seguir este patrón en `src/utils/translations.ts`:

```typescript
'moduleName.section.element': {
  es: 'Texto en Español',
  en: 'Text in English',
  pt: 'Texto em Português'
},
```

### ✅ 5. Nomenclatura de Claves de Traducción
```
{modulo}.{seccion}.{elemento}
Ejemplos:
- 'admin.users.title'
- 'storeManager.products.createButton'
- 'delivery.orders.status'
```

## 🔧 Implementación Paso a Paso

### Paso 1: Crear el Componente Base
```typescript
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MiModuloProps {
  // props aquí
}

const MiModulo: React.FC<MiModuloProps> = ({ /* props */ }) => {
  const { t, currentLanguage } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#333333]">
      <div className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('miModulo.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('miModulo.description')}
          </p>
        </div>
      </div>
      
      <div className="p-6">
        {/* Contenido del módulo */}
      </div>
    </div>
  );
};

export default MiModulo;
```

### Paso 2: Agregar Traducciones
En `src/utils/translations.ts`:
```typescript
'miModulo.title': {
  es: 'Mi Módulo',
  en: 'My Module',
  pt: 'Meu Módulo'
},
'miModulo.description': {
  es: 'Descripción del módulo',
  en: 'Module description',
  pt: 'Descrição do módulo'
},
'miModulo.actions.create': {
  es: 'Crear Nuevo',
  en: 'Create New',
  pt: 'Criar Novo'
},
'miModulo.actions.edit': {
  es: 'Editar',
  en: 'Edit',
  pt: 'Editar'
},
'miModulo.actions.delete': {
  es: 'Eliminar',
  en: 'Delete',
  pt: 'Excluir'
},
```

### Paso 3: Componentes Reutilizables
Crear componentes base que ya incluyan tema y traducciones:

```typescript
// components/ui/AdminCard.tsx
interface AdminCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
```

## 🎨 Paleta de Colores para Tema Claro/Oscuro

### Colores Principales
- **Primario**: `#FFC300` (amarillo)
- **Texto principal**: `text-gray-900 dark:text-white`
- **Texto secundario**: `text-gray-600 dark:text-gray-300`
- **Texto terciario**: `text-gray-500 dark:text-gray-400`

### Fondos
- **Fondo principal**: `bg-gray-50 dark:bg-[#333333]`
- **Fondo de tarjetas**: `bg-white dark:bg-[#333333]`
- **Fondo secundario**: `bg-gray-100 dark:bg-[#444444]`

### Estados
- **Hover**: `hover:bg-gray-50 dark:hover:bg-[#444444]`
- **Focus**: `focus:ring-[#FFC300] focus:border-[#FFC300]`
- **Activo**: `bg-[#FFC300] bg-opacity-20 text-[#333333]`

## 📝 Ejemplos de Implementación

### Botón con Tema y Traducción
```typescript
<button className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors font-medium">
  {t('miModulo.actions.save')}
</button>
```

### Input con Tema
```typescript
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#444444] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-[#FFC300] focus:border-[#FFC300]"
  placeholder={t('miModulo.form.namePlaceholder')}
/>
```

### Tabla con Tema
```typescript
<table className="w-full bg-white dark:bg-[#333333] rounded-lg overflow-hidden">
  <thead className="bg-gray-50 dark:bg-[#444444]">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {t('miModulo.table.headers.name')}
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    {/* Filas */}
  </tbody>
</table>
```

## 🔍 Verificación de Implementación

### Checklist de Verificación
- [ ] Todos los textos usan `t('clave.traduccion')`
- [ ] Todas las clases CSS incluyen variantes `dark:`
- [ ] Los colores siguen la paleta definida
- [ ] Las transiciones son suaves (`transition-colors`)
- [ ] Los estados hover/focus están implementados
- [ ] Las traducciones están agregadas al archivo `translations.ts`

### Comandos de Verificación
```bash
# Buscar textos hardcodeados
grep -r "className.*text-" src/components/ --include="*.tsx" | grep -v "dark:"

# Buscar textos sin traducción
grep -r ">[A-Z][a-z]" src/components/ --include="*.tsx" | grep -v "t("
```

## 🚀 Beneficios de esta Implementación

1. **Consistencia Visual**: Todos los módulos se ven y se comportan igual
2. **Accesibilidad**: Soporte completo para temas claro/oscuro
3. **Internacionalización**: Fácil cambio entre idiomas
4. **Mantenibilidad**: Código organizado y reutilizable
5. **Experiencia de Usuario**: Transiciones suaves y estados claros

## 📚 Recursos Adicionales

- [Contexto de Idioma](../contexts/LanguageContext.tsx)
- [Contexto de Tema](../contexts/ThemeContext.tsx)
- [Archivo de Traducciones](../utils/translations.ts)
- [Componentes Base](../components/ui/)

---

**Nota**: Este documento debe ser consultado cada vez que se desarrolle un nuevo módulo administrativo para asegurar la consistencia en toda la aplicación.
