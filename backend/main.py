from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import time

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Eve state
eve_enabled = False
attack_type = "intercept"


@app.get("/run")
def run_bb84(n: int = 20, noise: float = 0.0, attack_prob: float = 0.0, speed: float = 0.0):
    start_time = time.time()

    # Alice
    alice_bits = [random.randint(0, 1) for _ in range(n)]
    alice_bases = [random.choice(["Z", "X"]) for _ in range(n)]

    eve_bases = []
    eve_results = []

    bob_bases = [random.choice(["Z", "X"]) for _ in range(n)]
    bob_results = []

    for i in range(n):
        bit = alice_bits[i]
        basis = alice_bases[i]

        # Eve attack
        if eve_enabled and random.random() < attack_prob:
            eve_basis = random.choice(["Z", "X"])
            eve_bases.append(eve_basis)

            if eve_basis == basis:
                eve_bit = bit
            else:
                eve_bit = random.randint(0, 1)

            eve_results.append(eve_bit)

            # Eve resends
            transmitted_bit = eve_bit
            transmitted_basis = eve_basis
        else:
            eve_bases.append(None)
            eve_results.append(None)
            transmitted_bit = bit
            transmitted_basis = basis

        # Bob measurement
        if bob_bases[i] == transmitted_basis:
            bob_bit = transmitted_bit
        else:
            bob_bit = random.randint(0, 1)

        # Noise
        if random.random() < noise:
            bob_bit = 1 - bob_bit

        bob_results.append(bob_bit)

    # Sifting
    sifted_alice = []
    sifted_bob = []

    for i in range(n):
        if alice_bases[i] == bob_bases[i]:
            sifted_alice.append(alice_bits[i])
            sifted_bob.append(bob_results[i])

    # Error rate
    errors = sum(1 for a, b in zip(sifted_alice, sifted_bob) if a != b)
    error_rate = errors / len(sifted_alice) if sifted_alice else 0

    eve_detected = error_rate > 0.1

    final_key = "".join(map(str, sifted_bob)) if not eve_detected else None

    end_time = time.time()

    return {
        "parameters": {
            "qubits": n,
            "noise": noise,
            "attack_type": attack_type,
            "attack_probability": attack_prob,
            "transfer_speed_sec_per_qubit": speed,
        },
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "eve_bases": eve_bases,
        "eve_results": eve_results,
        "bob_bases": bob_bases,
        "bob_results": bob_results,
        "sifted_key_alice": sifted_alice,
        "sifted_key_bob": sifted_bob,
        "corrected_key": sifted_bob,
        "error_rate": error_rate,
        "eve_detected": eve_detected,
        "final_secure_key": final_key,
        "performance": {
            "total_time_sec": end_time - start_time,
            "bits_per_second": len(sifted_bob) / (end_time - start_time + 1e-6),
        },
    }


@app.post("/toggle-eve")
def toggle_eve(enable: bool, attack: str = "intercept"):
    global eve_enabled, attack_type
    eve_enabled = enable
    attack_type = attack

    return {
        "eve_enabled": eve_enabled,
        "attack_type": attack_type,
    }