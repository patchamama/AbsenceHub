# 🚀 Quick Start - AbsenceHub v2.0

Guía rápida para arrancar la aplicación en minutos.

---

## ⚡ Inicio Rápido (3 Pasos)

### 1️⃣ Iniciar Backend

```bash
cd /mnt/c/Users/Armando.Cabrera/work/AbsenceHub/backend
python run.py
```

**Salida esperada**:
```
⚠  Port 5000 is in use. Using port 5001 instead.
✓ Flask backend running on http://localhost:5001
✓ API endpoints available at http://localhost:5001/api
```

### 2️⃣ Iniciar Frontend

```bash
cd /mnt/c/Users/Armando.Cabrera/work/AbsenceHub/frontend
npm run dev
```

**Salida esperada**:
```
✓ Proxy configured for backend on port 5001
  VITE v5.4.21  ready in 1184 ms
  ➜  Local:   http://localhost:5173/
```

### 3️⃣ Abrir en Navegador

http://localhost:5173/

---

## 📱 Vistas Disponibles

- **📋 Liste**: Ver, filtrar, crear, editar ausencias
- **📅 Kalender**: Vista mensual con tooltips
- **⚙️ Einstellungen**: Configurar tipos y colores

---

## 🔗 URLs Útiles

| Recurso | URL |
|---------|-----|
| Frontend | http://localhost:5173/ |
| Backend API | http://localhost:5001/api |
| Health Check | http://localhost:5001/health |

---

**Para más detalles, ver: TESTING_GUIDE.md y IMPLEMENTATION_REPORT.md**
