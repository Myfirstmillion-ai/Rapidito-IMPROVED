# Sistema de Calificaciones y Fotos de Perfil - RAPIDITO

## 🔧 Problemas Resueltos

### 1. Error de Calificación "Unauthorized User" ✅
**Problema:** Los usuarios no podían enviar calificaciones porque el middleware `authUserOrCaptain` en `rating.routes.js` tenía errores de lógica.

**Solución:** Se simplificó el middleware para intentar autenticación de usuario primero, y luego autenticación de conductor si falla.

**Archivo modificado:** `Backend/routes/rating.routes.js`

### 2. Sistema de Fotos de Perfil ✅
**Problema:** No existía forma de subir fotos de perfil para usuarios y conductores.

**Solución:** Se implementó sistema completo de upload usando Cloudinary como CDN.

## 📦 Nuevas Dependencias Instaladas

```json
"multer": "^1.4.5-lts.1"  // Manejo de archivos multipart/form-data
"cloudinary": "^2.0.0"     // CDN para almacenar imágenes
```

## 🏗️ Archivos Creados/Modificados

### Archivos Creados
1. `Backend/services/upload.service.js` - Servicio de Cloudinary y Multer
2. `Backend/controllers/upload.controller.js` - Controladores de upload
3. `Backend/routes/upload.routes.js` - Rutas de upload

### Archivos Modificados
1. `Backend/models/user.model.js` - Añadido campo `profileImage`
2. `Backend/models/captain.model.js` - Añadido campo `profileImage`
3. `Backend/routes/rating.routes.js` - Arreglado middleware `authUserOrCaptain`
4. `Backend/middlewares/auth.middleware.js` - Añadido `profileImage` y `rating` en respuestas
5. `Backend/server.js` - Registrado rutas de upload
6. `Backend/package.json` - Añadidas dependencias multer y cloudinary
7. `Backend/.env.example` - Añadidas variables de Cloudinary

## 🔐 Configuración de Cloudinary

### Paso 1: Crear Cuenta
1. Ve a https://cloudinary.com
2. Crea una cuenta gratuita
3. Ve al Dashboard

### Paso 2: Obtener Credenciales
En el Dashboard de Cloudinary encontrarás:
- Cloud Name
- API Key
- API Secret

### Paso 3: Configurar .env
Añade estas variables al archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

## 🎯 Endpoints Disponibles

### Sistema de Calificaciones (Ya existía, ahora funciona correctamente)

#### POST /ratings/submit
Enviar calificación de un viaje completado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "rideId": "673abc123...",
  "stars": 5,
  "comment": "Excelente conductor",
  "raterType": "user"  // "user" o "captain"
}
```

**Response 200:**
```json
{
  "message": "Calificación enviada exitosamente",
  "ride": {
    "_id": "673abc123...",
    "rating": {
      "userToCaptain": {
        "stars": 5,
        "comment": "Excelente conductor",
        "createdAt": "2024-12-05T20:00:00.000Z"
      }
    }
  }
}
```

#### GET /ratings/:rideId/status
Verificar si un viaje ya fue calificado.

**Response 200:**
```json
{
  "rideId": "673abc123...",
  "status": "completed",
  "userRated": true,
  "captainRated": false
}
```

### Sistema de Fotos de Perfil (NUEVO)

#### POST /upload/user/profile-image
Subir foto de perfil de usuario.

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
profileImage: <archivo_imagen>
```

**Tipos permitidos:** jpeg, jpg, png, webp  
**Tamaño máximo:** 5MB  
**Transformación:** Se redimensiona a 500x500px automáticamente

**Response 200:**
```json
{
  "message": "Foto de perfil actualizada exitosamente",
  "profileImage": "https://res.cloudinary.com/rapidito/users/abc123.jpg"
}
```

#### POST /upload/captain/profile-image
Subir foto de perfil de conductor.

**Headers:**
```
Authorization: Bearer <captain_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
profileImage: <archivo_imagen>
```

**Response 200:**
```json
{
  "message": "Foto de perfil actualizada exitosamente",
  "profileImage": "https://res.cloudinary.com/rapidito/captains/xyz789.jpg"
}
```

