const apiKey = 'sk_20919595499da8a8d3cd5b955b34ad27c58c5d9259fb3f40';
const voiceId = '21m00Tcm4TlvDq8ikWAM';
const text = 'नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। बताइए क्या हुआ?';

async function testTts() {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });
  console.log('ElevenLabs TTS status:', res.status);
  const arrayBuffer = await res.arrayBuffer();
  console.log('Audio bytes received:', arrayBuffer.byteLength);
}

testTts();
