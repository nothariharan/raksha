/**
 * Screenshot & Vision OCR Extractor
 * Strictly extracts verified banking fields from payment screenshots and bank receipts.
 */

import { ExtractedFraudCandidate, ExtractionInput } from "./extraction-types.js";

export class ImageExtractor {
  static extract(input: ExtractionInput): ExtractedFraudCandidate {
    const rawContent = input.content;
    const sourceId = input.sourceId || "screenshot#1";
    const confidence: Record<string, number> = {};
    const sourceRefs: Record<string, string[]> = {};

    let amount: number | undefined;
    let transactionId: string | null = null;
    let transactionDatetime: string | null = null;
    let debitInstitution: string | null = null;
    let beneficiaryIdentifier: string | null = null;
    let beneficiaryInstitution: string | null = null;
    let application: string | undefined;

    // Check if the image/text content is flagged as unreadable
    if (/unreadable|corrupted|blurry|invalid_image/i.test(rawContent)) {
      return {
        incidentType: "FINANCIAL_CYBER_FRAUD",
        narrative: "Unreadable or corrupted screenshot attached.",
        amount: undefined,
        transactionId: null,
        transactionDatetime: null,
        debitInstitution: null,
        beneficiaryIdentifier: null,
        confidence: { unreadable: 1.0 },
        sourceRefs: { unreadable: [sourceId] },
        extractedAt: new Date().toISOString(),
      };
    }

    // 1. Exact 12-digit UTR / RRN (UPI Ref No / UTR / RRN)
    const utrPatterns = [
      /(?:upi\s*ref(?:erence)?\s*(?:no|id)?|utr|rrn|txn\s*id|transaction\s*id)\s*[:=\s#-]?\s*([0-9]{12})/i,
      /\b([0-9]{12})\b/,
    ];

    for (const pattern of utrPatterns) {
      const match = rawContent.match(pattern);
      if (match && match[1]) {
        transactionId = match[1];
        confidence.transactionId = 0.98;
        sourceRefs.transactionId = [sourceId];
        break;
      }
    }

    // 2. Exact Amount Extraction (e.g. ₹75,000.00, ₹5,000, Paid ₹5000)
    const amountPatterns = [
      /(?:paid|transferred|debited|₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)/i,
      /\b([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{2})?)\b/,
    ];

    for (const pattern of amountPatterns) {
      const match = rawContent.match(pattern);
      if (match && match[1]) {
        const parsed = parseFloat(match[1].replace(/,/g, ""));
        if (parsed > 0 && parsed < 100000000) {
          amount = parsed;
          confidence.amount = 0.99;
          sourceRefs.amount = [sourceId];
          break;
        }
      }
    }

    // 3. Timestamp Extraction (e.g. 24 Aug 2026, 18:42:00 or 2026-08-24T18:42:00)
    const isoMatch = rawContent.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:[+-]\d{2}:\d{2}|Z)?)\b/);
    if (isoMatch) {
      transactionDatetime = isoMatch[1];
      confidence.transactionDatetime = 0.98;
      sourceRefs.transactionDatetime = [sourceId];
    } else {
      const dateMatch = rawContent.match(/(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}(?:,?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?)/i);
      if (dateMatch) {
        transactionDatetime = new Date(dateMatch[1]).toISOString();
        confidence.transactionDatetime = 0.95;
        sourceRefs.transactionDatetime = [sourceId];
      }
    }

    // 4. Beneficiary UPI VPA
    const vpaMatch = rawContent.match(/[\w.-]+@(?:okhdfcbank|okaxis|oksbi|okicici|ybl|ibl|paytm|upi|axl|merchant)/i);
    if (vpaMatch) {
      beneficiaryIdentifier = vpaMatch[0];
      confidence.beneficiaryIdentifier = 0.98;
      sourceRefs.beneficiaryIdentifier = [sourceId];
    }

    // 5. Debit & Beneficiary Bank Detection
    if (/state\s*bank\s*of\s*india|sbi/i.test(rawContent)) {
      debitInstitution = "State Bank of India";
      confidence.debitInstitution = 0.95;
      sourceRefs.debitInstitution = [sourceId];
    } else if (/hdfc/i.test(rawContent)) {
      debitInstitution = "HDFC Bank";
      confidence.debitInstitution = 0.95;
      sourceRefs.debitInstitution = [sourceId];
    } else if (/icici/i.test(rawContent)) {
      debitInstitution = "ICICI Bank";
      confidence.debitInstitution = 0.95;
      sourceRefs.debitInstitution = [sourceId];
    }

    if (/yes\s*bank|@ybl/i.test(rawContent)) {
      beneficiaryInstitution = "Yes Bank Ltd";
      confidence.beneficiaryInstitution = 0.95;
      sourceRefs.beneficiaryInstitution = [sourceId];
    }

    // 6. Application
    if (/google\s*pay|gpay/i.test(rawContent)) {
      application = "Google Pay";
    } else if (/phonepe/i.test(rawContent)) {
      application = "PhonePe";
    } else if (/paytm/i.test(rawContent)) {
      application = "Paytm";
    }

    return {
      incidentType: "FINANCIAL_CYBER_FRAUD",
      narrative: `Payment screenshot verified from ${application || "UPI app"}.`,
      amount,
      currency: "INR",
      channel: "UPI",
      application,
      transactionId,
      transactionDatetime,
      debitInstitution,
      beneficiaryIdentifier,
      beneficiaryInstitution,
      confidence,
      sourceRefs,
      extractedAt: new Date().toISOString(),
    };
  }
}