#### DELETE /upload/profile-image
Eliminar foto de perfil.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "userType": "user"  // "user" o "captain"
}
```

**Response 200:**
```json
{
  "message": "Foto de perfil eliminada exitosamente"
}
```

## 💻 Uso desde el Frontend

### Ejemplo: Subir Foto de Perfil

```javascript
const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);

  try {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); // 'user' o 'captain'
    
    const endpoint = userType === 'user' 
      ? '/upload/user/profile-image'
      : '/upload/captain/profile-image';
    
    const response = await axios.post(
      `http://localhost:4000${endpoint}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Imagen subida:', response.data.profileImage);
    // Actualizar UI con nueva URL de imagen
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};

// En el componente de imagen
<input 
  type="file" 
  accept="image/jpeg,image/jpg,image/png,image/webp"
  onChange={(e) => uploadProfileImage(e.target.files[0])}
/>
```

### Ejemplo: Enviar Calificación

```javascript
const submitRating = async (rideId, stars, comment) => {
  try {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); // 'user' o 'captain'
    
    const response = await axios.post(
      'http://localhost:4000/ratings/submit',
      {
        rideId,
        stars,
        comment,
        raterType: userType
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Calificación enviada:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};
```

## 🔒 Seguridad

### Validaciones Implementadas
1. **Autenticación:** Todos los endpoints requieren token JWT válido
2. **Tipo de archivo:** Solo se permiten imágenes (jpeg, jpg, png, webp)
3. **Tamaño de archivo:** Máximo 5MB
4. **Optimización:** Las imágenes se redimensionan a 500x500px automáticamente
5. **Propiedad:** Los usuarios solo pueden calificar sus propios viajes
6. **Estado del viaje:** Solo se pueden calificar viajes completados
7. **Calificación única:** Un viaje solo puede ser calificado una vez por persona

## 📊 Cambios en los Modelos

### User Model
```javascript
profileImage: {
  type: String,
  default: ""
}
```

### Captain Model
```javascript
profileImage: {
  type: String,
  default: ""
}
```

### Rating ya existía en Ride Model
```javascript
rating: {
  userToCaptain: {
    stars: Number (1-5),
    comment: String (max 250 chars),
    createdAt: Date
  },
  captainToUser: {
    stars: Number (1-5),
    comment: String (max 250 chars),
    createdAt: Date
  }
}
```

## 🎯 Estadísticas de Rating

Las calificaciones se promedian automáticamente:

```javascript
// En User y Captain models
rating: {
  average: Number (0-5),
  count: Number
}
```

Cada vez que se envía una calificación:
1. Se guarda en el viaje (ride)
2. Se actualiza el promedio del usuario/conductor
3. Se notifica via socket al calificado

## 🚀 Testing

### Test de Upload
```bash
curl -X POST http://localhost:4000/upload/user/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profileImage=@/path/to/image.jpg"
```

### Test de Rating
```bash
curl -X POST http://localhost:4000/ratings/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "RIDE_ID",
    "stars": 5,
    "comment": "Excelente",
    "raterType": "user"
  }'
```

## ✅ Resultado Final

✅ Los usuarios pueden calificar viajes completados (1-5 estrellas + comentario)  
✅ Las calificaciones se guardan y promedian correctamente  
✅ Los usuarios y conductores pueden subir/eliminar fotos de perfil  
✅ Las fotos se optimizan automáticamente (500x500px)  
✅ Las fotos se almacenan en Cloudinary (CDN profesional)  
✅ Sistema completo de autenticación y validación  
✅ Error "Unauthorized User" RESUELTO  

## 🔄 Próximos Pasos

1. Configurar cuenta de Cloudinary (gratuita)
2. Añadir variables al .env
3. Reiniciar servidor: `npm run dev`
4. Actualizar Frontend para usar endpoints de upload
5. Mostrar `profileImage` en componentes de usuario/conductor
6. Mostrar promedio de calificaciones (`rating.average`) en perfiles

## 📞 Soporte

Si tienes problemas:
1. Verifica que las variables de Cloudinary estén correctamente configuradas en .env
2. Verifica que npm install haya completado exitosamente
3. Revisa los logs del servidor para errores específicos
4. Asegúrate de enviar el token de autenticación en los headers
