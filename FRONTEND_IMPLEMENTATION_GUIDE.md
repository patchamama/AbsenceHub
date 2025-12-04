# Frontend Implementation Guide

Este documento proporciona instrucciones detalladas para completar los componentes pendientes del frontend de AbsenceHub.

## Estado Actual ✅

El frontend tiene estructura base completa:
- ✅ Vite + React 18 configurado
- ✅ Tailwind CSS setup
- ✅ API service (absenceApi.js)
- ✅ Validadores (validators.js)
- ✅ i18n sistema (en.json, de.json)
- ✅ App.jsx principal con estadísticas
- ✅ ESLint, Prettier, Vitest configurados

## Pendiente 📋

### 1. Componente: AbsenceForm.jsx

**Ubicación**: `frontend/src/components/AbsenceForm.jsx`

**Descripción**: Formulario para crear y editar ausencias.

**Props**:
```javascript
{
  absence: null | Object,      // null para crear, Object para editar
  absenceTypes: Array,         // Lista de tipos disponibles
  onSubmit: Function,          // (formData) => Promise
  onCancel: Function,          // () => void
  loading: Boolean             // true mientras se procesa
}
```

**Funcionalidad**:
- Modo crear: campos vacíos
- Modo editar: pre-llenar con datos existentes
- Service account deshabilitado en modo editar
- Validación en tiempo real de campos
- Mensajes de error bajo cada campo
- Botones: Enviar, Cancelar, Limpiar
- Manejo de estados: cargando, error, éxito

**Ejemplo de uso**:
```jsx
<AbsenceForm
  absence={null}
  absenceTypes={['Urlaub', 'Krankheit', 'Home Office', 'Sonstige']}
  onSubmit={async (data) => {
    await createAbsence(data)
  }}
  onCancel={() => setShowForm(false)}
  loading={false}
/>
```

### 2. Componente: AbsenceList.jsx

**Ubicación**: `frontend/src/components/AbsenceList.jsx`

**Descripción**: Tabla que muestra lista de ausencias con acciones.

**Props**:
```javascript
{
  absences: Array,           // Lista de ausencias
  onEdit: Function,          // (absence) => void
  onDelete: Function,        // (id) => Promise
  loading: Boolean,
  error: String | null
}
```

**Funcionalidad**:
- Tabla con columnas: service_account, employee_fullname, absence_type, start_date, end_date, actions
- Botones Editar y Eliminar
- Confirmación antes de eliminar
- Datos formateados (fechas localizadas, tipos traducidos)
- Mostrar mensaje si lista está vacía
- Loading state mientras carga
- Error message si hay problema

**Columnas**:
- Service Account (s.john.doe)
- Employee Name (John Doe o "-")
- Type (Vacaciones, Enfermedad, etc.)
- Start Date (formato local)
- End Date (formato local)
- Duration (calculado en días)
- Actions (Edit, Delete buttons)

### 3. Componente: AbsenceFilters.jsx

**Ubicación**: `frontend/src/components/AbsenceFilters.jsx`

**Descripción**: Panel de filtros para buscar ausencias.

**Props**:
```javascript
{
  absenceTypes: Array,       // Tipos disponibles
  onFilter: Function,        // (filters) => void
  onClear: Function,         // () => void
  loading: Boolean
}
```

**Funcionalidad**:
- Input: Service account (búsqueda parcial)
- Select: Absence type (con opción "All")
- Input: Start date (date picker)
- Input: End date (date picker)
- Botones: Apply Filters, Clear Filters
- Filtros opcionales (todos pueden ser vacíos)
- Validación: si end_date < start_date, mostrar error

**Filtros**:
```javascript
{
  service_account: "s.john",    // parcial OK
  absence_type: "Urlaub",       // exacto
  start_date: "2025-01-01",
  end_date: "2025-12-31"
}
```

### 4. Componente: FormField.jsx (Shared)

**Ubicación**: `frontend/src/shared/components/FormField.jsx`

