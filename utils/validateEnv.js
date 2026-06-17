/**
 * utils/validateEnv.js
 * Validates required environment variables on startup.
 * Exits with a clear error message if anything is missing or still set to the placeholder.
 */

const REQUIRED = [
  {
    key: 'RETELL_API_KEY',
    placeholder: 'your_retell_api_key_here',
    hint: 'Get it from dashboard.retellai.com → Settings → API Keys',
  },
  {
    key: 'RETELL_AGENT_ID',
    placeholder: 'your_agent_id_here',
    hint: 'Run `npm run setup` to create your agent and get the ID',
  },
];

/**
 * Validates all required env vars. Exits process if any are missing.
 * @param {boolean} [strict=true] - if false, only warn instead of exiting
 */
export function validateEnv(strict = true) {
  const errors = [];

  for (const { key, placeholder, hint } of REQUIRED) {
    const val = process.env[key];
    if (!val || val.trim() === placeholder || val.trim() === '') {
      errors.push({ key, hint });
    }
  }

  if (errors.length === 0) return;

  console.error('\n' + '─'.repeat(52));
  console.error('  ❌  Missing environment variables:');
  console.error('─'.repeat(52));
  for (const { key, hint } of errors) {
    console.error(`\n  ${key}`);
    console.error(`  → ${hint}`);
  }
  console.error('\n  Copy .env.example → .env and fill in the values.');
  console.error('─'.repeat(52) + '\n');

  if (strict) process.exit(1);
}
