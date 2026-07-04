/**
 * AI Farmer Assistance Agent - Multi-Agent Core
 * This file contains the prompts, mock knowledge bases, and multi-agent routing logic.
 */

// --- System Prompts ---

export const ROUTER_PROMPT = `You are the Router Agent for the AI Farmer Assistance platform.
Your job is to analyze the user's query and classify it into EXACTLY ONE of the following categories:
1. CROP_RECOMMENDATION: Queries asking about what crop to grow, based on soil type, season, region, or general suitability.
2. PEST_DISEASE_GUIDANCE: Queries asking about sick crops, pest attacks, leaf discoloration, insect damage, or disease control.
3. GOVERNMENT_SCHEME: Queries asking about subsidies, financial help, government benefits, insurance, or agricultural schemes.
4. GENERAL_ADVICE: Queries about general farming, watering, weeding, organic composting, crop rotation, equipment, etc.
5. OUT_OF_DOMAIN: Queries unrelated to agriculture (e.g., general programming, general history, personal conversation, pop culture).

Respond with a clean JSON object containing:
{
  "category": "CROP_RECOMMENDATION" | "PEST_DISEASE_GUIDANCE" | "GOVERNMENT_SCHEME" | "GENERAL_ADVICE" | "OUT_OF_DOMAIN",
  "reasoning": "A brief explanation of why you selected this category.",
  "extracted_parameters": {
    "soil_type": "...", // If applicable
    "season": "...", // If applicable
    "region": "...", // If applicable
    "crop_name": "...", // If applicable
    "symptoms": "..." // If applicable
  }
}`;

export const OUT_OF_DOMAIN_PROMPT = `You are the KhetiMitra Guardrail Assistant.
Identify that the user's query is outside the scope of agriculture or farming.
You MUST reply with exactly this message format:
### Out of Domain
I can only answer agriculture-related questions.

Please ask about crops, soil, irrigation, fertilizers, weather, plant diseases, pests or farming practices.`;

export const CROP_REC_PROMPT = `You are the Crop Recommendation Agent.
Analyze the farmer's details: Soil Type, Season, and Region (if provided).
Provide a structured, helpful response in farmer-friendly language.

You MUST follow this exact format using clean Markdown:
### Reasoning
- Explain the agricultural reasoning behind your suggestion, linking the specific soil moisture properties and seasonal constraints.

### Confidence Level
- High, Medium, or Low with a brief 1-sentence justification.

### Conclusion
- Summarize the matched conditions (e.g., "Matched Black clay soil during Monsoon (Kharif)").

### Recommended Crops
- List 2 to 3 suitable crops (using common and botanical names).

### Why These Crops?
- Explain why these match the soil and season.

### Expected Benefits
- Yield potential, market demand, or soil improvement benefits.

### Cultivation Tips
- Basic land preparation, sowing depth, or watering advice.`;

export const PEST_DISEASE_PROMPT = `You are the Pest and Disease Guidance Agent.
Analyze the crop name and the symptoms described by the farmer.

CRITICAL SAFETY RULES:
1. Ensure the diagnosis is strictly relevant to the specified crop. NEVER suggest a disease from an unrelated crop (e.g., do not suggest rice diseases for cotton crops).
2. If the crop name is missing, ask the user to clarify which crop they are growing before offering diagnostic possibilities.
3. Never claim absolute certainty. Always frame conclusions as "likely possibilities".
4. Clearly state: "For critical infections, please consult your local agricultural extension office or a certified agronomist."

You MUST follow this exact format using clean Markdown:
### Reasoning
- Explain the logic behind your diagnosis, connecting symptoms to the specific crop physiology.

### Confidence Level
- High, Medium, or Low with a brief 1-sentence justification.

### Conclusion
- Summarize matched conditions (e.g., "Matched Cotton crop with white spots").

### Possible Diagnostics
- What pest or disease is likely causing this.

### Symptom Analysis
- Explain how the symptoms match the diagnosis.

### Preventive Measures
- Actions to prevent this from spreading or happening next season.

### Recommended Actions
- Immediate organic or chemical remedies (mentioning safe usage).

### Safety Disclaimer
- Insert the required safety guidance here.`;

