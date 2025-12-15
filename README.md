<div align="center">
    <img src="/Frontend//public/logo-quickride-green.png" height="100px" >
</div>

# QuickRide - Full Stack Ride Booking Application

QuickRide is a feature-rich project built using modern web technologies. It replicates the core features and functionalities of the existing ride booking platforms, including **user authentication**, **ride booking**, **real-time location tracking**, **fare calculation** and **real-time communication**. The application features a clean and responsive user interface, ensuring an intuitive user experience. Designed as a learning and portfolio project, it showcases skills in **frontend and backend development, API integration, and real-time features**.


---

⭐ **If you found this project helpful or interesting, please consider giving it a star on [GitHub](https://github.com/asif-khan-2k19/QuickRide)! It helps others discover the project and keeps me motivated to improve it.** ⭐

---

## 📚 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [Technical Documentation](#technical-documentation)
7. [Contributing](#contributing)
8. [License](#license)

---

## ⚙️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,react,nodejs,express,mongo,tailwind,gcp,npm,vercel,git,gmail,postman&perline=7" />
</p>

| **Category**       | **Technologies / Tools**                                              |
| ------------------ | --------------------------------------------------------------------- |
| **Frontend**       | HTML, CSS, React.js, Tailwind CSS, Mapbox GL JS, Framer Motion, React Hot Toast |
| **Backend**        | Node.js, Express.js, MongoDB, Socket IO, NodeMailer, Google Maps APIs |
| **Authentication** | JWT (JSON Web Token), bcrypt                                          |
| **Deployment**     | Vercel, Render                                                        |
| **Dev Tools**      | Postman, npm, Nodemon, ESLint, Custom Logger                          |


---

## ✨ Features

### 🚨 Critical Bug Fixes (Production-Ready)

- **FIXED**: Race condition in ride acceptance - atomic MongoDB updates prevent multiple drivers accepting same ride
- **FIXED**: Socket notification delivery - drivers now reliably receive ride requests
- **FIXED**: Data consistency - lat/lng coordinate handling standardized across codebase
- **ENHANCED**: Socket.io with rooms, confirmations, and reconnection support

### 🎨 UBER-Level Design System

- **Professional Color Palette**: UBER black (#000), white (#FFF), blue (#276EF1), green (#05A357), red (#CD0A29)
- **Premium Components**: 
  - Button with 48px min height, active scale(0.98), 6 variants
  - Input with 16px padding, validation states, focus rings
  - Card with UBER shadows and borders
  - Modal with animations and accessibility
  - Bottom navigation for mobile (44x44px touch targets)
- **Consistent Styling**: Border radius (8px-24px), shadows (sm-xl), transitions (200ms)

### 🔐 Authentication & Authorization

- Secure email/password login with full form validation
- Email verification and logout functionality
- Forgot and change password support
- Role-based access control (User and Captain)
- Session handling and route protection (unauthorized access is blocked)

### 🧑🏻 User Management

- Edit personal profile details (name, email, phone)
- Ride history tracking
- Form validation for all user inputs

### 📍 Location & Mapping

- **NEW**: LiveTrackingMap with real-time driver tracking
- **NEW**: Animated driver markers with pulse effect
- **NEW**: Pickup (blue) and dropoff (green) markers
- **NEW**: Route visualization with Mapbox Directions API
- **NEW**: ETA overlay with time calculations
- **NEW**: Smooth location updates with easeTo() animations
- Mapbox GL JS integration for modern, interactive maps
- Location autocomplete with Mapbox Geocoding API
- Pickup and destination selection with address auto-complete
- Route visualization with distance and estimated time calculation

### 🚖 Ride Booking System

- Supports multiple ride types: Car, Bike, and Auto
- Live ride status updates: Pending, Accepted, Ongoing, Completed, Cancelled
- **Concurrency control**: Atomic database updates - only one captain can accept (race condition fixed)
- **Ride unavailability broadcast**: Other drivers notified when ride is accepted
- Automatic ride cancellation after timeout
- Accurate fare estimation based on distance and time
- **NEW**: ⭐ 5-Star Rating System - Rate drivers and passengers after each ride

### ⭐ Rating & Feedback System

- **NEW**: UBER-style rating modal with animated stars
- **NEW**: Automatic rating request when ride completes
- **NEW**: Both passenger and driver receive rating prompts
- **NEW**: Cannot close modal until rating is submitted
- **NEW**: Optional comment field (max 250 characters)
- **NEW**: Real-time rating average calculation
- **NEW**: Rating history stored per ride
- Display of driver/passenger ratings before accepting rides

### 🔄 Real-Time Updates

- **NEW**: 30-second countdown timer on ride notifications
- **NEW**: Sound and vibration notifications
- **NEW**: UBER-style black notification cards
- **NEW**: Driver location updates with ride tracking
- **NEW**: Passenger location updates during active rides
- Enhanced toast notifications with react-hot-toast
- Rich ride request notifications with accept/reject actions
- Socket-based updates for ride status and live locations
- Real-time in-app chat between rider and captain
- Chat messages are stored in the database with timestamps
- Access control ensures only assigned rider and captain can view the conversation

### 👨‍✈️ Captain (Driver) Interface

- **PRODUCTION-READY**: All critical notification bugs fixed
- Accept or reject incoming ride requests with countdown
- Real-time location sharing with passengers
- Socket rooms for targeted messaging
- Connection tracking and automatic reconnection
- Role-specific access to ride-related actions

### 🎨 UI/UX Enhancements

- **UBER Design System**: Complete implementation with brand colors
- **Premium Components**: Modal, BottomNav, enhanced Button/Input/Card
- **Mobile-First**: 44x44px minimum touch targets
- Modern component library with redesigned buttons, inputs, cards
- Smooth page transitions with Framer Motion
- Bottom sheet component for mobile-friendly interactions
- Skeleton loaders for better perceived performance
- Professional color scheme with UBER palette and Inter font
- Ripple effects and micro-interactions
- Responsive design optimized for mobile (320px - 1280px)

### 🧰 System Utilities

- Custom logger to persist frontend and backend logs in the database
- Force reset feature to clear all local app data and recover from unstable states
- Popup alert system for immediate feedback (success, error, warning)
- **NEW**: Ride tracking utilities (distance, ETA, formatting)
- **NEW**: Geolocation helpers (getCurrentPosition, watchPosition)

---

## 🖼️ Screenshots

<details>
<summary>Authentication</summary>

![User Auth](./Frontend/public/screens/user-auth.png)

</details>

<details>
<summary>Sidebar Navigation</summary>

![Sidebar](./Frontend/public/screens/sidebar.png)

</details>

<details>
<summary>User Module</summary>

![User Module](./Frontend/public/screens/user-module.png)

</details>

<details>
<summary>Captain Module</summary>

![Captain Module](./Frontend/public/screens/captain-module.png)

</details>

---

## ⚡ Quick Start

### 📁 Project Structure

```

📂 Backend      // Node.js + Express server
📂 Frontend     // React.js application

```

### 1. Clone the Repository

```bash
git clone https://github.com/asif-khan-2k19/QuickRide.git
cd QuickRide
```

### 2. Install Dependencies

#### Frontend

```bash
cd Frontend
npm install
```

#### Backend

```bash
cd ../Backend
npm install
```

### 3. Run the Application

#### Frontend (React + Vite)

```bash
npm run dev
```

#### Backend (Node.js + Express)

```bash
npm run dev
```

### 4. Open the App

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Environment Variables

Create `.env` files in both `Frontend/` and `Backend/` directories.
`.env.example` files are already present in the folders.

### Frontend `.env`

```env
VITE_SERVER_URL=http://localhost:4000
VITE_ENVIRONMENT=development
VITE_RIDE_TIMEOUT=90000
VITE_MAPBOX_TOKEN=pk.xxx  # Get from https://account.mapbox.com/
```

### Backend `.env`

```env
PORT=3000
RELOAD_INTERVAL = 10
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
ENVIRONMENT=development
MONGODB_PROD_URL=<your-mongodb-atlas-url>
MONGODB_DEV_URL=mongodb://127.0.0.1:27017/quickRide
JWT_SECRET=<your-jwt-secret>
GOOGLE_MAPS_API=<your-google-maps-api-key>
MAIL_USER=<your-gmail-id>
MAIL_PASS=<your-app-password>
```

---

## 🔒 Security Features (v1.1.0)

This application has been security-audited and includes:

| Feature | Description |
|---------|-------------|
| **Helmet.js** | Security headers (XSS, clickjacking protection) |
| **Rate Limiting** | Prevents brute force attacks (5 login attempts/15min) |
| **httpOnly Cookies** | XSS-protected token storage |
| **Socket.io Auth** | JWT authentication for real-time connections |
| **Input Validation** | express-validator on all endpoints |
| **MongoDB Sanitization** | Prevents NoSQL injection |
| **Graceful Shutdown** | Clean server termination |
| **Health Check** | `/health` endpoint for monitoring |

For detailed security audit results, see:
- **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** - Full audit findings
- **[SECURITY_REPORT.md](./SECURITY_REPORT.md)** - Security-specific analysis
- **[FIX_IMPLEMENTATION_REPORT.md](./FIX_IMPLEMENTATION_REPORT.md)** - Implementation status

---

## 📖 Technical Documentation

For detailed technical information about the implementation, including:
- Critical bug fixes and solutions
- UBER design system specifications
- Socket.io architecture
- Live tracking map implementation
- Security improvements
- API changes and new events
- Performance metrics
- Troubleshooting guide

See **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)**

---

## 🤝 Contributing

We welcome community contributions! To contribute:

1. Star this repository
2. Fork this repository
3. Create a new branch (`git checkout -b feature/YourFeature`)
4. Commit your changes (`git commit -m 'Add your feature description...'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Create a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Ready to contribute? Let’s build something amazing together.**
