/**
 * setup-agent.js
 * Run once: `npm run setup`
 * Creates the real estate AI agent in Retell and prints the Agent ID.
 * Paste the Agent ID into your .env file as RETELL_AGENT_ID
 */

import 'dotenv/config';
import Retell from 'retell-sdk';

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
      model: 'gpt-4o',
      general_prompt: `You are Aria, a knowledgeable and friendly AI real estate agent assistant. 
Your job is to help buyers, sellers, and renters with all their real estate needs.

You can help with:
- Answering questions about property listings, prices, and neighborhoods
- Explaining the home buying and selling process step by step
- Discussing mortgage basics and affordability
- Scheduling property tours and follow-up appointments
- Qualifying buyer needs (budget, timeline, location preferences, must-haves)
- Providing market insights and trends

Your personality:
- Warm, professional, and patient
- Use simple language, avoid too much jargon
- Be proactive — ask clarifying questions to understand needs
- Keep responses concise for voice (2-3 sentences max per turn)
- Sound natural, like a real human agent would

Start by greeting the caller and asking how you can help them today.`,
      general_tools: [],
    });

    console.log(`     ✅ LLM created: ${llm.llm_id}`);

    // Step 2: Create the Agent
    console.log('  2/2 Creating Agent...');
    const agent = await client.agent.create({
      agent_name: 'Aria — Real Estate AI Agent',
      response_engine: {
        type: 'retell-llm',
        llm_id: llm.llm_id,
      },
      voice_id: '11labs-Adrian',   // Natural, professional male voice
      voice_speed: 1.0,
      enable_backchannel: true,     // "mm-hmm", "yeah" during pauses
      language: 'en-US',
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