export const GOV_SCHEME_PROMPT = `You are the Government Scheme Assistance Agent.
Search for relevant government agricultural schemes, subsidies, or benefits matching the farmer's query.

You MUST follow this exact format using clean Markdown:
### Reasoning
- Explain how the query relates to the retrieved schemes.

### Confidence Level
- High, Medium, or Low with a brief 1-sentence justification.

### Conclusion
- Summarize matched criteria.

### Relevant Schemes
- Name of the schemes/subsidies.

### Eligibility Criteria
- Who can apply (landholding size, crop types, category).

### Key Benefits
- Financial support, subsidized inputs, or training.

### Application Guidance
- Step-by-step how to apply, list of required documents, and where to visit.`;

export const GENERAL_ADVISOR_PROMPT = `You are the General Farming Advisor Agent.
Answer the farmer's general agricultural question in a practical, easy-to-understand tone.

You MUST follow this exact format using clean Markdown:
### Reasoning
- Explain the basic agronomic principles behind this advice.

### Confidence Level
- High, Medium, or Low with a brief 1-sentence justification.

### Conclusion
- Summarize the topic covered.

### Practical Advice
- Direct, actionable steps.
- Explain agricultural concepts using simple analogies.
- Focus on low-cost and sustainable practices where applicable.`;

// --- Mock Knowledge Base for Local/Offline Mode ---

