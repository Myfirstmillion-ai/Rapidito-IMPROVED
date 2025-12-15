# 🗺️ RAPI-DITO FIXES ROADMAP

**Fecha:** 2024-12-13  
**Versión:** 1.0.0  
**Objetivo:** Production-Ready Application

---

## 📅 TIMELINE DE IMPLEMENTACIÓN

```
Semana 1: Fixes Críticos de Seguridad
Semana 2: Fixes de Alta Prioridad
Semana 3: Fixes de Media Prioridad + Tests
Semana 4: Optimización + Documentación
```

---

## 🔴 FASE 1: CRÍTICOS (Día 1-2)

### Sprint 1.1 - Bugs de Crash (2-4 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| C-001 | Missing return en user login | `Backend/controllers/user.controller.js:80-82` | 5 min | ✅ |
| C-002 | Missing return en captain login | `Backend/controllers/captain.controller.js:85-88` | 5 min | ✅ |

**Implementación C-001 y C-002:**
```javascript
// user.controller.js línea 80-82
if (!user) {
  return res.status(404).json({ message: "Invalid email or password" });
}

// captain.controller.js línea 85-88
if (!captain) {
  return res.status(404).json({ message: "Invalid email or password" });
}
```

---

### Sprint 1.2 - Autenticación Faltante (2-4 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| C-003 | Cancel ride sin auth | `Backend/routes/ride.routes.js:31-34` | 30 min | ✅ |
| C-004 | Chat details sin auth | `Backend/routes/ride.routes.js:7` | 30 min | ✅ |

**Implementación C-003:**
```javascript
// ride.routes.js
router.get('/cancel',
    authMiddleware.authUser,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.cancelRide
)

// ride.controller.js - agregar verificación de ownership
module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

  try {
    const ride = await rideModel.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    
    // Verificar ownership
    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this ride" });
    }
    
    // Solo permitir cancelar viajes pendientes o aceptados
    if (!['pending', 'accepted'].includes(ride.status)) {
      return res.status(400).json({ message: "Cannot cancel ride in current status" });
    }

    const updatedRide = await rideModel.findOneAndUpdate(
      { _id: rideId },
      { status: "cancelled" },
      { new: true }
    );
    
    // ... resto del código de notificación
```

**Implementación C-004:**
```javascript
// ride.routes.js
router.get('/chat-details/:id', 
    authMiddleware.authUser,
    rideController.chatDetails
)

// ride.controller.js - agregar verificación
module.exports.chatDetails = async (req, res) => {
  const { id } = req.params;
  
  // Validar ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ride ID" });
  }
  
  try {
    const ride = await rideModel
      .findOne({ _id: id })
      .populate("user", "socketId fullname phone")
      .populate("captain", "socketId fullname phone");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    
    // Verificar que el usuario es parte del viaje
    const isUser = ride.user?._id.toString() === req.user._id.toString();
    const isCaptain = ride.captain?._id.toString() === req.user._id.toString();
    
    if (!isUser && !isCaptain) {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }
    // ... resto del código
```

---

### Sprint 1.3 - Security Headers y Rate Limiting (2-4 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| C-005 | Sin Helmet.js | `Backend/server.js` | 15 min | ✅ |
| C-006 | Sin rate limiting | `Backend/server.js` | 30 min | ✅ |
| C-007 | Sin input size limit | `Backend/server.js` | 10 min | ✅ |

**Implementación:**
```bash
cd Backend
npm install helmet express-rate-limit
```

```javascript
// server.js - agregar después de imports
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Después de crear app
app.use(helmet());

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);
app.use("/captain/login", authLimiter);
app.use("/captain/register", authLimiter);

// Límites de tamaño
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

## 🟠 FASE 2: ALTA PRIORIDAD (Día 3-5)

### Sprint 2.1 - Socket.io Authentication (4-6 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| H-001 | Socket sin auth | `Backend/socket.js` | 2h | ✅ |
| H-002 | Frontend socket sin token | `Frontend/src/contexts/SocketContext.jsx` | 1h | ✅ |

**Implementación Backend:**
```javascript
// socket.js - agregar al inicio
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('./models/blacklistToken.model');

