/**
 * Local / Ephemeral OCR Parser for Document Vault
 * Extracts expiry dates, passport numbers, baggage limits from document text or simulated scan.
 */

export interface ParsedDocumentData {
  documentType: 'passport' | 'flight_ticket' | 'hall_ticket' | 'prescription' | 'other';
  documentNumber?: string;
  expiryDate?: string;
  baggageAllowanceKg?: number;
  extractedTitle?: string;
  notes?: string;
}

class OCRService {
  parseDocumentText(rawText: string): ParsedDocumentData {
    const text = rawText.toUpperCase();
    const result: ParsedDocumentData = {
      documentType: 'other'
    };

    // 1. Detect Passport
    if (text.includes('PASSPORT') || text.includes('REPUBLIC') || text.match(/[A-Z][0-9]{7,8}/)) {
      result.documentType = 'passport';
      result.extractedTitle = 'Passport Document';

      // Look for passport number pattern (e.g. Z8472910, A1234567)
      const passMatch = text.match(/\b([A-Z][0-9]{7,8})\b/);
      if (passMatch) {
        result.documentNumber = passMatch[1];
      }

      // Look for expiry date (e.g. 2027-04-10 or 10/04/2027)
      const dateMatch = text.match(/\b(20[2-3][0-9][-/.][0-1][0-9][-/.][0-3][0-9])\b/) ||
                        text.match(/\b([0-3]?[0-9][-/.][0-1]?[0-9][-/.](?:20)?[2-3][0-9])\b/);
      if (dateMatch) {
        result.expiryDate = this.normalizeDate(dateMatch[1]);
      }
    }
    // 2. Flight Ticket / Boarding Pass
    else if (text.includes('FLIGHT') || text.includes('AIRLINE') || text.includes('PNR') || text.includes('BAGGAGE') || text.includes('KG')) {
      result.documentType = 'flight_ticket';
      result.extractedTitle = 'Airline E-Ticket';

      // PNR match
      const pnrMatch = text.match(/\bPNR[:\s]*([A-Z0-9]{6})\b/i);
      if (pnrMatch) {
        result.documentNumber = `PNR: ${pnrMatch[1].toUpperCase()}`;
      }

      // Baggage Allowance extraction (e.g. "23KG", "CHECK-IN 23 KG", "15 KG")
      const bagMatch = text.match(/(\d{1,2})\s*(?:KG|KGS)\b/i);
      if (bagMatch) {
        const allowance = parseInt(bagMatch[1], 10);
        if (allowance >= 7 && allowance <= 40) {
          result.baggageAllowanceKg = allowance;
          result.notes = `Extracted airline baggage allowance: ${allowance}kg`;
        }
      }
    }
    // 3. Hall Ticket / Exam Admit Card
    else if (text.includes('HALL TICKET') || text.includes('ADMIT CARD') || text.includes('EXAM') || text.includes('ROLL NO')) {
      result.documentType = 'hall_ticket';
      result.extractedTitle = 'Exam Hall Ticket';

      const rollMatch = text.match(/\bROLL\s*(?:NO|NUMBER)?[:\s]*([A-Z0-9-]{4,15})\b/i);
      if (rollMatch) {
        result.documentNumber = `Roll: ${rollMatch[1]}`;
      }
    }

    return result;
  }

  // Check 6-month passport validity against trip return date
  checkSixMonthPassportRule(expiryDateStr: string, returnDateStr?: string): {
    isValid: boolean;
    monthsRemaining: number;
    warningMessage?: string;
  } {
    if (!expiryDateStr) {
      return { isValid: true, monthsRemaining: 99 };
    }

    const expiry = new Date(expiryDateStr);
    const targetDate = returnDateStr ? new Date(returnDateStr) : new Date();

    const diffMs = expiry.getTime() - targetDate.getTime();
    const monthsRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4));

    if (monthsRemaining < 6) {
      return {
        isValid: false,
        monthsRemaining,
        warningMessage: monthsRemaining <= 0 
          ? 'Passport is EXPIRED or expires before your trip! Immediate renewal required.'
          : `Passport has only ${monthsRemaining} months validity left (${expiryDateStr}). International airlines often enforce the strict 6-month validity rule!`
      };
    }

    return {
      isValid: true,
      monthsRemaining
    };
  }

  private normalizeDate(dateStr: string): string {
    const cleaned = dateStr.replace(/[/. ]/g, '-');
    const parts = cleaned.split('-');
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  }
}

export const ocrService = new OCRService();