export const MOCK_DATABASE = {
  CROP_RECOMMENDATION: [
    {
      soil: 'clay/black',
      season: 'winter',
      content: `### Reasoning
Black clayey soils have high water retention properties, making them highly suitable for cool-season crops that thrive on residual winter moisture.

### Confidence Level
**High (95%)** - Clayey soil retaining winter moisture is highly documented for Rabi success.

### Conclusion
Matched: Clay/Black soil + Winter (Rabi) season.

### Recommended Crops
* **Wheat (Triticum aestivum)**
* **Gram / Chickpea (Cicer arietinum)**
* **Mustard (Brassica nigra)**

### Why These Crops?
* **Wheat** performs exceptionally well in clayey/loamy soil as it retains sufficient moisture over the cool winter season.
* **Chickpea** is a legume that thrives in winter and enriches the soil with nitrogen.

### Expected Benefits
* High regional market demand during the Rabi harvest.
* Chickpeas require minimal nitrogen fertilizers, saving costs.

### Cultivation Tips
* Ensure proper field leveling to avoid water stagnation, as clayey soils drain slowly.
* Sow wheat at a depth of 4-5 cm when temperatures drop to 20-22°C.`
    },
    {
      soil: 'clay/black',
      season: 'monsoon',
      content: `### Reasoning
Monsoon brings abundant rain. Black clay soils retain high amounts of moisture, which is ideal for kharif crops like Cotton or Soybean that require deep rooting and warm, moist conditions.

### Confidence Level
**High (90%)** - Moisture retention fits Kharif crop requirements perfectly.

### Conclusion
Matched: Clay/Black soil + Monsoon (Kharif) season.

### Recommended Crops
* **Cotton (Gossypium hirsutum)**
* **Soybean (Glycine max)**
* **Paddy / Rice (Oryza sativa)**

### Why These Crops?
* **Cotton** grows best in deep black soils that sustain crop growth through monsoon moisture.
* **Soybean** thrives in clayey loams with good water retention.

### Expected Benefits
* Cotton offers high commercial returns.
* Soybean enriches soil health and provides good fodder oilseed value.

### Cultivation Tips
* Construct drainage channels to drain off excess water during heavy downpours.
* Maintain seed spacing of 60 x 30 cm for Cotton.`
    },
    {
      soil: 'sandy',
      season: 'monsoon',
      content: `### Reasoning
Sandy soil drains very quickly and has low water retention. During the monsoon, crops that cannot tolerate waterlogging, such as millets or groundnuts, perform best.

### Confidence Level
**High (90%)** - High drainage capacity of sandy soils prevents logging during monsoon rains.

### Conclusion
Matched: Sandy soil + Monsoon (Kharif) season.

### Recommended Crops
* **Pearl Millet / Bajra (Pennisetum glaucum)**
* **Groundnut (Arachis hypogaea)**
* **Maize (Zea mays)**

### Why These Crops?
* **Bajra** is highly drought-tolerant and thrives in warm temperatures and sandy soils.
* **Groundnut** grows well in light-textured sandy loams, facilitating easy pod development.

### Expected Benefits
* Low water requirement for Bajra reduces irrigation costs.
* Groundnut provides high oilseed market returns.

### Cultivation Tips
* Apply organic compost or farmyard manure to sandy soils to improve water retention.
* Ensure weeds are cleared early as sandy soil weeds grow rapidly.`
    },
    {
      soil: 'sandy',
      season: 'winter',
      content: `### Reasoning
Winter is cool with low rain. Sandy soils require light, frequent irrigation to sustain winter crops like barley or mustard.

### Confidence Level
**Medium (80%)** - Low winter rain requires additional light irrigation schedules.

### Conclusion
Matched: Sandy soil + Winter (Rabi) season.

### Recommended Crops
* **Barley (Hordeum vulgare)**
* **Mustard (Brassica juncea)**
* **Peas (Pisum sativum)**

### Why These Crops?
* **Barley** and **Mustard** require less water than wheat and grow successfully in light, sandy-loam soils during winter.

### Expected Benefits
* Low water input saves tubewell electricity and fuel costs.
* Peas improve soil nitrogen content.

### Cultivation Tips
* Use sprinkler irrigation to prevent water wastage.
* Apply nitrogen fertilizer in split doses to avoid leaching in sandy soils.`
    }
  ],
  PEST_DISEASE_GUIDANCE: [
    {
      crop: 'rice',
      content: `### Reasoning
The presence of spindle-shaped spots with yellow borders on rice leaves is a classic symptom of rice blast fungal infection.

### Confidence Level
**High (90%)** - Spindle-shaped spots on rice are highly indicative of blast.

### Conclusion
Matched: Rice/Paddy crop + Leaf spots symptoms.

### Possible Diagnostics
* **Rice Blast (Magnaporthe oryzae)** - Fungal infection.

### Symptom Analysis
* The yellow-bordered spindle-shaped spots on leaves are classic signs of blast infection.

### Preventive Measures
* Avoid excessive use of nitrogen fertilizers.
* Space seedlings properly to allow wind circulation.

### Recommended Actions
* Use organic neem oil spray (1-2%) for early-stage symptoms.
* Apply certified copper-based fungicides if the spread is severe.

### Safety Disclaimer
* *Warning: Leaf diagnosis via description is not 100% certain. For critical crop infections, please consult your local agricultural extension office or a certified agronomist before applying chemical treatments.*`
    },
    {
      crop: 'cotton',
      content: `### Reasoning
Tiny white sucking insects under cotton leaves and spots are symptoms of cotton whitefly infestation, a major pest of cotton.

### Confidence Level
**High (95%)** - Cotton whitefly is the primary cause of white sucking bugs on cotton leaves.

### Conclusion
Matched: Cotton crop + White spots/insects symptoms.

### Possible Diagnostics
* **Cotton Whitefly Infestation (Bemisia tabaci)**

### Symptom Analysis
* Yellowing spots on leaves and tiny white insects on the undersides of cotton leaves are indicators of Whitefly feeding.

### Preventive Measures
* Avoid excessive nitrogen fertilizers which attract sucking pests.
* Plant trap crops like castor or sunflower.

### Recommended Actions
* Spray neem seed kernel extract (NSKE 5%) or neem oil.
* Place yellow sticky traps (10-15 per acre) to trap flying insects.

### Safety Disclaimer
* *Warning: Pest identification via descriptions is tentative. For critical infections, please consult your local agricultural extension office or a certified agronomist.*`
    },
    {
      crop: 'tomato',
      content: `### Reasoning
Circular holes bored into tomato fruits accompanied by caterpillars are classic signs of tomato fruit borer attack.

### Confidence Level
**High (95%)** - Borer larvae are highly distinguishable on tomato fruits.

### Conclusion
Matched: Tomato crop + Borer worm symptoms.

### Possible Diagnostics
* **Tomato Fruit Borer (Helicoverpa armigera)**

### Symptom Analysis
* Circular holes in fruits accompanied by visible caterpillars feeding inside indicates borer infestation.

### Preventive Measures
* Grow trap crops like Marigold around your primary crop.
* Install pheromone traps (5-10 traps per acre).

### Recommended Actions
* Hand-pick and destroy infested fruits and larvae.
* Spray Neem Seed Kernel Extract (NSKE 5%).

### Safety Disclaimer
* *Warning: Pest identification via descriptions is tentative. For critical infections, please consult your local agricultural extension office or a certified agronomist.*`
    }
  ],
  GOVERNMENT_SCHEME: [
    {
      keywords: ['subsidy', 'money', 'pm-kisan', 'pension', 'financial', 'insurance', 'pmfby', 'loan'],
      content: `### Reasoning
The query requests information on government funding, subsidies, or financial relief.

### Confidence Level
**High (90%)** - Query matches verified active schemes PM-KISAN and PMFBY.

### Conclusion
Matched Scheme Search terms: Subsidy, PM-KISAN, PMFBY.

### Relevant Schemes
* **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**
* **PMFBY (Pradhan Mantri Fasal Bima Yojana) - Crop Insurance**

### Eligibility Criteria
* Small and marginal landholding farmer families.
* Valid land ownership records are required.

### Key Benefits
* PM-KISAN: Direct cash benefit of ₹6,000 per year in three equal installments.
* PMFBY: Insurance coverage against natural calamities with very low premium rates (1.5% to 2%).

### Application Guidance
1. **PM-KISAN**: Register online via the official PM-KISAN portal or visit your nearest Common Service Centre (CSC). Keep your Aadhaar, bank details, and land parcel papers ready.
2. **PMFBY**: Register through your lending bank or directly on the PMFBY portal before the seasonal cut-off date.`
    }
  ],
  GENERAL_ADVICE: [
    {
      keywords: ['compost', 'organic', 'fertilizer', 'manure', 'soil health', 'rotation'],
      content: `### Reasoning
Soil enrichment or organic compost question.

### Confidence Level
**High (90%)** - Sustainable soil health techniques matched.

### Conclusion
Matched: Organic soil enrichment practices.

### Practical Farming Advice: Soil Enrichment
To build rich, healthy soil without spending a lot of money:

1. **Start a Compost Pile**: Use dry leaves, cow dung, crop residue, and kitchen waste. Layer them and keep moist. In 60-90 days, you will have black gold.
2. **Green Manuring**: Grow legume crops like sunn hemp or dhaincha and plow them back into the soil before flowering.
3. **Crop Rotation**: Never grow the same crop in the same field back-to-back. Rotate cereals with legumes to keep the soil nutrients balanced.`
    },
    {
      keywords: ['water', 'irrigation', 'drip', 'save', 'summer', 'dry'],
      content: `### Reasoning
Water conservation or irrigation advice.

### Confidence Level
**High (90%)** - Conservation drip methods matched.

### Conclusion
Matched: Irrigation and watering methods.

### Practical Farming Advice: Water Conservation
Maximize crop watering efficiency with these low-cost tips:

1. **Mulching**: Cover the soil around your crops with dry grass, straw, or leaves. This keeps the soil damp and stops water from evaporating.
2. **Drip Irrigation**: Delivers water directly to the crop roots. Saves up to 50% water compared to flood irrigation.
3. **Water in the Evening/Morning**: Water your crops during the cooler times of the day to reduce evaporation losses.`
    }
  ],
  OUT_OF_DOMAIN: [
    {
      keywords: [],
      content: `### Out of Domain
I can only answer agriculture-related questions.

Please ask about crops, soil, irrigation, fertilizers, weather, plant diseases, pests or farming practices.`
    }
  ]
};

