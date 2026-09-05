import assert from "node:assert/strict";
import { normalizeElevenLabsToolRequest } from "@raksha/agent-phone";

function testWrappedPayload(): void {
  const parsed = normalizeElevenLabsToolRequest({
    body: {
      tool_name: "raksha_start_incident",
      tool_call_id: "tc-1",
      caller_id: "+918056135790",
      conversation_id: "conv-1",
      parameters: { narrative: "I paid 5000 from SBI" },
    },
  });
  assert.equal(parsed.toolName, "raksha_start_incident");
  assert.equal(parsed.callerNumber, "+918056135790");
  assert.equal(parsed.parameters.narrative, "I paid 5000 from SBI");
  console.log("  ✓ wrapped ElevenLabs tool payload");
}

function testPstnWebhookBody(): void {
  const parsed = normalizeElevenLabsToolRequest({
    body: {
      tool_name: "raksha_process_input",
      caller_id: "+918056135790",
      system__conversation_id: "conv-2",
      userSpeech: "my UTR is 123456789012",
    },
  });
  assert.equal(parsed.toolName, "raksha_process_input");
  assert.equal(parsed.conversationId, "conv-2");
  assert.equal(parsed.parameters.userSpeech, "my UTR is 123456789012");
  console.log("  ✓ PSTN webhook body with system caller fields");
}

function testInferStartFromNarrative(): void {
  const parsed = normalizeElevenLabsToolRequest({
    body: { narrative: "tax scam paid 5000", system__caller_id: "+919811100001" },
  });
  assert.equal(parsed.toolName, "raksha_start_incident");
  assert.equal(parsed.callerNumber, "+919811100001");
  console.log("  ✓ infers start_incident from narrative");
}

async function run(): Promise<void> {
  console.log("\n  ElevenLabs PSTN webhook parse\n");
  testWrappedPayload();
  testPstnWebhookBody();
  testInferStartFromNarrative();
  console.log("\n  ALL ELEVENLABS WEBHOOK PARSE CHECKS PASSED\n");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
