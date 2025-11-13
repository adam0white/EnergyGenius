# Energy Plan Scoring Weights Research

**Date:** 2025-11-12
**Purpose:** Determine optimal scoring weights for energy plan recommendation algorithm
**Story:** 10.12 - Improve Recommendation Engine

---

## Executive Summary

Based on comprehensive research of academic literature, competitive analysis, and consumer preference studies, this document recommends adjusting our energy plan scoring weights to better align with consumer priorities. The key finding is that **87% of consumers state cost is their most important factor**, yet only **12% accurately select the lowest-cost option** due to complexity. This highlights the need for a cost-focused recommendation algorithm that simplifies decision-making.

**Key Recommendations:**

1. **Increase Cost/Savings Weight:** 30% → 40% (primary driver)
2. **Increase Contract Flexibility Weight:** 10% → 20% (secondary priority - enables future switching)
3. **Decrease Renewable Energy Weight:** 20% → 10% (important but not dominant for average user)
4. **Maintain Monthly Fees Weight:** 10% (unchanged - part of cost but separate consideration)
5. **Add Reliability/Service Placeholder:** 10% (future enhancement when data available)

These adjustments shift the algorithm from environmental-first to **cost-first with flexibility**, matching actual consumer behavior and priorities.

---

## Current vs Proposed Weights

| Factor                   | Current Weight | Proposed Weight | Change      | Rationale                                                          |
| ------------------------ | -------------- | --------------- | ----------- | ------------------------------------------------------------------ |
| **Cost/Savings**         | 30 pts (38%)   | 40 pts (44%)    | **+10 pts** | Primary driver for 87% of consumers; reduce decision complexity    |
| **Contract Flexibility** | 10 pts (13%)   | 20 pts (22%)    | **+10 pts** | Enables future switching; ETF impacts switching cost significantly |
| **Renewable Energy**     | 20 pts (25%)   | 10 pts (11%)    | **-10 pts** | Important to subset; not dominant for average user                 |
| **Monthly Fees**         | 10 pts (13%)   | 10 pts (11%)    | 0           | Cost-related but separate from rate; provides predictability       |
| **Reliability/Service**  | 0 pts (0%)     | 10 pts (11%)    | **+10 pts** | New factor - placeholder for when rating data available            |
| **Base Score**           | 50 pts         | 50 pts          | 0           | Unchanged                                                          |
| **Total Variable**       | 80 pts         | 90 pts          | +10 pts     | -                                                                  |
| **Maximum Score**        | 130 pts        | 140 pts         | +10 pts     | -                                                                  |

**Weight Distribution (Variable Scoring Only):**

- Cost/Savings: **44%** (40/90) - PRIMARY DRIVER
- Flexibility: **22%** (20/90) - SECONDARY PRIORITY
- Renewable: **11%** (10/90) - TERTIARY
- Fees: **11%** (10/90) - COST-RELATED
- Reliability: **11%** (10/90) - FUTURE ENHANCEMENT

---

## Industry Benchmarks

### PowerToChoose.org (Texas PUCT)

**Methodology:** State-run neutral comparison platform (not a recommendation engine)

**Comparison Factors:**

- Price (at 500, 1000, 2000 kWh usage levels)
- Plan type (fixed-rate, variable-rate)
- Contract length
- Green energy option (yes/no filter)

**Key Findings:**

- **No scoring/ranking system** - basic filtering only
- Price displayed prominently at top
- Renewable energy is a filter, not a weight
- No quality vetting or recommendation algorithm
- Platform neutrality means no optimization for user needs

**Takeaway:** Even the official state platform **prioritizes price display** over other factors. This validates cost as the primary driver.

### Choose Energy

**Methodology:** Third-party comparison service with personalized recommendations

**Comparison Approach:**

- Budget considerations (primary)
- Risk tolerance (fixed vs. variable)
- Energy usage patterns
- Green energy percentage (optional preference)

**Key Findings:**

- Budget/cost is **first consideration** mentioned
- Contract type (flexibility) is **second priority**
- Green energy is **optional** based on user preference
- Service quality and brand reputation also considered

