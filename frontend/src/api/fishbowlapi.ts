import axios from "axios";

export const BACKEND_BASE_URL = "http://localhost:5001";

export async function loginToFishbowl() {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/api/fishbowl/test-token`
  );
  console.log(response.data);
}

export async function getInventory() {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/api/fishbowl/inventory`
  );
  console.log(response.data);
}

export async function seeTable(part: string) {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/api/fishbowl/seetable`,
    { params: { partNumber: part } }
  );
  console.log(response.data);
}

export async function seeActivePartNums() {
  const response = await axios.get(
    `${BACKEND_BASE_URL}/api/fishbowl/activeparts`
  );
  console.log(response.data);
}
