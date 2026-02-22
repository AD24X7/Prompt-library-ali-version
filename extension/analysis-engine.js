// analysis-engine.js — Pure-function business analysis from extracted page signals
// All scoring uses weighted factors based on real SaaS benchmarks

const AnalysisEngine = {
  // ── Main entry point ───────────────────────────────────────────────
  analyze(pageData, benchmarks, competitors) {
    const category = this.resolveCategory(pageData, competitors);
    const monetization = this.assessMonetization(pageData, benchmarks, category);
    const completeness = this.assessCompleteness(pageData);
    const competitive = this.assessCompetitive(category, competitors);
    const revenue = this.projectRevenue(monetization, completeness, competitive, benchmarks, category);
    const recommendations = this.generateRecommendations(pageData, monetization, completeness, competitive, category);

    return {
      summary: this.buildSummary(pageData, category, revenue),
      category,
      monetization,
      completeness,
      competitive,
      revenue,
      recommendations,
      overallScore: this.computeOverallScore(monetization, completeness, competitive, revenue),
    };
  },

  // ── Category resolution ────────────────────────────────────────────
  resolveCategory(pageData, competitors) {
    const cat = pageData.category;
    const primary = cat.primaryCategory;
    const competitorData = competitors.categories[primary] || null;

    return {
      primary,
      secondary: cat.secondaryCategory,
      confidence: this.categoryConfidence(cat),
      competitorData,
    };
  },

  categoryConfidence(cat) {
    const topScore = Object.values(cat.categoryScores)[0] || 0;
    if (topScore >= 5) return "high";
    if (topScore >= 3) return "medium";
    if (topScore >= 1) return "low";
    return "unclear";
  },

  // ── Monetization assessment ────────────────────────────────────────
  assessMonetization(pageData, benchmarks, category) {
    const pricing = pageData.pricing;
    const catKey = category.primary;
    const pricingBench = benchmarks.pricingBenchmarks[catKey.replace(/-/g, "_")] ||
      benchmarks.pricingBenchmarks["micro_saas"];

    let readinessScore = 0;
    const signals = [];

    if (pricing.hasPricing) {
      readinessScore += 30;
      signals.push({ text: "Pricing is visible on the page", positive: true });
    } else {
      signals.push({ text: "No pricing found — monetization strategy unclear", positive: false });
    }

    if (pricing.hasPaymentCTA) {
      readinessScore += 25;
      signals.push({ text: "Payment/signup CTAs detected", positive: true });
    }

    if (pricing.hasFreeTrialMention) {
      readinessScore += 15;
      signals.push({ text: "Free trial or freemium model mentioned", positive: true });
    }

    if (pricing.tierCount >= 2) {
      readinessScore += 15;
      signals.push({ text: `${pricing.tierCount} pricing tier keywords found — good tiered structure`, positive: true });
    }

    if (pageData.tech.hasStripe) {
      readinessScore += 15;
      signals.push({ text: "Stripe integration detected — payment-ready", positive: true });
    }

    if (pageData.tech.hasAuth) {
      readinessScore += 10;
      signals.push({ text: "Authentication detected — user accounts enabled", positive: true });
    }

    return {
      score: Math.min(readinessScore, 100),
      label: this.scoreLabel(readinessScore),
      suggestedModel: pricingBench.model,
      suggestedPrice: `$${pricingBench.sweet_spot}/mo`,
      priceRange: `$${pricingBench.typical_range[0]}-$${pricingBench.typical_range[1]}/mo`,
      detectedPrices: pricing.priceMentions,
      signals,
    };
  },

  // ── Product completeness ───────────────────────────────────────────
  assessCompleteness(pageData) {
    let score = 0;
    const signals = [];

    // Navigation depth
    if (pageData.features.navDepth >= 5) {
      score += 20;
      signals.push({ text: `${pageData.features.navDepth} navigation items — solid information architecture`, positive: true });
    } else if (pageData.features.navDepth >= 3) {
      score += 12;
      signals.push({ text: `${pageData.features.navDepth} navigation items — basic structure present`, positive: true });
    } else {
      signals.push({ text: "Minimal navigation — looks like a single-page prototype", positive: false });
    }

    // Feature breadth
    const headingCount = pageData.features.headings.length;
    if (headingCount >= 10) {
      score += 20;
      signals.push({ text: `${headingCount} content sections — comprehensive content`, positive: true });
    } else if (headingCount >= 5) {
      score += 12;
      signals.push({ text: `${headingCount} content sections — moderate depth`, positive: true });
    } else {
      score += 5;
      signals.push({ text: `Only ${headingCount} content sections — early stage`, positive: false });
    }

    // Interactive elements
    if (pageData.inputCount >= 5) {
      score += 20;
      signals.push({ text: `${pageData.inputCount} input fields — interactive product`, positive: true });
    } else if (pageData.inputCount >= 2) {
      score += 10;
      signals.push({ text: `${pageData.inputCount} input fields — some interactivity`, positive: true });
    } else {
      signals.push({ text: "Few interactive elements — mostly static content", positive: false });
    }

    // CTA count
    if (pageData.features.ctas.length >= 5) {
      score += 15;
      signals.push({ text: "Multiple CTAs — good conversion funneling", positive: true });
    } else if (pageData.features.ctas.length >= 2) {
      score += 8;
      signals.push({ text: "Some CTAs present", positive: true });
    }

    // Tech maturity
    if (pageData.tech.hasAuth && pageData.tech.hasDatabase) {
      score += 15;
      signals.push({ text: "Auth + database detected — full-stack product", positive: true });
    } else if (pageData.tech.hasAuth || pageData.tech.hasDatabase) {
      score += 8;
      signals.push({ text: "Backend infrastructure partially detected", positive: true });
    }

    // Analytics
    if (pageData.tech.hasAnalytics) {
      score += 10;
      signals.push({ text: "Analytics tracking in place — data-driven approach", positive: true });
    }

    return {
      score: Math.min(score, 100),
      label: this.scoreLabel(Math.min(score, 100)),
      signals,
    };
  },

  // ── Competitive analysis ───────────────────────────────────────────
  assessCompetitive(category, competitors) {
    const catData = category.competitorData;
    if (!catData) {
      return {
        score: 50,
        label: "Unknown",
        saturation: "unknown",
        players: [],
        marketSize: "N/A",
        opportunity: "Category not in our database — could be a blue ocean or too niche to have data.",
        signals: [{ text: "Category not recognized — manual competitive research needed", positive: false }],
      };
    }

    const saturationScores = {
      very_high: 20,
      high: 35,
      medium: 60,
      low: 80,
    };

    const score = saturationScores[catData.saturation] || 50;
    const signals = [];

    if (catData.saturation === "very_high" || catData.saturation === "high") {
      signals.push({
        text: `${catData.saturation.replace("_", " ")} saturation — ${catData.players.length} major players`,
        positive: false,
      });
      signals.push({
        text: `Key moat in this space: ${catData.moat}`,
        positive: false,
      });
    } else {
      signals.push({
        text: `${catData.saturation} saturation — room for new entrants`,
        positive: true,
      });
    }

    signals.push({
      text: `Market opportunity: ${catData.opportunity}`,
      positive: true,
    });

    return {
      score,
      label: this.scoreLabel(score),
      saturation: catData.saturation,
      players: catData.players,
      avgPricing: catData.avgPricing,
      marketSize: catData.marketSize,
      moat: catData.moat,
      opportunity: catData.opportunity,
      signals,
    };
  },

  // ── Revenue projection ─────────────────────────────────────────────
  projectRevenue(monetization, completeness, competitive, benchmarks, category) {
    const catKey = category.primary;
    const pricingBench = benchmarks.pricingBenchmarks[catKey.replace(/-/g, "_")] ||
      benchmarks.pricingBenchmarks["micro_saas"];
    const convRates = benchmarks.conversionRates;
    const saasMedians = benchmarks.saasMedians;

    const monthlyPrice = pricingBench.sweet_spot || 29;
    const readinessFactor = monetization.score / 100;
    const completenessFactor = completeness.score / 100;
    const competitiveFactor = competitive.score / 100;

    // Scenario modeling
    const baseVisitors = 1000; // monthly visitors assumption
    const convRate = monetization.score > 50
      ? convRates.free_trial_to_paid
      : convRates.freemium_to_paid;

    const pessimistic = Math.round(baseVisitors * 0.5 * convRate * monthlyPrice * competitiveFactor);
    const realistic = Math.round(baseVisitors * convRate * monthlyPrice * (readinessFactor + competitiveFactor) / 2);
    const optimistic = Math.round(baseVisitors * 3 * convRate * monthlyPrice * 1.2);

    const yearlyRealistic = realistic * 12;
    const timeToRamen = realistic > 0 ? Math.ceil(3000 / realistic) : null; // $3k/mo = ramen profitable

    return {
      monthlyPrice,
      scenarios: {
        pessimistic: { mrr: pessimistic, arr: pessimistic * 12, label: "Conservative" },
        realistic: { mrr: realistic, arr: yearlyRealistic, label: "Base case" },
        optimistic: { mrr: optimistic, arr: optimistic * 12, label: "If it takes off" },
      },
      timeToRamen: timeToRamen
        ? `~${timeToRamen} months to reach $3K MRR (ramen profitable)`
        : "Revenue model needs work before projection",
      benchmarkContext: `Median SaaS hits $1M ARR in ~${saasMedians.medianARR_0_1M.months_to_reach} months`,
    };
  },

  // ── Recommendations ────────────────────────────────────────────────
  generateRecommendations(pageData, monetization, completeness, competitive, category) {
    const recs = [];

    // Monetization recs
    if (monetization.score < 30) {
      recs.push({
        priority: "high",
        area: "Monetization",
        action: "Add a pricing page with at least 2-3 tiers. Even a simple Free/Pro split validates willingness to pay.",
        reasoning: "No pricing signals detected. Visitors cannot convert to paying customers.",
      });
    } else if (monetization.score < 60) {
      recs.push({
        priority: "medium",
        area: "Monetization",
        action: `Consider the ${monetization.suggestedModel} model at ${monetization.suggestedPrice}. Add Stripe or Lemon Squeezy for payments.`,
        reasoning: "Some pricing signals but no clear payment flow.",
      });
    }

    // Completeness recs
    if (completeness.score < 40) {
      recs.push({
        priority: "high",
        area: "Product",
        action: "Focus on building the core loop: one action users repeat daily. Add auth so users can save state.",
        reasoning: "Prototype is early-stage. Prioritize the habit loop over feature breadth.",
      });
    }

    // Competitive recs
    if (competitive.saturation === "very_high") {
      recs.push({
        priority: "high",
        area: "Positioning",
        action: `This space has ${competitive.players.length}+ incumbents (${competitive.players.slice(0, 3).join(", ")}). Pick a narrow niche: specific industry, persona, or workflow.`,
        reasoning: `${competitive.opportunity}`,
      });
    } else if (competitive.saturation === "high") {
      recs.push({
        priority: "medium",
        area: "Positioning",
        action: `Differentiate clearly from ${competitive.players.slice(0, 3).join(", ")}. Your moat needs to be something they can't easily copy.`,
        reasoning: `Market moat is typically: ${competitive.moat}`,
      });
    }

    // Distribution recs
    if (!pageData.tech.hasAnalytics) {
      recs.push({
        priority: "medium",
        area: "Distribution",
        action: "Add analytics (PostHog, Plausible, or Mixpanel) to understand user behavior before scaling.",
        reasoning: "No analytics detected. You're flying blind on user engagement.",
      });
    }

    // Auth rec
    if (!pageData.tech.hasAuth) {
      recs.push({
        priority: "medium",
        area: "Product",
        action: "Add user authentication (Clerk, Supabase Auth, or Auth0). Users can't form habits without accounts.",
        reasoning: "No auth detected — product is likely stateless for visitors.",
      });
    }

    // Always add a launch rec
    recs.push({
      priority: "low",
      area: "Launch",
      action: "Ship to Product Hunt, Hacker News, and relevant subreddits. First 100 users matter more than perfection.",
      reasoning: "Early traction validates the concept faster than more features.",
    });

    return recs.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
  },

  // ── Summary builder ────────────────────────────────────────────────
  buildSummary(pageData, category, revenue) {
    const platform = pageData.platform !== "unknown"
      ? `Detected on ${pageData.platform}`
      : "Standalone prototype";
    const cat = category.primary !== "unknown"
      ? category.primary.replace(/-/g, " ")
      : "unclassified category";
    const arr = revenue.scenarios.realistic.arr;

    return {
      oneLiner: `${platform} — ${cat} product with ${arr > 10000 ? "meaningful" : "early-stage"} revenue potential.`,
      platform: pageData.platform,
      category: cat,
      realisticARR: `$${arr.toLocaleString()}`,
    };
  },

  // ── Scoring helpers ────────────────────────────────────────────────
  computeOverallScore(monetization, completeness, competitive, revenue) {
    const raw =
      monetization.score * 0.25 +
      completeness.score * 0.20 +
      competitive.score * 0.15 +
      Math.min((revenue.scenarios.realistic.arr / 50000) * 100, 100) * 0.40;
    const score = Math.round(Math.min(raw, 100));
    return {
      score,
      label: this.scoreLabel(score),
      grade: this.scoreGrade(score),
    };
  },

  scoreLabel(score) {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Promising";
    if (score >= 40) return "Early";
    if (score >= 20) return "Needs work";
    return "Not ready";
  },

  scoreGrade(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C+";
    if (score >= 50) return "C";
    if (score >= 40) return "D+";
    if (score >= 30) return "D";
    return "F";
  },
};

// Make available in both module and global contexts
if (typeof module !== "undefined") module.exports = AnalysisEngine;