// --- Multi-Agent Orchestrator ---

export async function processFarmerQuery(query, apiKey = '') {
  let selectedCategory = 'GENERAL_ADVICE';
  let reasoning = 'Defaulting to general advice.';
  let extractedParams = {};

  const cleanQuery = query.toLowerCase();

  if (apiKey) {
    try {
      // 1. Run Router Agent using Gemini API
      const routerResponse = await callGeminiAPI(ROUTER_PROMPT, query, apiKey, true);
      const parsed = JSON.parse(routerResponse);
      selectedCategory = parsed.category || 'GENERAL_ADVICE';
      reasoning = parsed.reasoning || '';
      extractedParams = parsed.extracted_parameters || {};
    } catch (e) {
      console.warn("Gemini Routing failed, falling back to local routing", e);
      ({ selectedCategory, reasoning, extractedParams } = localRoute(cleanQuery));
    }
  } else {
    // Local routing fallback
    ({ selectedCategory, reasoning, extractedParams } = localRoute(cleanQuery));
  }

  // 2. Fetch/Generate response from the selected Agent
  let agentResponse = '';
  if (apiKey) {
    try {
      let prompt = '';
      let inputContext = `User Query: "${query}"\nExtracted Parameters: ${JSON.stringify(extractedParams)}`;
      
      switch (selectedCategory) {
        case 'CROP_RECOMMENDATION':
          prompt = CROP_REC_PROMPT;
          break;
        case 'PEST_DISEASE_GUIDANCE':
          prompt = PEST_DISEASE_PROMPT;
          break;
        case 'GOVERNMENT_SCHEME':
          prompt = GOV_SCHEME_PROMPT;
          break;
        case 'OUT_OF_DOMAIN':
          prompt = OUT_OF_DOMAIN_PROMPT;
          break;
        case 'GENERAL_ADVICE':
        default:
          prompt = GENERAL_ADVISOR_PROMPT;
          break;
      }
      
      agentResponse = await callGeminiAPI(prompt, inputContext, apiKey, false);
    } catch (e) {
      console.warn("Gemini Agent execution failed, falling back to local database", e);
      agentResponse = getMockResponse(selectedCategory, cleanQuery, extractedParams);
    }
  } else {
    agentResponse = getMockResponse(selectedCategory, cleanQuery, extractedParams);
  }

  return {
    category: selectedCategory,
    routingReason: reasoning,
    extractedParams: extractedParams,
    response: agentResponse,
    isMock: !apiKey
  };
}

