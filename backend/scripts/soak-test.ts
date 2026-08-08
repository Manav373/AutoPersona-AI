import fetch from "node-fetch";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PERSONA = { name: "Alice", domain: "AI Security" };

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("🚀 Starting soak test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Persona: ${JSON.stringify(PERSONA)}`);

  try {
    // 1. Init
    console.log("\n📝 Calling POST /api/agent/init");
    const initRes = await fetch(`${BASE_URL}/api/agent/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona: PERSONA }),
    });

    if (!initRes.ok) {
      throw new Error(`Init failed: ${initRes.status}`);
    }

    const { agentId } = (await initRes.json()) as { agentId: string };
    console.log(`✅ Agent initialized: ${agentId}`);

    // 2. Poll feed every 10 seconds for 2 minutes in DEV_FAST_CYCLE mode
    const pollDuration = process.env.DEV_FAST_CYCLE ? 120000 : 300000; // 2min or 5min
    const pollInterval = 10000; // 10 seconds
    const startTime = Date.now();

    console.log(`\n🔄 Polling feed for ${pollDuration / 1000}s...`);

    let postCount = 0;
    let previousPostCount = 0;

    while (Date.now() - startTime < pollDuration) {
      const feedRes = await fetch(`${BASE_URL}/api/agent/feed?agentId=${agentId}`);

      if (!feedRes.ok) {
        throw new Error(`Feed failed: ${feedRes.status}`);
      }

      const { posts } = (await feedRes.json()) as { posts: any[] };
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (posts.length > previousPostCount) {
        console.log(`\n📰 [${elapsed}s] New posts! Total: ${posts.length}`);

        for (let i = previousPostCount; i < posts.length; i++) {
          const post = posts[i];
          console.log(`\n  Post #${i + 1} (${post.id})`);
          console.log(`  Created: ${post.createdAt}`);
          console.log(`  Text: ${post.text.slice(0, 100)}...`);
          console.log(`  Rationale: ${post.rationale.slice(0, 100)}...`);
          console.log(`  Sources: ${post.sources.join(", ")}`);
        }

        previousPostCount = posts.length;
      } else {
        process.stdout.write(".");
      }

      await sleep(pollInterval);
    }

    console.log("\n\n✅ Soak test completed!");
    console.log(`Total posts published: ${previousPostCount}`);

    if (previousPostCount > 0) {
      const feedRes = await fetch(`${BASE_URL}/api/agent/feed?agentId=${agentId}`);
      const { posts } = (await feedRes.json()) as { posts: any[] };

      console.log("\n📋 Final Feed:");
      for (const post of posts.slice(0, 3)) {
        console.log(`\n- ${post.id} (${post.createdAt})`);
        console.log(`  "${post.text.slice(0, 80)}..."`);
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

run();
