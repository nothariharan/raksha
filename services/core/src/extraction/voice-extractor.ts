/**
 * Voice Audio & Speech Transcript Extractor
 * Normalizes speech recognition transcripts across languages into language-neutral candidate facts.
 */

import { ExtractedFraudCandidate, ExtractionInput } from "./extraction-types.js";
import { TextExtractor } from "./text-extractor.js";

export class VoiceExtractor {
  static extract(input: ExtractionInput): ExtractedFraudCandidate {
    const sourceId = input.sourceId || "voice#1";
    let transcript = input.content;

    // Normalizing common spoken language variations
    transcript = transcript
      .replace(/paanch\s*hazaar|panch\s*hazar|paanch\s*hazar/gi, "5000")
      .replace(/pachaas\s*hazaar|pachas\s*hazar/gi, "50000")
      .replace(/satattar\s*hazaar|pachattar\s*hazar|pachhatar\s*hazar/gi, "75000")
      .replace(/dus\s*hazaar|das\s*hazar/gi, "10000");

    const textCandidate = TextExtractor.extract({
      ...input,
      content: transcript,
      sourceId,
    });

    return {
      ...textCandidate,
      sourceRefs: {
        ...textCandidate.sourceRefs,
        voiceTranscript: [sourceId],
      },
    };
  }
}