// --- Helper Functions ---

function localRoute(query) {
  // Use regex with word boundaries to avoid partial matches like 'rot' matching 'rotate'
  const matches = (words) => {
    const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
    return pattern.test(query);
  };

  const extractedParams = {};
  if (query.includes('rice') || query.includes('paddy')) extractedParams.crop_name = 'rice';
  else if (query.includes('cotton')) extractedParams.crop_name = 'cotton';
  else if (query.includes('tomato')) extractedParams.crop_name = 'tomato';

  if (query.includes('clay') || query.includes('black') || query.includes('alluvial')) extractedParams.soil_type = 'clay/black';
  else if (query.includes('sandy') || query.includes('loam')) extractedParams.soil_type = 'sandy';

  if (query.includes('winter') || query.includes('rabi') || query.includes('cool')) extractedParams.season = 'winter';
  else if (query.includes('monsoon') || query.includes('kharif') || query.includes('rainy') || query.includes('summer')) extractedParams.season = 'monsoon';

  // 1. Government Schemes take high precedence because they often mention crops/pests as context
  const schemeKeywords = ['scheme', 'schemes', 'subsidy', 'subsidies', 'government', 'govt', 'pm-kisan', 'insurance', 'loan', 'loans', 'pmfby', 'benefit', 'benefits'];
  if (matches(schemeKeywords)) {
    return {
      selectedCategory: 'GOVERNMENT_SCHEME',
      reasoning: 'Keywords relating to financial benefits or government schemes were detected.',
      extractedParams: extractedParams
    };
  }

  // 2. General Farming Advice (explicit keywords like compost, watering, crop rotation)
  const generalKeywords = ['compost', 'manure', 'composting', 'water', 'watering', 'irrigation', 'drip', 'weed', 'weeding', 'rotate', 'rotation', 'mulch', 'mulching', 'plow', 'plowing', 'tillage', 'organic'];
  if (matches(generalKeywords)) {
    return {
      selectedCategory: 'GENERAL_ADVICE',
      reasoning: 'Keywords relating to general farming practices (composting, irrigation, weeding, rotation) were detected.',
      extractedParams: extractedParams
    };
  }

  // 3. Pest & Disease Guidance
  const pestKeywords = ['pest', 'pests', 'disease', 'diseases', 'spot', 'spots', 'rot', 'rots', 'insect', 'insects', 'leaf', 'leaves', 'worm', 'worms', 'fungus', 'fungal', 'blight', 'bug', 'bugs', 'caterpillar', 'caterpillars'];
  if (matches(pestKeywords)) {
    extractedParams.symptoms = query;
    return {
      selectedCategory: 'PEST_DISEASE_GUIDANCE',
      reasoning: 'Keywords relating to plant health, pests, or disease symptoms were detected.',
      extractedParams: extractedParams
    };
  }

  // 4. Crop Recommendation
  const cropKeywords = ['soil', 'soils', 'recommend', 'recommendation', 'recommendations', 'grow', 'growing', 'season', 'seasons', 'plant', 'planting', 'suitable', 'suitability', 'seeds', 'seed'];
  if (matches(cropKeywords)) {
    return {
      selectedCategory: 'CROP_RECOMMENDATION',
      reasoning: 'Keywords relating to crop suggestions, soils, or growing seasons were detected.',
      extractedParams: extractedParams
    };
  }

  // 5. Fallback: If no farming-related words whatsoever are matched, it's out of domain.
  // Otherwise, default to general advice.
  const allAgriKeywords = [...schemeKeywords, ...generalKeywords, ...pestKeywords, ...cropKeywords, 'farm', 'farming', 'farmer', 'crop', 'crops', 'agriculture', 'yield', 'field', 'fields', 'land', 'sow', 'sowing', 'harvest', 'harvesting', 'cultivate', 'cultivation'];
  if (!matches(allAgriKeywords)) {
    return {
      selectedCategory: 'OUT_OF_DOMAIN',
      reasoning: 'Query contains no recognizable agricultural terms or context. Guardrail routing triggered.',
      extractedParams: extractedParams
    };
  }

  return {
    selectedCategory: 'GENERAL_ADVICE',
    reasoning: 'General agricultural query. Defaulting to general advisor.',
    extractedParams: extractedParams
  };
}

