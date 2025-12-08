# Guía de Pruebas - AbsenceHub

## 🚀 Inicio de la Aplicación

### Backend
```bash
cd AbsenceHub/backend
python run.py
```
**URL**: http://localhost:5000/api

### Frontend
```bash
cd AbsenceHub/frontend
npm run dev
```
**URL**: http://localhost:5173/

---

## ✅ Escenarios de Prueba

### 1. Vista de Lista (📋 Liste)

#### 1.1 Visualización Inicial
- [ ] La aplicación carga en idioma alemán por defecto
- [ ] Se muestra la vista de lista por defecto
- [ ] Las estadísticas aparecen en la parte superior
- [ ] Los filtros están colapsados por defecto
- [ ] La lista de ausencias se muestra ordenada por fecha de actualización

#### 1.2 Filtros Colapsables
- [ ] Click en "Filter +" expande los filtros
- [ ] Click en "Filter −" colapsa los filtros
- [ ] Los valores de filtros se mantienen al colapsar/expandir

#### 1.3 Búsqueda LIKE por Service Account
**Pasos**:
1. Expandir filtros
2. En "Service Account" escribir: `max`
3. Click en "Filtern"

**Resultado esperado**: Solo aparece "s.max.mueller"

#### 1.4 Búsqueda LIKE por Nombre de Empleado
**Pasos**:
1. Expandir filtros
2. En "Mitarbeitername" escribir: `schmidt`
3. Click en "Filtern"

**Resultado esperado**: Solo aparece "Anna Schmidt"

#### 1.5 Filtro por Tipo de Ausencia
**Pasos**:
1. Expandir filtros
2. Seleccionar "Krankheit"
3. Click en "Filtern"

**Resultado esperado**: Solo ausencias de tipo "Krankheit"

#### 1.6 Filtro por Mes
**Pasos**:
1. Expandir filtros
2. Seleccionar modo "Monat"
3. Seleccionar "2025-02"
4. Click en "Filtern"

**Resultado esperado**: Solo ausencias que ocurren en febrero 2025

#### 1.7 Filtro por Rango de Fechas
**Pasos**:
1. Expandir filtros
2. Seleccionar modo "Datumsbereich"
3. Startdatum: "2025-01-01"
4. Enddatum: "2025-02-28"
5. Click en "Filtern"

**Resultado esperado**: Solo ausencias en enero y febrero 2025

#### 1.8 Limpiar Filtros
**Pasos**:
1. Aplicar cualquier filtro
2. Click en "Filter löschen"

**Resultado esperado**: Todos los filtros se resetean y se muestran todas las ausencias

#### 1.9 Crear Nueva Ausencia
**Pasos**:
1. Click en "+ Hinzufügen"
2. Llenar formulario:
   - Service Account: `s.test.user`
   - Nombre: `Test User`
   - Tipo: `Urlaub`
   - Fecha inicio: Fecha futura
   - Fecha fin: Fecha futura + 3 días
3. Click en "Speichern"

**Resultado esperado**:
- Mensaje de éxito verde
- Nueva ausencia aparece en la lista
- Fila resaltada con fondo azul y texto en negrita
- Resaltado desaparece después de 5 segundos

#### 1.10 Editar Ausencia
**Pasos**:
1. Click en "Bearbeiten" en cualquier ausencia
2. Cambiar el nombre del empleado
3. Click en "Speichern"

**Resultado esperado**:
- Mensaje de éxito
- Cambios reflejados en la lista
- Fila resaltada temporalmente

#### 1.11 Eliminar Ausencia
**Pasos**:
1. Click en "Löschen" en cualquier ausencia
2. Confirmar eliminación

**Resultado esperado**:
- Mensaje de éxito
- Ausencia eliminada de la lista

---

### 2. Vista de Calendario (📅 Kalender)

#### 2.1 Navegación al Calendario
**Pasos**:
1. Click en "📅 Kalender"

**Resultado esperado**:
- Vista cambia a calendario mensual
- Botón "Kalender" está activo (azul)
- Se muestra el mes actual
- Los días están organizados en cuadrícula

#### 2.2 Visualización de Ausencias
**Pasos**:
1. En vista de calendario
2. Buscar días con ausencias

**Resultado esperado**:
- Ausencias aparecen como bloques coloreados
- Color coincide con el tipo de ausencia
- Se muestra el nombre del empleado truncado

#### 2.3 Tooltip al Pasar el Mouse
**Pasos**:
1. Pasar el mouse sobre un bloque de ausencia

**Resultado esperado**:
- Aparece tooltip con:
  - Nombre completo del empleado
  - Service account
  - Tipo de ausencia con color
  - Rango de fechas
- Tooltip sigue el cursor

#### 2.4 Navegación entre Meses
**Pasos**:
1. Click en "◀" (mes anterior)
2. Verificar que cambia el mes
3. Click en "▶" (mes siguiente)
4. Verificar que cambia el mes
5. Click en "Heute"

**Resultado esperado**:
- Mes cambia correctamente
- Botón "Heute" vuelve al mes actual
- Día actual está resaltado en azul

