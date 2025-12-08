# AbsenceHub - Deployment Guide

## 🚀 Integrated Deployment (Recommended)

El proyecto está configurado para servir el frontend desde el backend Flask. Esto simplifica el deployment ya que solo necesitas ejecutar un servidor.

### Quick Start

1. **Build e Integrar** (una sola vez o después de cambios en el frontend):

   **Linux/Mac:**
   ```bash
   ./build.sh
   ```

   **Windows:**
   ```bash
   build.bat
   ```

2. **Ejecutar la aplicación integrada:**
   ```bash
   cd backend
   python run.py
   ```

3. **Acceder a la aplicación:**
   - Abrir navegador en: `http://localhost:5000`
   - El frontend y la API están integrados en el mismo servidor

### ¿Qué hace el script de build?

1. Compila el frontend de React (`npm run build`)
2. Copia los archivos estáticos a `backend/static/`
3. El backend Flask sirve automáticamente estos archivos

### Estructura después del build:

```
AbsenceHub/
├── backend/
│   ├── app/
│   ├── static/              # ← Frontend compilado (generado)
│   │   ├── assets/
│   │   └── index.html
│   └── run.py
└── frontend/
    ├── src/
    └── dist/               # ← Build temporal
```

---

## 🔧 Development Mode (Desarrollo)

Para desarrollo, ejecuta frontend y backend por separado:

### Terminal 1 - Backend:
```bash
cd backend
python run.py
# Corre en http://localhost:5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Corre en http://localhost:5173
```

En este modo:
- Frontend tiene hot-reload
- Backend API en puerto 5000
- Frontend proxy en puerto 5173

---

## 📦 Production Deployment

### Opción 1: Servidor Simple (Development Server)

```bash
# 1. Build frontend
./build.sh

# 2. Iniciar servidor
cd backend
python run.py
```

⚠️ **Nota:** El servidor de desarrollo de Flask NO es para producción.

### Opción 2: Servidor de Producción con Gunicorn

1. **Instalar Gunicorn:**
   ```bash
   cd backend
   pip install gunicorn
   ```

2. **Build frontend:**
   ```bash
   ./build.sh
   ```

3. **Ejecutar con Gunicorn:**
   ```bash
   cd backend
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
   ```

### Opción 3: Docker (Próximamente)

Se puede crear un Dockerfile para containerizar la aplicación completa.

---

## 🌐 Configuración para Producción

### 1. Variables de Entorno

Crear un archivo `.env` en `backend/`:

```env
FLASK_ENV=production
FLASK_PORT=5000
SECRET_KEY=tu-secret-key-super-seguro-aqui
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ORIGINS=https://tu-dominio.com
```

### 2. Base de Datos

```bash
cd backend
flask db upgrade
flask seed-db  # (opcional, solo para datos de prueba)
```

### 3. Nginx como Reverse Proxy (Opcional)

Configuración de ejemplo para Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔍 Verificación del Deployment

Después de ejecutar el servidor integrado, verifica:

1. **Frontend:** `http://localhost:5000/`
   - Deberías ver la interfaz de AbsenceHub

2. **API:** `http://localhost:5000/api/absences`
   - Deberías ver JSON con las ausencias

3. **Health Check:** `http://localhost:5000/api/health`
   - Deberías ver: `{"status": "ok"}`

---

## 📝 Notas Importantes

1. **Carpeta `static/` no está en Git:**
   - Se genera durante el build
   - No commitear esta carpeta

2. **Rebuild después de cambios en frontend:**
   ```bash
   ./build.sh
   ```

3. **Puerto en uso:**
   - El backend detecta automáticamente si el puerto 5000 está ocupado
   - Usará el siguiente puerto disponible (5001, 5002, etc.)

4. **CORS en Producción:**
   - Actualizar `CORS_ORIGINS` en `.env`
   - Solo permitir orígenes confiables

---

## 🐛 Troubleshooting

### Frontend no carga:
```bash
# Verificar que existe la carpeta static
ls backend/static/

# Si no existe, rebuild
./build.sh
```

### Error de base de datos:
```bash
cd backend
flask db upgrade
```

### Puerto ocupado:
```bash
# Matar proceso en puerto 5000
pkill -f "python run.py"

# O usar otro puerto
export FLASK_PORT=5001
python run.py
```

---

## 📚 Recursos Adicionales

- [Flask Production Best Practices](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Última actualización:** Diciembre 2025