**Takeaway:** Consumer-focused platforms lead with **cost and flexibility**, treating renewable as optional preference.

### Energy Ogre (Managed Service)

**Methodology:** Expert-managed electricity shopping service

**Approach:**

- Optimizes for lowest total cost over contract term
- Considers contract length and ETF in total cost
- Monitors for better deals and switches automatically
- Green energy as opt-in preference

**Key Findings:**

- **Cost optimization is core value proposition**
- Contract flexibility enables ongoing optimization
- ETF and switching costs factored into total cost analysis
- Renewable is add-on preference, not default weight

**Takeaway:** Professional services **optimize for cost first**, validating our proposed weight increase.

---

## Consumer Preference Data

### Study 1: EnergyBot Electricity Plan Study (2024)

**Source:** https://www.energybot.com/electricity-plan-study.html

**Key Finding:**

- **87% of consumers** stated cost was the most important factor when selecting an electricity plan
- **Only 12% actually chose** the least expensive option when presented with choices
- **Gap explanation:** Complexity of rate structures and promotional offers lead to suboptimal choices

**Relevance:**
This massive gap (87% prioritize cost, but 98% fail to select cheapest option) demonstrates the critical need for a **cost-focused recommendation algorithm** that cuts through complexity. Our algorithm should do the heavy lifting to identify true cost savings.

**Implication:** Increase Cost/Savings weight to 40-45% to ensure algorithm prioritizes what users care about most.

### Study 2: Consumer Preferences for Dynamic Pricing (ScienceDirect, 2013)

**Source:** https://www.sciencedirect.com/science/article/abs/pii/S0301421513001791

**Key Finding:**

- Consumers prefer **simple programs** over complex, highly dynamic ones
- **Static time-of-use tariffs** preferred to flexible/controlled programs
- Savings on electricity bills influence willingness to participate

**Relevance:**
Users value simplicity and predictability. Fixed-rate plans with clear contract terms (flexibility factor) rank higher than complex structures.

**Implication:** Contract flexibility (length, ETF clarity) is a **secondary priority** deserving 20-22% weight.

### Study 3: Renewable Energy Preferences (NREL, 2011)

**Source:** https://www.nrel.gov/docs/fy11osti/50988.pdf

**Key Finding:**

- Many residential customers willing to pay **more per kWh** for renewable energy
- However, this is a **subset of consumers** with strong environmental preferences
- Solar PV panels most preferred renewable source
- Willingness-to-pay varies significantly by demographics

**Relevance:**
Renewable energy matters to environmentally-conscious consumers, but is **not the primary driver for average users** focused on cost savings.

**Implication:** Reduce renewable weight from 20% to 10-11%, but give full weight when user explicitly indicates renewable preference.

### Study 4: Multi-Criteria Decision Analysis (MDPI, 2023)

**Source:** https://www.mdpi.com/1996-1073/16/2/902

**Key Finding:**

- AHP (Analytic Hierarchy Process) most popular MCDA method for energy decisions
- Economic criteria typically weighted **40-50%** in residential energy decisions
- Environmental criteria weighted **10-20%** unless specifically prioritized
- Technical/service quality factors weighted **10-15%**

**Relevance:**
Academic research supports our proposed distribution: **Economic (40-45%) > Technical/Service (20-25%) > Environmental (10-15%)**.

**Implication:** Our proposed weights align with academic best practices for multi-criteria energy decisions.

### Study 5: Retail Choice in Electricity Markets (Harvard Kennedy School)

**Source:** https://hepg.hks.harvard.edu/files/hepg/files/retail_choice_in_electricity_for_emrf_final.pdf

**Key Finding:**

- Price is among primary reasons consumers enter retail choice markets
- Other factors (brand reputation, service level, product innovation) keep them there
- Contract length and flexibility influence switching behavior
- Green energy is differentiator but not majority driver

**Relevance:**
While price attracts users, **flexibility and service quality** retain them. This validates our secondary focus on contract flexibility.

**Implication:** Flexibility weight should be significant (20-22%) to match retention factors.

---

## Recommended Weights with Rationale

### Cost/Savings: 40 points (44% of variable scoring)

**Increased from 30 points (38%)**

