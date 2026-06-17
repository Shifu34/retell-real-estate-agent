/**
 * setup-agent.js
 * Run once: `npm run setup`
 * Creates the real estate AI agent in Retell and prints the Agent ID.
 * Paste the Agent ID into your .env file as RETELL_AGENT_ID
 */

import 'dotenv/config';
import Retell from 'retell-sdk';
import { AGENT_CONFIG } from './config/agent.js';

const API_KEY = process.env.RETELL_API_KEY;

if (!API_KEY || API_KEY === 'your_retell_api_key_here') {
  console.error('\n❌  RETELL_API_KEY is not set in your .env file.');
  console.error('    Copy .env.example → .env and fill in your key.\n');
  process.exit(1);
}

const client = new Retell({ apiKey: API_KEY });

async function setupAgent() {
  console.log('\n🚀 Creating Real Estate AI Agent on Retell...\n');

  try {
    // Step 1: Create an LLM (the brain of the agent)
    console.log('  1/2 Creating LLM...');
    const llm = await client.llm.create({
      model: AGENT_CONFIG.model,
      general_prompt: AGENT_CONFIG.system_prompt,
      general_tools: [],
    });

    console.log(`     ✅ LLM created: ${llm.llm_id}`);

    // Step 2: Create the Agent
    console.log('  2/2 Creating Agent...');
    const agent = await client.agent.create({
      agent_name: `${AGENT_CONFIG.name} — Real Estate AI Agent`,
      response_engine: {
        type: 'retell-llm',
        llm_id: llm.llm_id,
      },
      voice_id: AGENT_CONFIG.voice_id,
      voice_speed: AGENT_CONFIG.voice_speed,
      enable_backchannel: AGENT_CONFIG.enable_backchannel,
      language: AGENT_CONFIG.language,
    });

    console.log(`     ✅ Agent created: ${agent.agent_id}`);
    console.log('\n' + '─'.repeat(55));
    console.log('✅  SETUP COMPLETE!');
    console.log('─'.repeat(55));
    console.log('\n📋  Add this to your .env file:\n');
    console.log(`   RETELL_AGENT_ID=${agent.agent_id}\n`);
    console.log('Then run:  npm run dev\n');
    console.log('─'.repeat(55) + '\n');

  } catch (err) {
    console.error('\n❌ Error creating agent:');
    if (err?.status === 401) {
      console.error('   Invalid API key. Check your RETELL_API_KEY in .env\n');
    } else if (err?.status === 422) {
      console.error('   Invalid parameters:', err?.error?.detail || err.message);
      console.error('   Try changing the voice_id in setup-agent.js\n');
    } else {
      console.error('  ', err?.message || err);
    }
    process.exit(1);
  }
}

setupAgent();