**Descripción**: Campo de formulario reutilizable.

**Props**:
```javascript
{
  label: String,             // "Service Account"
  name: String,              // "service_account"
  type: String,              // "text", "date", "select"
  value: String,
  onChange: Function,        // (e) => void
  error: String | null,      // Mensaje de error
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  options: Array,            // [{value, label}] para select
}
```

**Uso**:
```jsx
<FormField
  label={t('form.serviceAccount')}
  name="service_account"
  type="text"
  value={formData.service_account}
  onChange={handleChange}
  error={errors.service_account}
  placeholder={t('form.serviceAccountPlaceholder')}
  required
/>
```

## Steps para Implementar

### Paso 1: Crear FormField.jsx

```bash
mkdir -p frontend/src/shared/components
touch frontend/src/shared/components/FormField.jsx
```

**Estructura básica**:
- Renderizar label con required indicator (*)
- Renderizar input/select basado en type
- Mostrar error debajo si existe
- Styles con Tailwind CSS
- Accesibilidad: htmlFor, aria-invalid, aria-describedby

### Paso 2: Crear AbsenceForm.jsx

**Estructura**:
1. Estado del formulario (formData, errors, loading)
2. Función validar () - usa validateAbsenceForm
3. Función handleChange() - actualiza formData y limpia error
4. Función handleSubmit() - valida y llama onSubmit
5. Función handleReset() - limpia formulario
6. Renderizar form con FormField para cada campo
7. Botones: Submit, Cancel, Reset

**Campos**:
- service_account (text, requerido, deshabilitado si edita)
- employee_fullname (text, opcional)
- absence_type (select, requerido)
- start_date (date, requerido)
- end_date (date, requerido)

### Paso 3: Crear AbsenceList.jsx

**Estructura**:
1. Props: absences, onEdit, onDelete, loading, error
2. Función handleDelete() con confirmación
3. Función calculateDuration() - días entre fechas
4. Renderizar tabla con datos
5. Manejo de estado vacío
6. Manejo de error
7. Manejo de loading

**Tabla columns**:
```jsx
<table>
  <thead>
    <tr>
      <th>Service Account</th>
      <th>Name</th>
      <th>Type</th>
      <th>Start</th>
      <th>End</th>
      <th>Duration</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {absences.map(absence => (...))}
  </tbody>
</table>
```

### Paso 4: Crear AbsenceFilters.jsx

**Estructura**:
1. Estado de filtros (filterData, errors)
2. Función handleChange()
3. Función handleApply() - valida y llama onFilter
4. Función handleClear() - limpia filtros y llama onClear
5. Validación: start_date <= end_date
6. Renderizar inputs con FormField

**Validación de fechas**:
```javascript
if (filterData.start_date && filterData.end_date) {
  const start = new Date(filterData.start_date)
  const end = new Date(filterData.end_date)
  if (end < start) {
    setErrors({ dateRange: t('error.dateRangeInvalid') })
    return
  }
}
```

### Paso 5: Integrar componentes en App.jsx

Reemplazar el contenido de App.jsx con lógica completa:

```javascript
import { useState, useEffect } from 'react'
import AbsenceForm from './components/AbsenceForm'
import AbsenceList from './components/AbsenceList'
import AbsenceFilters from './components/AbsenceFilters'
import { ... } from './services/absenceApi'

function App() {
  const [absences, setAbsences] = useState([])
  const [absenceTypes, setAbsenceTypes] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState(null)
  const [filters, setFilters] = useState({})

  // Fetch data on mount
  useEffect(() => { ... }, [])

  // Apply filters
  useEffect(() => {
    // Llamar getAllAbsences(filters)
  }, [filters])

  // Handlers
  const handleCreate = async (data) => { ... }
  const handleUpdate = async (id, data) => { ... }
  const handleDelete = async (id) => { ... }
  const handleFilter = (newFilters) => { ... }
  const handleClearFilters = () => { ... }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Filters */}
      {showForm && (
        <AbsenceForm
          absence={editingAbsence}
          absenceTypes={absenceTypes}
          onSubmit={editingAbsence ? handleUpdate : handleCreate}
          onCancel={() => { ... }}
          loading={loading}
        />
      )}
      {/* List */}
      <AbsenceList
        absences={absences}
        onEdit={(absence) => { ... }}
        onDelete={handleDelete}
        loading={loading}
        error={error}
      />
    </div>
  )
}
```

