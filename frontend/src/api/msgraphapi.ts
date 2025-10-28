import axios from "axios";
import { BACKEND_BASE_URL } from "./fishbowlapi";

export async function getMail() {
  try {
    const response = await axios.get(`${BACKEND_BASE_URL}/api/msgraph/getmail`);
    console.log(response);
    return response;
  } catch (error: any) {
    console.log(`Error: ${error.message}: ${error.response?.data}`);
    throw error;
  }
}
