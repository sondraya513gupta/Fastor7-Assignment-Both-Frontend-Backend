import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Fastor CRM Backend is running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📖 API Docs:     http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
