# Evaluation Framework - AI Farmer Assistance Agent (KhetiMitra)

This document contains the official validation suite and evaluation criteria for KhetiMitra.

---

## 1. 30 Target Test Scenarios

The test suite evaluates the routing precision and crop-specific context tracking across 30 defined queries:

### 1.1 Crop Recommendation (8 Cases)
1. "Which crop should I grow in clay soil during winter?"
2. "What is suitable to grow in sandy loam soil in summer?"
3. "Suggest crops for monsoon season in red soil."
4. "Which seeds are best for cultivation in black soil?"
5. "Recommend crops for dry land."
6. "Best crop to grow in alluvial soil in winter season."
7. "What should I grow in black soil during monsoon?" *(Evaluates monsoon-specific Kharif crops like Cotton/Soybean instead of Rabi Wheat)*
8. "Which seeds should I sow in sandy soil for winter?" *(Evaluates light Rabi crop like Barley/Mustard)*

### 1.2 Pest & Disease Guidance (8 Cases)
9. "My rice leaves have strange yellow spots, what is it?"
10. "There are holes in my tomatoes, looks like worms are eating them."
11. "White insect patches on cotton leaves, please help." *(Evaluates that Cotton Whitefly is diagnosed instead of Rice Blast)*
12. "Fungus infection on potato stalks, leaf rot seen."
13. "How to cure root rot disease in sugarcane?"
14. "Cotton leaves showing yellow spots and tiny whitefly insects."
15. "My tomato crop is suffering from fruit borer worms."
16. "Rice paddy blast fungal spots seen on leaves."

### 1.3 Government Schemes (7 Cases)
17. "Is there any subsidy available for buying a tractor?"
18. "How to register for the PM Kisan Samman Nidhi scheme?"
19. "What government help can I get for drought crop insurance?"
20. "Are there loans or benefits for small organic farmers?"
21. "Tell me about agricultural subsidies in my region."
22. "PMFBY crop insurance scheme enrollment criteria."
23. "Government pension schemes for old age farmers."

### 1.4 General Farming Advice (5 Cases)
24. "How do I make organic compost manure at home?"
25. "What is the best way to save water using drip irrigation?"
26. "How often should I rotate my crops to keep soil healthy?"
27. "Tips for weeding vegetables without chemicals."
28. "How to build a compost pile using cow dung?"

### 1.5 Out of Domain / Guardrails (2 Cases)
29. "Write a python function to sort an array of numbers."
30. "Who directed the movie Inception?"

---

## 2. Evaluation Criteria & Safety Targets

* **Season & Soil Awareness**: Recommendations must map the specific soil type and seasonal calendar (Kharif vs Rabi). Rabi crops (Wheat/Mustard) should never be suggested for monsoon queries.
* **Crop-Aware Disease Prevention**: Diagnostic recommendations must check the crop context first. Diseases specific to other crops (e.g. Rice Blast) must never be suggested for cotton or tomatoes.
* **Structured Reasoning**: Every response must clearly state the `### Reasoning` and `### Conclusion` indicating the factors that led to the response.
* **Confidence Level**: Every response must include a distinct `### Confidence Level` rating (High/Medium/Low) based on match safety and quality.
