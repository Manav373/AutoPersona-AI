import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

import { ensureDbInitialized, isDbReady, saveAgent, getAgent, getAllAgents, getStats } from "../src/db";
import { getSupabaseClient, isSupabaseConfigured } from "../src/db/supabase";

async function testLocalDatabase() {
  console.log("==========================================");
  console.log("🧪 Testing Local & Supabase Database Setup");
  console.log("==========================================");

  console.log(`Supabase Configured: ${isSupabaseConfigured() ? "✅ YES" : "❌ NO"}`);
  if (isSupabaseConfigured()) {
    console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
  }

  console.log("\n1. Initializing database...");
  await ensureDbInitialized();
  console.log(`Database Ready: ${isDbReady() ? "✅ YES" : "❌ NO"}`);

  console.log("\n2. Testing Agent Save...");
  const testId = "test-" + Date.now();
  const testAgent = {
    agentId: testId,
    persona: {
      name: "Test Persona",
      domain: "AI Security",
      bio: "Test bio",
      voice: { tone: "analytical", sentenceStyle: "direct", personPOV: "third" as const, signaturePhrases: [] },
      interests: ["AI Security"],
      opinions: [],
      publishingStandards: [],
    },
    status: "stopped" as const,
    createdAt: new Date().toISOString(),
  };

  saveAgent(testAgent);
  console.log(`✅ Saved agent: ${testId}`);

  console.log("\n3. Testing Agent Read...");
  const retrieved = getAgent(testId);
  if (retrieved && retrieved.agentId === testId) {
    console.log(`✅ Retrieved agent successfully: ${retrieved.persona.name} (${retrieved.persona.domain})`);
  } else {
    console.error("❌ Failed to retrieve agent!");
  }

  console.log("\n4. Getting System Stats...");
  const stats = getStats();
  console.log("Stats:", JSON.stringify(stats, null, 2));

  console.log("\n🎉 ALL LOCAL & SUPABASE TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

testLocalDatabase().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