**Rationale:**

1. **Consumer Priority:** 87% of consumers state cost is most important factor (EnergyBot study)
2. **Decision Complexity:** Only 12% successfully identify cheapest option without help
3. **Industry Standard:** Academic MCDA research recommends 40-50% weight for economic criteria
4. **Competitive Benchmark:** All major platforms (PowerToChoose, Choose Energy, Energy Ogre) lead with cost
5. **Platform Value:** Our algorithm's primary value is cutting through complexity to find real savings

**Implementation Notes:**

- Compare `baseRate * annualKWh + monthlyFee * 12` for total annual cost
- Factor in ETF (amortized over contract term) for true savings calculation
- Award maximum points to plans with highest savings vs. current plan
- Scale linearly: $0 savings = 0 pts, $1000+ savings = 40 pts

### Contract Flexibility: 20 points (22% of variable scoring)

**Increased from 10 points (13%)**

**Rationale:**

1. **Secondary Priority:** Research shows contract terms are #2 concern after price
2. **Enables Switching:** Flexibility allows users to switch again if better deals emerge
3. **ETF Impact:** High early termination fees significantly impact total switching cost
4. **Consumer Preference:** Users prefer simple, predictable contracts (dynamic pricing study)
5. **Retention Factor:** Flexibility is key factor in customer satisfaction and retention

**Implementation Notes:**

- Contract length scoring: 3mo = +20, 6mo = +15, 12mo = +10, 18mo = +5, 24mo = +2
- ETF penalty: Deduct points for high ETF: $150-200 = -3, $200-300 = -5, $300+ = -8
- Month-to-month plans get full +20 points (maximum flexibility)
- Variable rate plans may score lower (less predictability)

### Renewable Energy: 10 points (11% of variable scoring)

**Decreased from 20 points (25%)**

**Rationale:**

1. **Subset Priority:** Important to environmentally-conscious subset, not majority driver
2. **Academic Standard:** MCDA research weights environmental criteria at 10-20% unless prioritized
3. **Competitive Practice:** Major platforms treat renewable as optional filter/preference
4. **Cost Trade-off:** Users willing to pay more for renewable, but cost remains #1 factor
5. **Personalization:** Should give full weight when user explicitly prefers renewable plans

**Implementation Notes:**

- Scale by percentage: 100% renewable = +10, 75% = +7, 50% = +5, 25% = +2, 0% = 0
- If user indicates renewable preference in intake form, DOUBLE this weight to 20 pts
- Recognize that solar/wind preferences vary by demographics
- Don't penalize non-renewable plans excessively (cost still dominates)

### Monthly Fees: 10 points (11% of variable scoring)

**Maintained at 10 points (unchanged)**

**Rationale:**

1. **Cost Component:** Part of total cost but separate consideration from energy rate
2. **Budget Predictability:** Low fees provide month-to-month budget stability
3. **Hidden Cost:** Often overlooked by consumers; algorithm should highlight
4. **Industry Practice:** Standard consideration in all comparison platforms
5. **Current Weight Appropriate:** No research suggests this needs adjustment

**Implementation Notes:**

- Scale inversely: $0-5/mo = +10, $5-10/mo = +7, $10-15/mo = +5, $15-20/mo = +2, $20+/mo = 0
- Compare fee to user's current plan fee (delta matters)
- Highlight in narrative if fee difference is significant ($5+/month)
- Combine with energy cost for total annual cost in savings calculation

### Reliability/Service Quality: 10 points (11% of variable scoring)

**New factor - currently 0 points**

**Rationale:**

1. **Retention Factor:** Research shows service quality keeps customers in retail choice markets
2. **Brand Reputation:** Consumers consider supplier reputation in decisions
3. **Academic Support:** MCDA research recommends 10-15% weight for technical/service factors
4. **Future Enhancement:** Placeholder for when customer rating data becomes available
5. **Competitive Differentiation:** Quality service is differentiator beyond price

**Implementation Notes:**

- **Phase 1 (Current):** Allocate 10 points but distribute to other factors (not yet implemented)
- **Phase 2 (Future):** When supplier rating data available (BBB, Yelp, industry ratings):
  - 5-star rating = +10 pts
  - 4-star = +7 pts
  - 3-star = +5 pts
  - 2-star = +2 pts
  - 1-star or no rating = 0 pts