#### 2.5 Leyenda de Colores
**Pasos**:
1. Verificar la leyenda en la parte inferior

**Resultado esperado**:
- Muestra todos los tipos de ausencia activos
- Cada uno con su color correspondiente
- Nombres en alemán

#### 2.6 Ausencias que Abarcan Varios Días
**Pasos**:
1. Crear una ausencia de 5 días
2. Ver en calendario

**Resultado esperado**:
- Ausencia aparece en todos los días del rango
- Mismo color y empleado en cada día

---

### 3. Vista de Configuración (⚙️ Einstellungen)

#### 3.1 Navegación a Configuración
**Pasos**:
1. Click en "⚙️ Einstellungen"

**Resultado esperado**:
- Vista cambia a página de configuración
- Botón "Einstellungen" está activo (azul)
- Tabla con tipos de ausencia existentes
- Botón "+ Neuer Typ"

#### 3.2 Visualización de Tipos Existentes
**Pasos**:
1. Revisar la tabla de tipos

**Resultado esperado**:
- Se muestran al menos 4 tipos predeterminados:
  - Urlaub (verde)
  - Krankheit (rojo)
  - Home Office (azul)
  - Sonstige (morado)
- Cada tipo muestra: color, nombre, alemán, inglés, estado
- Todos marcados como "Aktiv"

