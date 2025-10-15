import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:5001";

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

export async function seeTable() {
  const response = await axios.get(`${BACKEND_BASE_URL}/api/fishbowl/seetable`);
  console.log(response.data);
}