function getMockResponse(category, query, extractedParams = {}) {
  const dataset = MOCK_DATABASE[category];
  if (!dataset) return "I'm sorry, I don't have enough local knowledge to answer this specific query.";

  const q = query.toLowerCase();

  // 1. Crop Recommendation Smart Match
  if (category === 'CROP_RECOMMENDATION') {
    let soil = extractedParams.soil_type || 'clay/black';
    let season = extractedParams.season || 'winter';

    // Double check query string if parameters were not resolved
    if (!extractedParams.soil_type) {
      if (q.includes('sandy') || q.includes('loam')) soil = 'sandy';
    }
    if (!extractedParams.season) {
      if (q.includes('monsoon') || q.includes('kharif') || q.includes('rainy') || q.includes('summer')) season = 'monsoon';
    }

    const match = dataset.find(item => item.soil === soil && item.season === season);
    return match ? match.content : dataset[0].content;
  }

  // 2. Pest & Disease Guidance Smart Match
  if (category === 'PEST_DISEASE_GUIDANCE') {
    let crop = extractedParams.crop_name || '';

    if (!crop) {
      if (q.includes('rice') || q.includes('paddy')) crop = 'rice';
      else if (q.includes('cotton')) crop = 'cotton';
      else if (q.includes('tomato')) crop = 'tomato';
    }

    if (crop) {
      const match = dataset.find(item => item.crop === crop);
      if (match) return match.content;
    }

    // Fallback if crop unrecognized or unspecified
    return `### Reasoning
Unrecognized crop. Cannot make a safe diagnosis without knowing the crop type.

### Confidence Level
**Low (20%)** - Lacks crop context parameter.

### Conclusion
Failed to match diagnostic entry: crop unrecognized.

### Safety Disclaimer
*For safety, KhetiMitra does not diagnose crop diseases without knowing the specific crop type. Please provide the crop name (e.g., Rice, Cotton, Tomato) along with symptoms, or consult a certified local agronomist.*`;
  }

  // 3. Fallback to basic keyword matching for other categories
  let bestMatch = dataset[0];
  let maxMatches = 0;

  for (const entry of dataset) {
    let matches = 0;
    if (entry.keywords) {
      for (const word of entry.keywords) {
        if (q.includes(word)) {
          matches++;
        }
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = entry;
    }
  }

  return bestMatch.content;
}

async function callGeminiAPI(systemPrompt, userMessage, apiKey, jsonMode = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nUser input:\n${userMessage}` }
        ]
      }
    ]
  };

  if (jsonMode) {
    requestBody.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Empty response from Gemini API");
  }

  return textResponse;
}
