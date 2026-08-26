const apiKey = 'sk_20919595499da8a8d3cd5b955b34ad27c58c5d9259fb3f40';
const agentId = 'agent_1201kxw5b2fvearadb4p3brmtya9';

async function getSignedUrl() {
  const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
  const res = await fetch(url, {
    headers: { 'xi-api-key': apiKey }
  });
  console.log('Signed URL status:', res.status);
  const data = await res.json();
  console.log('Signed URL data:', JSON.stringify(data, null, 2));
}

getSignedUrl();
