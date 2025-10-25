import axios from "axios";
import { BACKEND_BASE_URL } from "./fishbowlapi";

export async function callAgent(input: string) {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/api/agent/input`, {
      input: input,
    });
    console.log(response.data.agentResponse);
    return response.data;
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}
