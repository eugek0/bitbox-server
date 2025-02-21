import { Configuration } from "./types";

const configuration: Configuration = () => ({
  app: {
    port: parseInt(process.env.PORT),
    mongoUri: process.env.MONGO_URI,
    origin: process.env.ORIGIN,
    accessSecret: process.env.ACCESS_SECRET,
    accessExpires: process.env.ACCESS_EXPIRES,
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpires: process.env.REFRESH_EXPIRES,
    adminLogin: process.env.ADMIN_LOGIN,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
});

export default configuration;
