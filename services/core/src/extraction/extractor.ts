/**
 * Unified Multimodal Extractor
 * Dispatches to specialized modality extractors and validates extracted candidate.
 */

import { ExtractedFraudCandidate, ExtractionInput } from "./extraction-types.js";
import { TextExtractor } from "./text-extractor.js";
import { ImageExtractor } from "./image-extractor.js";
import { VoiceExtractor } from "./voice-extractor.js";

export class MultimodalExtractor {
  static extractCandidate(input: ExtractionInput): ExtractedFraudCandidate {
    switch (input.modality) {
      case "image":
      case "document":
        return ImageExtractor.extract(input);
      case "voice":
        return VoiceExtractor.extract(input);
      case "text":
      case "sms":
      default:
        return TextExtractor.extract(input);
    }
  }
}

export * from "./extraction-types.js";
export * from "./text-extractor.js";
export * from "./image-extractor.js";
export * from "./voice-extractor.js";
export * from "./vision-fireworks.js";