#### 3.3 Crear Nuevo Tipo
**Pasos**:
1. Click en "+ Neuer Typ"
2. Llenar formulario:
   - Interner Name: `Weiterbildung`
   - Deutscher Name: `Weiterbildung`
   - Englischer Name: `Training`
   - Color: Seleccionar naranja (#F59E0B)
3. Click en "Speichern"

**Resultado esperado**:
- Modal se cierra
- Mensaje de éxito
- Nuevo tipo aparece en la tabla
- Color se muestra correctamente

#### 3.4 Selector de Color
**Pasos**:
1. Abrir formulario de nuevo tipo
2. Click en el preview de color
3. Verificar opciones de color

**Resultado esperado**:
- Aparece paleta con 10 colores predefinidos
- Input de texto para código hex
- Selector nativo de color del navegador
- Todos funcionan y se sincronizan

#### 3.5 Editar Tipo Existente
**Pasos**:
1. Click en "Bearbeiten" en cualquier tipo
2. Cambiar el nombre alemán
3. Cambiar el color
4. Click en "Speichern"

**Resultado esperado**:
- Mensaje de éxito
- Cambios reflejados en la tabla
- El campo "Interner Name" está deshabilitado (no se puede cambiar)

#### 3.6 Desactivar Tipo
**Pasos**:
1. Click en "Deaktivieren" en cualquier tipo
2. Click en "Bestätigen"

**Resultado esperado**:
- Tipo cambia a estado "Inaktiv"
- Fila aparece con opacidad reducida
- Botón "Deaktivieren" ya no aparece

#### 3.7 Mostrar Tipos Inactivos
**Pasos**:
1. Marcar checkbox "Inaktive Typen anzeigen"

**Resultado esperado**:
- Aparecen todos los tipos, incluyendo inactivos
- Tipos inactivos tienen badge gris "Inaktiv"

#### 3.8 Validación de Formulario
**Pasos**:
1. Abrir formulario de nuevo tipo
2. Dejar campos vacíos
3. Click en "Speichern"

**Resultado esperado**:
- Errores de validación aparecen:
  - "Name ist erforderlich"
  - "Deutscher Name ist erforderlich"
  - "Englischer Name ist erforderlich"
- Formulario no se envía

#### 3.9 Color Inválido
**Pasos**:
1. Abrir formulario
2. En input de color escribir: `123456` (sin #)
3. Intentar guardar

**Resultado esperado**:
- Error: "Ungültige Farbe (Format: #RRGGBB)"

#### 3.10 Nombre Duplicado
**Pasos**:
1. Crear nuevo tipo con nombre "Urlaub" (ya existe)
2. Intentar guardar

**Resultado esperado**:
- Error del servidor indicando nombre duplicado

---

### 4. Cambio de Idioma

#### 4.1 Cambiar a Inglés
**Pasos**:
1. Click en selector de idioma en header
2. Seleccionar "EN"

**Resultado esperado**:
- Todos los textos cambian a inglés
- Tipos de ausencia muestran nombres en inglés
- Navegación en inglés
- Preferencia guardada en localStorage

#### 4.2 Persistencia de Idioma
**Pasos**:
1. Cambiar a inglés
2. Recargar la página (F5)

**Resultado esperado**:
- Aplicación sigue en inglés

---

### 5. Pruebas de API Manual

#### 5.1 Listar Tipos Activos
```bash
curl http://localhost:5000/api/absence-types
```

**Resultado esperado**: JSON con tipos activos

#### 5.2 Listar Todos los Tipos
```bash
curl "http://localhost:5000/api/absence-types?active_only=false"
```

**Resultado esperado**: JSON con todos los tipos (activos e inactivos)

#### 5.3 Crear Tipo
```bash
curl -X POST http://localhost:5000/api/absence-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fortbildung",
    "name_de": "Fortbildung",
    "name_en": "Training",
    "color": "#F97316",
    "is_active": true
  }'
```

**Resultado esperado**: JSON con tipo creado, status 201

#### 5.4 Buscar por Nombre (LIKE)
```bash
curl "http://localhost:5000/api/absences?employee_fullname=schmidt"
```

**Resultado esperado**: Solo ausencias con "schmidt" en el nombre

#### 5.5 Filtrar por Mes
```bash
curl "http://localhost:5000/api/absences?month=2025-01"
```

**Resultado esperado**: Solo ausencias en enero 2025

#### 5.6 Filtrar por Año
```bash
curl "http://localhost:5000/api/absences?year=2025"
```

**Resultado esperado**: Solo ausencias en 2025

---

### 6. Pruebas de Integración

#### 6.1 Flujo Completo: Crear Tipo y Usarlo
**Pasos**:
1. Ir a Configuración
2. Crear nuevo tipo "Elternzeit" (azul claro)
3. Volver a Lista
4. Crear nueva ausencia con tipo "Elternzeit"
5. Ir a Calendario
6. Verificar que aparece con el color correcto

**Resultado esperado**: Todo funciona en cadena

#### 6.2 Flujo: Desactivar Tipo y Verificar
**Pasos**:
1. Ir a Configuración
2. Desactivar tipo "Sonstige"
3. Volver a Lista
4. Abrir formulario de nueva ausencia
5. Verificar dropdown de tipos

**Resultado esperado**: "Sonstige" ya no aparece en el dropdown

#### 6.3 Flujo: Editar Color y Ver en Calendario
**Pasos**:
1. Ir a Configuración
2. Cambiar color de "Urlaub" a rojo (#EF4444)
3. Ir a Calendario
4. Buscar ausencias de tipo "Urlaub"

**Resultado esperado**: Bloques aparecen en rojo

---

### 7. Pruebas de Usabilidad

#### 7.1 Accesibilidad de Teclado
**Pasos**:
1. Usar solo Tab para navegar
2. Verificar que todos los elementos son alcanzables
3. Usar Enter/Space para activar botones

**Resultado esperado**: Navegación completa por teclado

#### 7.2 Responsive Design
**Pasos**:
1. Reducir tamaño de ventana del navegador
2. Probar en móvil (DevTools)

**Resultado esperado**:
- Diseño se adapta correctamente
- No hay overflow horizontal
- Botones son clickeables

#### 7.3 Rendimiento con Datos
**Pasos**:
1. Crear 50 ausencias
2. Verificar velocidad de carga
3. Probar filtros

**Resultado esperado**:
- Carga < 2 segundos
- Filtros responden < 100ms

---

## 🐛 Casos Edge

### E.1 Ausencia de 1 Día
**Pasos**:
1. Crear ausencia con start_date = end_date

**Resultado esperado**: Se acepta, aparece correctamente

### E.2 Ausencia muy Larga (3 meses)
**Pasos**:
1. Crear ausencia de 90 días
2. Ver en calendario

**Resultado esperado**: Aparece en todos los días del rango

### E.3 Caracteres Especiales Alemanes
**Pasos**:
1. Crear ausencia con nombre: "Björn Müller"
2. Filtrar por: "björn"

**Resultado esperado**: Encuentra correctamente (case-insensitive)

### E.4 Nombre de Tipo Muy Largo
**Pasos**:
1. Crear tipo con nombre de 50 caracteres

**Resultado esperado**: Se guarda, pero se trunca en UI si es necesario

### E.5 Color Hex en Mayúsculas vs Minúsculas
**Pasos**:
1. Crear tipo con color: `#ABC123`
2. Crear otro con: `#abc123`

**Resultado esperado**: Ambos se guardan y funcionan

---

## 📊 Checklist de Regresión

Después de cada cambio, verificar:

- [ ] Lista de ausencias carga correctamente
- [ ] Filtros funcionan
- [ ] Crear ausencia funciona
- [ ] Editar ausencia funciona
- [ ] Eliminar ausencia funciona
- [ ] Calendario muestra ausencias
- [ ] Configuración de tipos funciona
- [ ] Colores se aplican correctamente
- [ ] Idioma cambia correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

---

## 🔍 Verificación de Logs

### Frontend (Consola del Navegador)
```
F12 > Console
```
**Buscar**: Errores en rojo, warnings

### Backend (Terminal)
```bash
tail -f flask.log
```
**Buscar**: Errores 500, stack traces

---

## ✅ Estado Actual

**Fecha**: 2025-12-06
**Versión**: 2.0
**Estado**: ✅ Todas las características implementadas y probadas

### Características Verificadas
- ✅ Backend corriendo en puerto 5001
- ✅ Frontend corriendo en puerto 5173
- ✅ Tipos de ausencia en base de datos
- ✅ Filtros LIKE funcionando
- ✅ Filtro por mes funcionando
- ✅ Vista de calendario implementada
- ✅ Configuración de tipos implementada
- ✅ Navegación entre vistas funcionando

---

**Nota**: Para reportar bugs o solicitar nuevas características, crear issue en el repositorio.