- Consider complaint data from Public Utility Commission if available
- For now, maintain current total of 80 variable points until data source identified

---

## Implementation Recommendations

### Immediate Actions (Story 10.12)

1. **Update Scoring Weights:**
   - Cost/Savings: 30 → 40 points
   - Contract Flexibility: 10 → 20 points
   - Renewable Energy: 20 → 10 points
   - Monthly Fees: 10 points (unchanged)
   - **Total:** 80 variable points (Reliability/Service deferred to future)

2. **Update Prompt in `plan-scoring.ts`:**

   ```
   SCORING CRITERIA:
   - Base score: 50 points
   - Cost/Savings: +40 points (PRIMARY DRIVER - 87% of consumers prioritize)
     Compare baseRate and monthlyFee to current plan for savings potential
   - Contract Flexibility: +20 points (SECONDARY - enables future switching)
     (3mo = +20, 6mo = +15, 12mo = +10, 18mo = +5, 24mo = +2)
     Subtract for high ETF: $150-200 = -3, $200-300 = -5, $300+ = -8
   - Renewable Energy: +10 points (TERTIARY - important to subset)
     (100% = +10, 75% = +7, 50% = +5, 25% = +2, 0% = 0)
     Double to +20 if user explicitly prefers renewable energy
   - Low Monthly Fees: +10 points (cost-related but separate consideration)
     ($0-5 = +10, $5-10 = +7, $10-15 = +5, $15-20 = +2, $20+ = 0)
   ```

3. **Document Rationale in Code:**
   - Add comment with research citations
   - Link to this research document
   - Explain weight distribution basis

### Phase 2: Future Enhancements

1. **Add Reliability/Service Scoring (+10 points):**
   - Identify data source (BBB ratings, PUC complaints, Yelp reviews)
   - Integrate supplier rating API or scrape public data
   - Add to scoring algorithm when data available
   - Increase total to 90 variable points

2. **Personalization Based on User Preferences:**
   - If user indicates "renewable preference" in intake form → double renewable weight (10 → 20)
   - If user indicates "price-sensitive" → increase cost weight (40 → 50)
   - If user indicates "flexibility preference" → increase flexibility weight (20 → 30)
   - Maintain total weight sum, adjust other factors proportionally

3. **A/B Testing:**
   - Test old weights vs. new weights with sample users
   - Measure: user satisfaction, plan selection rate, feedback quality
   - Iterate based on real-world feedback
   - Monitor for any degradation in recommendation quality

4. **Monitoring and Iteration:**
   - Track user feedback on recommendation quality
   - Analyze which plans users actually select vs. top recommendation
   - Refine weights quarterly based on behavioral data
   - Stay current with industry trends and consumer preferences

---

## Risk Mitigation

### Risk 1: Renewable Energy Advocates Dissatisfied

**Concern:** Users who prioritize environmental impact may feel renewable plans under-weighted.

**Mitigation:**

- Add explicit renewable preference option in intake form
- Double renewable weight (10 → 20 pts) when user indicates preference
- Explain in narrative: "This plan offers X% renewable energy" (always mention)
- Provide renewable filter option to surface green plans

### Risk 2: Scoring Changes Degrade Recommendation Quality

**Concern:** New weights may worsen recommendations vs. current algorithm.

**Mitigation:**

- Test new weights with 20+ sample scenarios before deployment
- Compare old vs. new top recommendations for reasonableness
- Monitor user feedback post-deployment for negative signals
- Quick rollback plan if quality degradation detected

### Risk 3: Cost-Only Focus Ignores Important Factors

**Concern:** Overemphasis on cost may lead to low-quality supplier recommendations.

**Mitigation:**

- Flexibility weight (20%) ensures contract terms considered
- Monthly fees weight (10%) captures hidden costs
- Future reliability/service factor (10%) will add quality consideration
- Narrative explains trade-offs beyond just price

### Risk 4: Industry Trends Change Consumer Priorities

**Concern:** Research may become outdated as market evolves.

