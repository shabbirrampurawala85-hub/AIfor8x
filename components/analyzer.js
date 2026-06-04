/**
 * GoViral AI - Analyzer Module (Virality Scoring & Feedback Calculations)
 */

class ContentAnalyzer {
  constructor() {
    this.baseScores = {
      virality: 64,
      hook: 70,
      pacing: 58
    };
    
    this.currentScores = { ...this.baseScores };
  }

  // Evaluates text script input and returns personalized metrics
  analyzeText(scriptText) {
    // Generate organic score adjustments based on script attributes
    const charCount = scriptText.length;
    const wordCount = scriptText.split(/\s+/).filter(w => w.length > 0).length;
    
    let hookBonus = 0;
    let pacingBonus = 0;
    let feedback = "";
    
    // 1. Analyze script length
    if (wordCount < 15) {
      pacingBonus -= 15;
      feedback = "Script is extremely short. Pacing will feel abrupt; add more detail.";
    } else if (wordCount > 150) {
      pacingBonus -= 10;
      feedback = "Script is verbose. Viewers will drop off; try to cut down by 20%.";
    } else {
      pacingBonus += 5;
      feedback = "Excellent script length for a 30-second video flow.";
    }

    // 2. Look for strong hooks (Questions, numbers, curiosity words)
    const lowerText = scriptText.toLowerCase();
    const hookWords = ['how to', 'secret', 'stop', 'hack', 'killing', 'why', 'setting', ' realized', 'don\'t', 'never', '99%'];
    const hasHookWord = hookWords.some(word => lowerText.includes(word));
    
    if (hasHookWord) {
      hookBonus += 15;
    } else {
      hookBonus -= 8;
    }

    // Determine target scores
    const targetHook = Math.max(10, Math.min(98, 65 + hookBonus));
    const targetPacing = Math.max(10, Math.min(98, 60 + pacingBonus));
    const targetVirality = Math.round((targetHook * 0.45) + (targetPacing * 0.55));

    this.baseScores = {
      virality: targetVirality,
      hook: targetHook,
      pacing: targetPacing
    };

    this.currentScores = { ...this.baseScores };
    return {
      scores: this.currentScores,
      feedback: feedback
    };
  }

  // Toggles check status and computes new active scores
  recalculateScores(checkboxStates) {
    let bonusVirality = 0;
    let bonusHook = 0;
    let bonusPacing = 0;

    // Apply bonuses
    if (checkboxStates.hookOverlay) {
      bonusHook += 8;
      bonusVirality += 4;
    }
    if (checkboxStates.pacingCut) {
      bonusPacing += 12;
      bonusVirality += 6;
    }
    if (checkboxStates.musicBoost) {
      bonusPacing += 5;
      bonusVirality += 3;
    }
    if (checkboxStates.ctaEnd) {
      bonusVirality += 3;
    }

    this.currentScores.hook = Math.min(99, this.baseScores.hook + bonusHook);
    this.currentScores.pacing = Math.min(99, this.baseScores.pacing + bonusPacing);
    
    // Virality score is weighted combo of hook & pacing + direct bonus
    const weightedBase = Math.round((this.currentScores.hook * 0.45) + (this.currentScores.pacing * 0.55));
    this.currentScores.virality = Math.min(99, weightedBase + bonusVirality);

    return this.currentScores;
  }

  // Smooth number counting animation utility
  animateNumber(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    if (startValue === targetValue) return;

    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function outQuad
      const easedProgress = progress * (2 - progress);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easedProgress);

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetValue;
      }
    }

    requestAnimationFrame(update);
  }

  // Helper to determine virality status rating label
  getScoreLabel(score) {
    if (score >= 90) return { text: "Viral Elite", class: "emerald-glow" };
    if (score >= 80) return { text: "High Potential", class: "emerald-glow" };
    if (score >= 60) return { text: "Moderate Viral", class: "gold-glow" };
    return { text: "Low Probability", class: "gold-glow" };
  }
}

// Global hook
window.ContentAnalyzer = ContentAnalyzer;