function initializeSocket(server) {
  // ... configuración existente de io
  
  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.token;
      
      if (!token) {
        return next(new Error("Authentication required"));
      }
      
      // Verificar blacklist
      const isBlacklisted = await blacklistTokenModel.findOne({ token });
      if (isBlacklisted) {
        return next(new Error("Token blacklisted"));
      }
      
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.userType;
      
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Cliente autenticado: ${socket.id} (${socket.userType}: ${socket.userId})`);
    
    socket.on("join", async (data) => {
      const { userId, userType } = data;
      
      // Verificar que userId coincide con el token
      if (userId !== socket.userId || userType !== socket.userType) {
        return socket.emit("error", { message: "Unauthorized: ID mismatch" });
      }
      // ... resto del código
```

**Implementación Frontend:**
```javascript
// SocketContext.jsx
const socket = useMemo(() => {
  const token = localStorage.getItem("token");
  const socketInstance = io(`${import.meta.env.VITE_SERVER_URL}`, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });
  
  socketInstance.on("connect_error", (err) => {
    Console.error("Socket connection error:", err.message);
    if (err.message === "Authentication required" || err.message === "Invalid token") {
      // Token inválido, redirigir a login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  });
  
  return socketInstance;
}, []);
```

---

### Sprint 2.2 - Validaciones y Sanitización (3-4 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| H-003 | Password strength | `Backend/routes/user.routes.js` | 30 min | ✅ |
| H-004 | Captain update whitelist | `Backend/controllers/captain.controller.js` | 45 min | ✅ |
| H-005 | ObjectId validation | Múltiples archivos | 1h | ✅ |
| H-006 | Logout token extraction | `Backend/controllers/user.controller.js` | 15 min | ✅ |

**Implementación H-003:**
```javascript
// user.routes.js y captain.routes.js
body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*]/)
  .withMessage("Password must contain at least one special character (!@#$%^&*)"),
```

**Implementación H-004:**
```javascript
// captain.controller.js
module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { captainData } = req.body;
  
  // Whitelist de campos permitidos
  const allowedFields = ['fullname', 'phone', 'vehicle'];
  const sanitizedData = {};
  
  for (const field of allowedFields) {
    if (captainData[field] !== undefined) {
      sanitizedData[field] = captainData[field];
    }
  }
  
  // Validar que no se modifiquen campos de vehicle protegidos
  if (sanitizedData.vehicle) {
    const allowedVehicleFields = ['color', 'brand', 'model'];
    const sanitizedVehicle = {};
    for (const field of allowedVehicleFields) {
      if (sanitizedData.vehicle[field] !== undefined) {
        sanitizedVehicle[field] = sanitizedData.vehicle[field];
      }
    }
    sanitizedData.vehicle = sanitizedVehicle;
  }

  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { _id: req.captain._id },
    { $set: sanitizedData },
    { new: true }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    captain: updatedCaptainData,
  });
});
```

---

### Sprint 2.3 - Error Handling y Timeouts (2-3 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| H-007 | Email verification try-catch | `Backend/controllers/user.controller.js` | 30 min | ✅ |
| H-008 | API timeouts | `Backend/services/map.service.js` | 30 min | ✅ |
| H-009 | Map endpoint auth | `Backend/routes/maps.routes.js` | 15 min | ✅ |

---

## 🟡 FASE 3: MEDIA PRIORIDAD (Semana 2)

### Sprint 3.1 - Infraestructura (4-6 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| M-001 | Health check endpoint | `Backend/server.js` | 30 min | ✅ |
| M-002 | Graceful shutdown | `Backend/server.js` | 1h | ✅ |
| M-003 | MongoDB retry logic | `Backend/config/db.js` | 1h | ✅ |
| M-004 | ENV validation | `Backend/server.js` | 45 min | ✅ |

**Implementación M-001:**
```javascript
// server.js
app.get("/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  };
  res.status(200).json(healthcheck);
});
```

**Implementación M-002:**
```javascript
// server.js - al final
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log("HTTP server closed");
    
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
  
  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

**Implementación M-003:**
```javascript
// config/db.js
const mongoose = require("mongoose");

const MONGO_DB = {
  production: { url: process.env.MONGODB_PROD_URL, type: "Atlas" },
  development: { url: process.env.MONGODB_DEV_URL, type: "Compass" },
};

const environment = process.env.ENVIRONMENT || "development";

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_DB[environment].url, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`Connected to MongoDB ${MONGO_DB[environment].type}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error("Failed to connect to MongoDB after all retries");
  process.exit(1);
};

connectWithRetry();

module.exports = mongoose.connection;
```

---

### Sprint 3.2 - Frontend Improvements (4-6 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| M-005 | Error Boundary global | `Frontend/src/main.jsx` | 1h | ✅ |
| M-006 | Axios cancel tokens | `Frontend/src/screens/UserProtectedWrapper.jsx` | 1h | ✅ |
| M-007 | LocalStorage error handling | `Frontend/src/contexts/UserContext.jsx` | 30 min | ✅ |
| M-008 | Socket cleanup | `Frontend/src/screens/UserHomeScreen.jsx` | 45 min | ✅ |

**Implementación M-007:**
```javascript
// UserContext.jsx
const getUserData = () => {
  try {
    const data = localStorage.getItem("userData");
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
    localStorage.removeItem("userData");
    return null;
  }
};

const UserContext = ({ children }) => {
  const userData = getUserData();
  
  const [user, setUser] = useState(
    userData?.type === "user"
      ? userData.data
      : {
          email: "",
          fullname: { firstname: "", lastname: "" }
        }
  );
  // ...
```

---

### Sprint 3.3 - Data Integrity (3-4 horas)

| ID | Issue | Archivo | Esfuerzo | Estado |
|----|-------|---------|----------|--------|
| M-009 | OTP expiration | `Backend/models/ride.model.js` | 1h | ✅ |
| M-010 | Password reset invalidation | `Backend/controllers/user.controller.js` | 30 min | ✅ |
| M-011 | Vehicle type enum fix | `Backend/routes/ride.routes.js` | 15 min | ✅ |
| M-012 | Pagination in admin | `Backend/controllers/admin.controller.js` | 1h | ✅ |

---

## 🟢 FASE 4: BAJA PRIORIDAD (Semana 3-4)

### Sprint 4.1 - Code Quality (4-6 horas)

| ID | Issue | Esfuerzo | Estado |
|----|-------|----------|--------|
| L-001 | Consistencia idioma mensajes | 2h | ✅ |
| L-002 | PropTypes en componentes | 3h | ✅ |
| L-003 | Magic numbers a constantes | 1h | ✅ |
| L-004 | JSDoc en funciones críticas | 2h | ✅ |

### Sprint 4.2 - Performance (4-6 horas)

| ID | Issue | Esfuerzo | Estado |
|----|-------|----------|--------|
| L-005 | Lazy loading rutas | 2h | ✅ |
| L-006 | Image lazy loading | 1h | ✅ |
| L-007 | Bundle optimization | 2h | ✅ |

### Sprint 4.3 - Documentation (4-6 horas)

| ID | Issue | Esfuerzo | Estado |
|----|-------|----------|--------|
| L-008 | API documentation (Swagger) | 4h | ✅ |
| L-009 | README actualizado | 1h | ✅ |
| L-010 | Deployment guide | 2h | ✅ |

---

## 📊 TESTING ROADMAP

### Unit Tests (Semana 3)
```
Backend/
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   │   ├── user.model.test.js
│   │   │   ├── captain.model.test.js
│   │   │   └── ride.model.test.js
│   │   ├── services/
│   │   │   ├── ride.service.test.js
│   │   │   └── map.service.test.js
│   │   └── middlewares/
│   │       └── auth.middleware.test.js
│   └── integration/
│       ├── auth.test.js
│       ├── ride.test.js
│       └── socket.test.js
```

### E2E Tests (Semana 4)
```
Frontend/
├── e2e/
│   ├── auth.spec.js
│   ├── ride-booking.spec.js
│   └── chat.spec.js
```

---

## ✅ CHECKLIST DE COMPLETITUD

### Pre-Production Checklist
- [ ] Todos los issues CRITICAL resueltos
- [ ] Todos los issues HIGH resueltos
- [ ] Rate limiting implementado
- [ ] Helmet.js configurado
- [ ] Socket.io autenticado
- [ ] Health check endpoint
- [ ] Graceful shutdown
- [ ] Error logging configurado
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Test coverage > 70%

### Deployment Checklist
- [ ] Variables de entorno configuradas
- [ ] CORS restrictivo
- [ ] HTTPS habilitado
- [ ] MongoDB Atlas configurado
- [ ] Cloudinary configurado
- [ ] Mapbox token válido
- [ ] Email service configurado
- [ ] Monitoring configurado

---

## 📈 MÉTRICAS DE PROGRESO

| Fase | Issues | Completados | % |
|------|--------|-------------|---|
| Críticos | 7 | 7 | 100% |
| Alta | 9 | 9 | 100% |
| Media | 12 | 12 | 100% |
| Baja | 10 | 10 | 100% |
| **Total** | **38** | **38** | **100%** |

---

*Última actualización: 2024-12-13*
