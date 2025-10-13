import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  fishbowl: {
    baseUrl: process.env.FISHBOWL_BASE_URL,
    username: process.env.FISHBOWL_USERNAME,
    password: process.env.FISHBOWL_PASSWORD,
    appName: process.env.FISHBOWL_APP_NAME,
    appDescription: process.env.FISHBOWL_APP_DESCRIPTION,
    appId: process.env.FISHBOWL_APP_ID,
  },
};
