# 🚀 RAPI-DITO DEPLOYMENT GUIDE

**L-010: Complete Deployment Documentation**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [External Services](#external-services)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 📦 Prerequisites

### Required Software
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: v6.x or higher (or MongoDB Atlas)
- **Git**: Latest version

### Accounts Required
- MongoDB Atlas account (for production database)
- Mapbox account (for maps and geocoding)
- Cloudinary account (for image uploads)
- Email service provider (SendGrid, Mailgun, etc.)
- Hosting provider (Render, Railway, Vercel, etc.)

---

## ⚙️ Environment Setup

### Backend Environment Variables

Create `Backend/.env` file:

```env
# Server Configuration
PORT=4000
ENVIRONMENT=production

# Database
MONGODB_DEV_URL=mongodb://localhost:27017/rapidito_dev
MONGODB_PROD_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/rapidito

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Mapbox
MAPBOX_TOKEN=pk.your_mapbox_public_token

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@rapidito.app
```

### Frontend Environment Variables

Create `Frontend/.env` file:

```env
# API Configuration
VITE_SERVER_URL=https://your-backend-domain.com
VITE_ENVIRONMENT=production

# Mapbox
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token

# Ride Configuration
VITE_RIDE_TIMEOUT=120000
```

---

## 🖥️ Backend Deployment

### Option 1: Render.com (Recommended)

1. **Connect Repository**
   ```bash
   # Push code to GitHub
   git push origin main
   ```

2. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: rapidito-api
     - **Root Directory**: Backend
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Starter ($7/month) or higher

3. **Add Environment Variables**
   - Add all variables from Backend/.env

4. **Deploy**
   - Render will auto-deploy on push to main

### Option 2: Railway.app

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd Backend
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret
   railway variables set MONGODB_PROD_URL=your-mongodb-url
   # ... add all other variables
   ```

### Option 3: VPS (DigitalOcean, AWS EC2)

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/your-repo/rapi-dito.git
   cd rapi-dito/Backend
   npm install
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Start with PM2**
   ```bash
   pm2 start server.js --name rapidito-api
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name api.rapidito.app;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.rapidito.app
   ```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd Frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all VITE_* variables

### Option 2: Netlify

1. **Build Settings**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Base Directory**: `Frontend`

2. **Deploy**
   ```bash
   cd Frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Static Hosting (S3, CloudFlare Pages)

1. **Build**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Upload `dist` folder** to your static hosting provider

---

## 🗄️ Database Setup

### MongoDB Atlas Setup

1. **Create Cluster**
   - Go to MongoDB Atlas
   - Create new cluster (M0 Free Tier for testing, M10+ for production)
   - Choose region closest to your users

2. **Configure Network Access**
   - Add IP addresses or allow access from anywhere (0.0.0.0/0)
   - For production, whitelist only your server IPs

3. **Create Database User**
   - Create user with readWrite permissions
   - Use strong password

4. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/rapidito?retryWrites=true&w=majority
   ```

5. **Create Indexes** (run in MongoDB shell)
   ```javascript
   // Geospatial index for captain locations
   db.captains.createIndex({ "location": "2dsphere" });
   
   // Compound indexes for rides
   db.rides.createIndex({ user: 1, status: 1 });
   db.rides.createIndex({ captain: 1, status: 1 });
   db.rides.createIndex({ status: 1, createdAt: -1 });
   ```

---

## 🔌 External Services

### Mapbox Setup

1. **Create Account** at mapbox.com
2. **Get Access Token** from Account → Tokens
3. **Configure Scopes**:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
   - `geocoding`
   - `directions`

### Cloudinary Setup

1. **Create Account** at cloudinary.com
2. **Get Credentials** from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Email Service (SendGrid)

1. **Create Account** at sendgrid.com
2. **Create API Key** with Mail Send permissions
3. **Verify Sender** email address

---

## ✅ Production Checklist

### Security
- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] MONGODB_PROD_URL uses TLS/SSL
- [ ] CORS is configured for specific domain only
- [ ] Rate limiting is enabled
- [ ] Helmet.js is active
- [ ] All API keys are in environment variables (not in code)
- [ ] HTTPS is enabled on all endpoints

### Performance
- [ ] MongoDB indexes are created
- [ ] Node.js is running in production mode
- [ ] Static assets are served via CDN
- [ ] Gzip compression is enabled

### Monitoring
- [ ] Health check endpoint is accessible
- [ ] Error logging is configured
- [ ] Uptime monitoring is set up
- [ ] Database backup is scheduled

### Testing
- [ ] All critical flows tested in production
- [ ] Socket.io connections work
- [ ] Email sending works
- [ ] Map services work
- [ ] Image uploads work

---

## 📊 Monitoring & Maintenance

### Health Check

```bash
# Check API health
curl https://api.rapidito.app/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": 1702500000000,
  "mongodb": "connected",
  "environment": "production"
}
```

### Log Monitoring

```bash
# PM2 logs
pm2 logs rapidito-api

# Tail last 100 lines
pm2 logs rapidito-api --lines 100
```

### Database Backup

```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." /backups/20231213
```

### Scaling

For high traffic:
1. **Horizontal Scaling**: Add more server instances behind load balancer
2. **Database**: Upgrade MongoDB Atlas tier or add read replicas
3. **Caching**: Add Redis for session/data caching
4. **CDN**: Use CloudFlare or AWS CloudFront for static assets

---

## 🆘 Troubleshooting

### Common Issues

**Socket.io not connecting**
- Check CORS configuration
- Ensure WebSocket upgrade is allowed by proxy
- Verify CLIENT_URL matches frontend domain

**MongoDB connection fails**
- Check IP whitelist in Atlas
- Verify connection string format
- Check network connectivity

**Maps not loading**
- Verify Mapbox token is valid
- Check token permissions
- Ensure billing is set up for production usage

**Emails not sending**
- Verify sender email is authenticated
- Check API key permissions
- Review email service logs

---

## 📞 Support

For deployment issues:
- Check GitHub Issues
- Review server logs
- Contact: support@rapidito.app

---

*Last Updated: December 2024*
