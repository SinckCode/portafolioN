const configuration = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-super-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS || 'http://localhost:3000',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  oauth: {
    // Base pública del API para construir los callback URLs
    callbackBase: process.env.OAUTH_CALLBACK_BASE || 'http://localhost:4000',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@angelonesto.com',
  },
});

export default configuration;
