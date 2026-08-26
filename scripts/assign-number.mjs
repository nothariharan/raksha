const apiKey = 'sk_20919595499da8a8d3cd5b955b34ad27c58c5d9259fb3f40';
const phoneId = 'phnum_5001kxw50m7zen88dng3n4e2gp6p';
const agentId = 'agent_1201kxw5b2fvearadb4p3brmtya9';

async function assignNumberToRaksha() {
  const url = `https://api.elevenlabs.io/v1/convai/phone-numbers/${phoneId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: agentId,
      label: 'Raksha Emergency Cyber Helpline'
    })
  });
  console.log('Update status:', res.status);
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

assignNumberToRaksha();
