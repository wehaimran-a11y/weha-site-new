// WeHA AI API helpers — extracted from frontend/src/lib/api.js when the
// WeHA AI feature was moved out of the live site. Re-add these to lib/api.js
// to re-enable the feature.
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

// WeHA AI — chat with the automation assistant.
export async function sendWehaAiMessage({ session_id, messages, model }) {
  const { data } = await axios.post(`${API}/weha-ai/chat`, { session_id, messages, model });
  return data; // { reply, model, mocked }
}

export async function fetchWehaAiModels() {
  const { data } = await axios.get(`${API}/weha-ai/models`);
  return data; // { models: [...], default: "..." }
}
