# Estándares de Desarrollo - Cliente PIEZAS YA

## 🎯 **ESTÁNDARES OBLIGATORIOS**

Todas las nuevas funcionalidades y formularios del cliente DEBEN implementar estos tres estándares:

### 1. **🌙 TEMA CLARO/OSCURO** ✅
**Hook requerido:** `useTheme`
```typescript
import { useTheme } from '../contexts/ThemeContext';

const { isDark } = useTheme();
```

**Implementación obligatoria:**
- **Fondos:** `bg-white` / `bg-gray-800`
- **Textos:** `text-gray-900` / `text-white`
- **Bordes:** `border-gray-300` / `border-gray-600`
- **Inputs:** `bg-white` / `bg-gray-700`

**Ejemplo:**
```typescript
className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
```

### 2. **🌍 SISTEMA DE TRADUCCIONES** ✅
**Hook requerido:** `useLanguage`
```typescript
import { useLanguage } from '../contexts/LanguageContext';

const { t } = useLanguage();
```

**Implementación obligatoria:**
- **NUNCA** usar textos estáticos
- **SIEMPRE** usar `t('clave.traduccion')`
- **Agregar** traducciones al archivo `src/utils/translations.ts`

**Ejemplo:**
```typescript
// ❌ INCORRECTO
<h1>Mis Pedidos</h1>

// ✅ CORRECTO
<h1>{t('orders.title')}</h1>
```

### 3. **🎨 PALETA DE COLORES CORPORATIVOS** ✅
**Colores principales:**
- **Amarillo corporativo:** `#FFC300`
- **Azul corporativo:** `#0066CC`
- **Verde éxito:** `#10B981`
- **Rojo error:** `#EF4444`

**Implementación obligatoria:**
- **Focus rings:** `focus:ring-[#FFC300]`
- **Botones principales:** `bg-[#FFC300] text-black`
- **Enlaces hover:** `hover:text-[#FFC300]`
- **Bordes activos:** `border-[#FFC300]`

**Ejemplo:**
```typescript
className="focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
```

## 📋 **CHECKLIST OBLIGATORIO**

### **Antes de implementar cualquier funcionalidad:**

- [ ] **Importar hooks:** `useTheme` y `useLanguage`
- [ ] **Usar variables:** `isDark` y `t()` en todo el componente
- [ ] **Aplicar colores corporativos:** `#FFC300` para elementos principales
- [ ] **Agregar traducciones:** Al archivo `src/utils/translations.ts`
- [ ] **Probar ambos temas:** Claro y oscuro
- [ ] **Probar idiomas:** Español, Inglés, Portugués

### **Estructura de traducciones:**
```typescript
// En src/utils/translations.ts
'seccion.clave': {
  es: 'Texto en español',
  en: 'Text in English',
  pt: 'Texto em português'
}
```

## 🔧 **IMPLEMENTACIÓN CORRECTA**

### **Ejemplo de componente estándar:**
```typescript
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const MiComponente: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {t('miComponente.titulo')}
      </h1>
      
      <button className="bg-[#FFC300] text-black px-4 py-2 rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-[#FFC300]">
        {t('miComponente.boton')}
      </button>
    </div>
  );
};
```

## 🎨 **CLASES CSS ESTÁNDAR**

### **Contenedores:**
```typescript
// Contenedor principal
className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}

// Contenedor secundario
className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}
```

### **Textos:**
```typescript
// Título principal
className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}

// Texto secundario
className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}

// Texto pequeño
className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
```

### **Inputs:**
```typescript
className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
  isDark 
    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
}`}
```

### **Botones:**
```typescript
// Botón principal
className="bg-[#FFC300] text-black px-4 py-2 rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-[#FFC300]"

// Botón secundario
className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] ${
  isDark 
    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
}`}
```

## 🚨 **ERRORES COMUNES A EVITAR**

### **❌ NO HACER:**
```typescript
// Textos estáticos
<h1>Mi Título</h1>

// Sin tema oscuro
className="bg-white text-black"

// Sin colores corporativos
className="focus:ring-blue-500"
```

### **✅ HACER:**
```typescript
// Con traducciones
<h1>{t('miComponente.titulo')}</h1>

// Con tema oscuro
className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}

// Con colores corporativos
className="focus:ring-[#FFC300]"
```

## 📝 **DOCUMENTACIÓN REQUERIDA**

Cada nueva funcionalidad debe incluir:

1. **Archivo de documentación** con los cambios realizados
2. **Traducciones agregadas** al archivo de traducciones
3. **Pruebas** en ambos temas e idiomas
4. **Screenshots** de la funcionalidad en ambos temas

## 🎯 **RESULTADO ESPERADO**

Todas las funcionalidades del cliente deben:
- ✅ **Cambiar automáticamente** entre tema claro y oscuro
- ✅ **Traducirse automáticamente** al cambiar idioma
- ✅ **Usar colores corporativos** consistentes
- ✅ **Mantener UX uniforme** en toda la aplicación
- ✅ **Ser accesibles** y responsive

---

**⚠️ IMPORTANTE:** Estos estándares son **OBLIGATORIOS** para todas las nuevas funcionalidades. No se aceptarán componentes que no cumplan con estos requisitos.