## Escribir Tests

### Test Pattern

```javascript
// src/components/__tests__/AbsenceForm.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AbsenceForm from '../AbsenceForm'

describe('AbsenceForm', () => {
  it('renders form fields', () => {
    const { container } = render(
      <AbsenceForm
        absence={null}
        absenceTypes={['Urlaub']}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    )

    expect(screen.getByLabelText(/service account/i)).toBeInTheDocument()
  })

  it('validates service account format', async () => {
    // ...
  })

  it('calls onSubmit with valid data', async () => {
    // ...
  })
})
```

## Checklist de Implementación

### AbsenceForm
- [ ] Renderiza todos los campos
- [ ] Valida en tiempo real
- [ ] Desactiva service_account en modo editar
- [ ] Muestra errores bajo campos
- [ ] onSubmit funciona
- [ ] onCancel funciona
- [ ] Loading state funciona
- [ ] Tests pasan > 70% coverage

### AbsenceList
- [ ] Renderiza tabla correctamente
- [ ] Muestra datos formateados
- [ ] Botones Edit y Delete funciona
- [ ] Confirmación antes de eliminar
- [ ] Estado vacío (empty state)
- [ ] Estado error
- [ ] Estado loading
- [ ] Tests pasan > 70% coverage

### AbsenceFilters
- [ ] Todos los filtros renderizados
- [ ] onChange funciona para cada campo
- [ ] Validación de fechas
- [ ] onFilter funciona
- [ ] onClear funciona
- [ ] Tests pasan > 70% coverage

### Integración
- [ ] App.jsx integraba todos los componentes
- [ ] Flujo create-read-update-delete funciona
- [ ] Filtros funcionan
- [ ] Mensajes de éxito/error
- [ ] Loading states visibles
- [ ] Responsive en mobile/tablet
- [ ] WCAG AA accessibility

## Comandos Útiles

```bash
# Frontend setup
cd frontend
npm install

# Desarrollo
npm run dev

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
npm run format

# Build
npm run build
```

## Recursos Útiles

### React Testing Library
- https://testing-library.com/docs/react-testing-library/intro

### Vitest
- https://vitest.dev/

### Tailwind CSS
- https://tailwindcss.com/docs

### Axios
- https://axios-http.com/

### Form Validation Patterns
- https://react.dev/reference/react/useState

## Tiempo Estimado

- AbsenceForm: 1-2 horas
- AbsenceList: 1-2 horas
- AbsenceFilters: 1 hora
- Tests: 2-3 horas
- Integración: 1 hora
- **Total**: 6-9 horas

## Notas Importantes

1. **TDD**: Escribir tests primero, luego implementar
2. **Accesibilidad**: Cada FormField debe tener label y ARIA attributes
3. **i18n**: Usar `t('key')` para todos los textos
4. **API**: Manejo de errores con try/catch y mostrar al usuario
5. **Loading states**: Deshabilitar forms durante carga
6. **Responsive**: Probar en mobile, tablet, desktop

## Próximos Pasos Después

Una vez completado el frontend:

1. **Integration Tests**: Pruebas end-to-end
2. **Optimización**: Code splitting, lazy loading
3. **Deployment**: Docker, Nginx, CI/CD
4. **Monitoring**: Error tracking, analytics
5. **Features**: Paginación, búsqueda avanzada, exportación PDF

---

**Última actualización**: Diciembre 2025
**Estado**: Guía completa para implementación frontend