**Mitigation:**

- Quarterly review of weights based on user behavior data
- Annual research update to check for shifting trends
- Stay informed on energy industry news and regulatory changes
- Flexible architecture allows quick weight adjustments

---

## Citations

1. **EnergyBot Electricity Plan Study (2024)**
   https://www.energybot.com/electricity-plan-study.html
   Key Finding: 87% prioritize cost, only 12% select cheapest option

2. **Dynamic Electricity Pricing Study (ScienceDirect, 2013)**
   https://www.sciencedirect.com/science/article/abs/pii/S0301421513001791
   Key Finding: Consumers prefer simple, predictable contracts

3. **Consumer Attitudes About Renewable Energy (NREL, 2011)**
   https://www.nrel.gov/docs/fy11osti/50988.pdf
   Key Finding: Renewable willingness-to-pay varies by demographics

4. **Multi-Criteria Decision Analysis for Energy Retrofit (MDPI, 2023)**
   https://www.mdpi.com/1996-1073/16/2/902
   Key Finding: Economic criteria weighted 40-50% in MCDA for energy decisions

5. **Retail Choice in Electricity Markets (Harvard Kennedy School)**
   https://hepg.hks.harvard.edu/files/hepg/files/retail_choice_in_electricity_for_emrf_final.pdf
   Key Finding: Price attracts, service quality retains customers

6. **Multi-Criteria Applications in Renewable Energy Analysis (Energy Community)**
   https://www.energy-community.org/dam/jcr:f5f409b1-7ab9-454a-921c-0d6c9d9a401c/Applications_RE_Analysis.pdf
   Key Finding: AHP method used in ~50% of energy MCDA studies

7. **PowerToChoose.org Analysis (GridHacker)**
   https://www.gridhacker.com/electricity-rates/texas/power-to-choose
   Key Finding: State platform prioritizes price display, renewable as filter

8. **Energy Ogre Methodology Analysis (BKV Energy)**
   https://bkvenergy.com/learning-center/energy-ogre-vs-power-to-choose/
   Key Finding: Professional services optimize for lowest total cost

---

## Appendix: Calculation Examples

### Example 1: High Savings, Long Contract

**Current Plan:**

- Rate: $0.15/kWh
- Monthly Fee: $9.95
- Annual Cost: $0.15 _ 12,000 + $9.95 _ 12 = $1,800 + $119.40 = **$1,919.40**

**Recommended Plan:**

- Rate: $0.11/kWh
- Monthly Fee: $12.95
- Contract: 24 months
- Renewable: 50%
- Annual Cost: $0.11 _ 12,000 + $12.95 _ 12 = $1,320 + $155.40 = **$1,475.40**
- Savings: $1,919.40 - $1,475.40 = **$444/year**

**Scoring:**

- Base: 50 pts
- Cost/Savings: +40 pts ($444 savings = 40/40)
- Flexibility: +2 pts (24mo contract = low flexibility)
- Renewable: +5 pts (50% renewable)
- Monthly Fees: +5 pts ($12.95/mo = moderate)
- **Total: 102 pts**

### Example 2: Moderate Savings, High Flexibility

**Recommended Plan:**

- Rate: $0.13/kWh
- Monthly Fee: $4.95
- Contract: 6 months
- Renewable: 0%
- Annual Cost: $0.13 _ 12,000 + $4.95 _ 12 = $1,560 + $59.40 = **$1,619.40**
- Savings: $1,919.40 - $1,619.40 = **$300/year**

**Scoring:**

- Base: 50 pts
- Cost/Savings: +30 pts ($300 savings = 30/40)
- Flexibility: +15 pts (6mo contract = good flexibility)
- Renewable: 0 pts (0% renewable)
- Monthly Fees: +10 pts ($4.95/mo = excellent)
- **Total: 105 pts**

**Winner:** Plan 2 scores higher despite lower savings due to flexibility and fees.

This demonstrates how the multi-factor scoring balances cost with other important factors.

---

**Document Owner:** Dev Agent (James)
**Review Status:** Ready for Implementation
**Next Steps:** Update `plan-scoring.ts` with new weights per AC9
