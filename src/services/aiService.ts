import { EventCategory, SecurityCategory } from '../types';

export interface GeneratedPlan {
  title: string;
  category: EventCategory;
  destination: string;
  contextualAdvice: string;
  bags: Array<{
    name: string;
    type: 'suitcase' | 'cabin' | 'backpack' | 'school_bag' | 'exam_pouch' | 'document_folio' | 'tote' | 'other';
    maxWeightKg: number;
    tareWeightKg: number;
  }>;
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    estimatedWeightKg: number;
    flagReason?: string;
    securityCategory?: SecurityCategory;
    targetBagIndex: number;
  }>;
  homeTasks: string[];
}

export interface ScannedItemResult {
  name: string;
  category: string;
  estimatedWeightKg: number;
  securityCategory: SecurityCategory;
  flagReason?: string;
  suggestedBagType: 'cabin' | 'suitcase' | 'exam_pouch' | 'backpack';
}

class AIService {
  private getApiKey(): string | null {
    return localStorage.getItem('prep_gemini_api_key') || null;
  }

  setApiKey(key: string) {
    localStorage.setItem('prep_gemini_api_key', key.trim());
  }

  // Generates plan using AI with offline deterministic rule fallback
  async generateEventPlan(prompt: string): Promise<GeneratedPlan> {
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Prep, a calm, warm family packing and event readiness assistant.
Analyze this user request: "${prompt}".
Generate a structured JSON output with:
{
  "title": "short friendly event title",
  "category": "vacation" | "exam" | "doctor" | "errands" | "homecoming" | "weekend" | "custom",
  "destination": "detected city or venue",
  "contextualAdvice": "Warm, practical 2-sentence advice covering weather, regulations or tips",
  "bags": [{"name": "string", "type": "suitcase"|"cabin"|"backpack"|"school_bag"|"exam_pouch"|"document_folio"|"tote", "maxWeightKg": number, "tareWeightKg": number}],
  "items": [{"name": "string", "category": "clothing"|"electronics"|"documents"|"toiletries"|"medicine"|"stationery"|"other", "quantity": number, "estimatedWeightKg": number, "flagReason": "optional warning", "securityCategory": "cabin_only"|"checked_only"|"prohibited_exam"|"allowed", "targetBagIndex": number}],
  "homeTasks": ["household task before leaving"]
}
Only return valid JSON.`
                  }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return JSON.parse(text) as GeneratedPlan;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local heuristic rules:', err);
      }
    }

    // Local deterministic offline fallback
    return this.generateOfflinePlan(prompt);
  }

  private generateOfflinePlan(prompt: string): GeneratedPlan {
    const lower = prompt.toLowerCase();

    // 1. Exam scenario
    if (lower.includes('exam') || lower.includes('test') || lower.includes('finals') || lower.includes('school')) {
      return {
        title: prompt.length < 35 ? prompt : 'School Exam Readiness',
        category: 'exam',
        destination: 'Examination Center',
        contextualAdvice: 'Examination Hall Protocol: Only transparent pouches, blue/black ballpoint pens, and analog watches are allowed. Smartwatches and notes are strictly prohibited.',
        bags: [
          {
            name: 'Clear Exam Pouch & School Bag',
            type: 'exam_pouch',
            maxWeightKg: 4.0,
            tareWeightKg: 0.3
          }
        ],
        items: [
          { name: 'Printed Hall Ticket / Admit Card', category: 'documents', quantity: 1, estimatedWeightKg: 0.05, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Official School / Student ID Card', category: 'documents', quantity: 1, estimatedWeightKg: 0.05, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Blue & Black Ballpoint Pens (x3)', category: 'stationery', quantity: 3, estimatedWeightKg: 0.08, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Transparent Geometry Box & Ruler', category: 'stationery', quantity: 1, estimatedWeightKg: 0.2, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Clear Water Bottle (Label Removed)', category: 'other', quantity: 1, estimatedWeightKg: 0.6, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Smartwatch or Fitness Band', category: 'electronics', quantity: 1, estimatedWeightKg: 0.05, securityCategory: 'prohibited_exam', flagReason: 'Prohibited in exam hall! Switch to an analog watch.', targetBagIndex: 0 }
        ],
        homeTasks: [
          'Verify hall ticket printed copy is kept in backpack front pocket',
          'Ensure sharpener, eraser and spare pencils are placed in clear pouch',
          'Get a full 8-hour sleep and prepare a light breakfast'
        ]
      };
    }

    // 2. Doctor / Medical / Lab checkup
    if (lower.includes('doctor') || lower.includes('clinic') || lower.includes('hospital') || lower.includes('blood') || lower.includes('lab')) {
      return {
        title: prompt.length < 35 ? prompt : 'Clinic & Lab Health Visit',
        category: 'doctor',
        destination: 'Medical Clinic',
        contextualAdvice: 'Health Checklist: Remember to fast 10-12 hours beforehand if sugar or lipid profile tests are scheduled. Keep past prescription history handy.',
        bags: [
          {
            name: 'Medical Folio & Health Bag',
            type: 'document_folio',
            maxWeightKg: 3.0,
            tareWeightKg: 0.4
          }
        ],
        items: [
          { name: 'Past Medical Prescriptions & Lab Binder', category: 'documents', quantity: 1, estimatedWeightKg: 0.4, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Health Insurance Cards & Photo IDs', category: 'documents', quantity: 1, estimatedWeightKg: 0.1, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Ongoing Daily Medication Strip', category: 'medicine', quantity: 1, estimatedWeightKg: 0.15, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Fasting Glucometer & Test Strips', category: 'medicine', quantity: 1, estimatedWeightKg: 0.25, securityCategory: 'allowed', targetBagIndex: 0 },
          { name: 'Electrolyte Water & Post-Test Light Snack', category: 'other', quantity: 1, estimatedWeightKg: 0.5, securityCategory: 'allowed', targetBagIndex: 0 }
        ],
        homeTasks: [
          'Confirm appointment slot & doctor availability',
          'Ensure 10-hour overnight fasting window if requested',
          'Keep health insurance card in top wallet slot'
        ]
      };
    }

    // 3. Travel / Flight / Vacation / Homecoming
    const isDelhiOrCold = lower.includes('delhi') || lower.includes('winter') || lower.includes('kashmir') || lower.includes('london');
    return {
      title: prompt.length < 40 ? prompt : 'Family Journey & Vacation',
      category: lower.includes('home') || lower.includes('brother') || lower.includes('parent') ? 'homecoming' : 'vacation',
      destination: isDelhiOrCold ? 'Delhi, India' : 'Vacation Destination',
      contextualAdvice: isDelhiOrCold
        ? 'Winter Travel Notice: Expect cool mornings (8°C–14°C). Pack thermal layers and a warm jacket. Remember: Power banks must stay in Cabin Baggage, and reserve ~3kg spare allowance for return gifts!'
        : 'Family Packing Guide: Liquids over 100ml must go into checked baggage. Keep passports, tickets, and power banks in your cabin roller for swift airport security clearance.',
      bags: [
        {
          name: 'Main Family Trolley (Checked)',
          type: 'suitcase',
          maxWeightKg: 23.0,
          tareWeightKg: 3.8
        },
        {
          name: 'Cabin Roller & Tech Bag',
          type: 'cabin',
          maxWeightKg: 7.0,
          tareWeightKg: 2.1
        }
      ],
      items: [
        { name: 'Passports & Flight Boarding Passes', category: 'documents', quantity: 1, estimatedWeightKg: 0.1, securityCategory: 'cabin_only', flagReason: 'Keep with you at all times in cabin bag', targetBagIndex: 1 },
        { name: '20,000mAh High-Capacity Power Bank', category: 'electronics', quantity: 1, estimatedWeightKg: 0.45, securityCategory: 'cabin_only', flagReason: 'Lithium battery: Cabin baggage only (Prohibited in checked bags)', targetBagIndex: 1 },
        { name: 'Noise-Cancelling Travel Headphones', category: 'electronics', quantity: 1, estimatedWeightKg: 0.35, securityCategory: 'cabin_only', targetBagIndex: 1 },
        { name: 'Warm Fleece or Merino Jacket', category: 'clothing', quantity: 2, estimatedWeightKg: 1.6, securityCategory: 'allowed', targetBagIndex: 0 },
        { name: 'Daily Outfits (x4 Changes)', category: 'clothing', quantity: 4, estimatedWeightKg: 3.2, securityCategory: 'allowed', targetBagIndex: 0 },
        { name: 'Full-Size Shampoo & Moisturizer (150ml)', category: 'toiletries', quantity: 1, estimatedWeightKg: 0.35, securityCategory: 'checked_only', flagReason: '>100ml liquid: Must be in Checked Baggage for flights', targetBagIndex: 0 },
        { name: 'Emergency Family First-Aid & Pain Relief', category: 'medicine', quantity: 1, estimatedWeightKg: 0.3, securityCategory: 'allowed', targetBagIndex: 1 },
        { name: 'Spare Capacity for Return Family Gifts', category: 'other', quantity: 1, estimatedWeightKg: 2.5, securityCategory: 'allowed', targetBagIndex: 0 }
      ],
      homeTasks: [
        'Turn off main water heater & kitchen gas valve',
        'Double-check balcony sliding door locks and window latches',
        'Place physical passports, tickets and house keys on front console table',
        'Unplug idle TV and desktop power strips'
      ]
    };
  }

  // Camera Item Scan & Airline Security Analyzer
  analyzeScannedItem(itemNameOrText: string): ScannedItemResult {
    const text = itemNameOrText.toLowerCase();

    if (text.includes('power bank') || text.includes('battery') || text.includes('charger') || text.includes('laptop') || text.includes('ipad') || text.includes('tablet')) {
      return {
        name: itemNameOrText || 'Lithium Battery / Tech Device',
        category: 'electronics',
        estimatedWeightKg: text.includes('laptop') ? 1.8 : 0.45,
        securityCategory: 'cabin_only',
        flagReason: 'Lithium batteries and portable power banks are PROHIBITED in checked luggage. Must be in Cabin Bag.',
        suggestedBagType: 'cabin'
      };
    }

    if (text.includes('shampoo') || text.includes('lotion') || text.includes('perfume') || text.includes('moisturizer') || text.includes('bottle') || text.includes('oil')) {
      return {
        name: itemNameOrText || 'Toiletry Bottle / Cosmetic',
        category: 'toiletries',
        estimatedWeightKg: 0.35,
        securityCategory: 'checked_only',
        flagReason: 'Liquid containers over 100ml cannot pass airport security checkpoints. Must go into Checked Baggage.',
        suggestedBagType: 'suitcase'
      };
    }

    if (text.includes('smartwatch') || text.includes('watch') || text.includes('airpods')) {
      return {
        name: itemNameOrText || 'Smartwatch / Wearable',
        category: 'electronics',
        estimatedWeightKg: 0.08,
        securityCategory: 'cabin_only',
        flagReason: 'Keep high-value electronics in cabin luggage. (Note: Disallowed in exam halls).',
        suggestedBagType: 'cabin'
      };
    }

    if (text.includes('jacket') || text.includes('coat') || text.includes('sweater') || text.includes('hoodie')) {
      return {
        name: itemNameOrText || 'Winter Outerwear',
        category: 'clothing',
        estimatedWeightKg: 1.2,
        securityCategory: 'allowed',
        suggestedBagType: 'suitcase'
      };
    }

    if (text.includes('shoes') || text.includes('sneakers') || text.includes('boots')) {
      return {
        name: itemNameOrText || 'Footwear',
        category: 'clothing',
        estimatedWeightKg: 0.9,
        securityCategory: 'allowed',
        suggestedBagType: 'suitcase'
      };
    }

    if (text.includes('pen') || text.includes('pencil') || text.includes('ruler') || text.includes('geometry')) {
      return {
        name: itemNameOrText || 'Stationery Item',
        category: 'stationery',
        estimatedWeightKg: 0.1,
        securityCategory: 'allowed',
        suggestedBagType: 'exam_pouch'
      };
    }

    if (text.includes('passport') || text.includes('ticket') || text.includes('id') || text.includes('aadhaar') || text.includes('visa')) {
      return {
        name: itemNameOrText || 'Travel Identity Document',
        category: 'documents',
        estimatedWeightKg: 0.05,
        securityCategory: 'cabin_only',
        flagReason: 'Essential Document: Must stay on your person or in cabin bag.',
        suggestedBagType: 'cabin'
      };
    }

    // Default item
    return {
      name: itemNameOrText || 'Packed Item',
      category: 'other',
      estimatedWeightKg: 0.5,
      securityCategory: 'allowed',
      suggestedBagType: 'suitcase'
    };
  }
}

export const aiService = new AIService();
