function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const configuration = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: requiredEnv('MONGODB_URI'),
  },
  jwt: {
    secret: requiredEnv('JWT_SECRET'),
    refreshSecret: requiredEnv('JWT_REFRESH_SECRET'),
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
