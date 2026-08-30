// Framework-free self-check for the only non-trivial pure logic.
// Run: npx tsx lib/absurd.selfcheck.ts
import assert from "node:assert";
import { lifeScore, lifeVerdict, penaltyFor } from "./absurd";

// life score band
assert.equal(lifeVerdict(lifeScore({ caffeine: 5, tabs: 10, regret: 3, willToLive: 3 })), "ok");
assert.equal(lifeVerdict(lifeScore({ caffeine: 1, tabs: 1, regret: 1, willToLive: 90 })), "low");
assert.equal(lifeVerdict(lifeScore({ caffeine: 10, tabs: 40, regret: 9, willToLive: 0 })), "high");

// sentence escalation
assert.equal(penaltyFor(1), 1);
assert.equal(penaltyFor(2), 2);
assert.equal(penaltyFor(5), 5);

console.log("absurd selfcheck OK");
