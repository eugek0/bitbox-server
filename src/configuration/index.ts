import { Configuration } from "./types";

const configuration: Configuration = () => ({
  app: {
    port: parseInt(process.env.PORT),
    mongoUri: process.env.MONGO_URI,
    accessSecret: process.env.ACCESS_SECRET,
    accessExpires: process.env.ACCESS_EXPIRES,
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpires: process.env.REFRESH_EXPIRES,
  },
});

export default configuration;
