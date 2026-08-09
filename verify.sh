#!/usr/bin/env bash
set -e

echo "🔍 Verifying Autonomous AI Creator build..."
echo ""

# Check dist files exist
echo "✅ Checking compiled output..."
[ -f dist/index.js ] && echo "  - index.js ✓" || (echo "  - index.js ✗" && exit 1)
[ -f dist/db.js ] && echo "  - db.js ✓" || (echo "  - db.js ✗" && exit 1)
[ -f dist/scheduler.js ] && echo "  - scheduler.js ✓" || (echo "  - scheduler.js ✗" && exit 1)
[ -f dist/anthropic-client.js ] && echo "  - anthropic-client.js ✓" || (echo "  - anthropic-client.js ✗" && exit 1)

echo ""
echo "✅ Checking configuration files..."
[ -f package.json ] && echo "  - package.json ✓" || (echo "  - package.json ✗" && exit 1)
[ -f tsconfig.json ] && echo "  - tsconfig.json ✓" || (echo "  - tsconfig.json ✗" && exit 1)
[ -f .env.example ] && echo "  - .env.example ✓" || (echo "  - .env.example ✗" && exit 1)
[ -f README.md ] && echo "  - README.md ✓" || (echo "  - README.md ✗" && exit 1)
[ -f AI_USAGE.md ] && echo "  - AI_USAGE.md ✓" || (echo "  - AI_USAGE.md ✗" && exit 1)

echo ""
echo "✅ Checking test files..."
[ -f tests/api.test.ts ] && echo "  - tests/api.test.ts ✓" || (echo "  - tests/api.test.ts ✗" && exit 1)
[ -f scripts/soak-test.ts ] && echo "  - scripts/soak-test.ts ✓" || (echo "  - scripts/soak-test.ts ✗" && exit 1)

echo ""
echo "✅ All checks passed!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy .env.example to .env and add your ANTHROPIC_API_KEY"
echo "  2. Run: npm start"
echo "  3. In another terminal, test with:"
echo "     curl -X POST http://localhost:3000/api/agent/init \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"persona\": {\"name\": \"Ada\", \"domain\": \"AI Security\"}}'"
