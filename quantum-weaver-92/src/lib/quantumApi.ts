const API_BASE_URL =
  import.meta.env.VITE_QUANTUM_API_URL || "http://127.0.0.1:8000";

export interface BB84RunParams {
  n?: number;
  noise?: number;
  attack_prob?: number;
  speed?: number;
}

export interface BB84Result {
  parameters: any;
  alice_bits: number[];
  alice_bases: string[];
  eve_bases: (string | null)[];
  eve_results: (number | null)[];
  bob_bases: string[];
  bob_results: number[];
  sifted_key_alice: number[];
  sifted_key_bob: number[];
  corrected_key: number[];
  error_rate: number;
  eve_detected: boolean;
  final_secure_key: string | null;
  performance: any;
}

export async function runBB84(params: BB84RunParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.n) searchParams.set("n", String(params.n));
  if (params.noise) searchParams.set("noise", String(params.noise));
  if (params.attack_prob)
    searchParams.set("attack_prob", String(params.attack_prob));

  const url = `${API_BASE_URL}/run?${searchParams.toString()}`;

  console.log("Calling:", url);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function toggleEve(enable: boolean) {
  const res = await fetch(
    `${API_BASE_URL}/toggle-eve?enable=${enable}`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}