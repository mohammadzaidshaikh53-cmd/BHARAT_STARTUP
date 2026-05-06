// Time decay factor: newer content gets a multiplier > 1
export function applyTimeDecay(score, publishedAt) {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  const decay = Math.exp(-0.05 * ageHours); // 5% decay per hour
  return score * (1 + (1 - decay) * 0.2);
}

// Session boost per category (limits echo chamber)
export function applyCategoryBoost(score, categoryId, sessionCategoryBoosts, maxBoost = 0.3) {
  const boost = Math.min(maxBoost, sessionCategoryBoosts.get(categoryId) || 0);
  return score + boost;
}

// Diversity penalty: if same category appears too often in a row
export function applyDiversityPenalty(posts, categoryOrder, maxSame = 2) {
  let penalty = 0;
  let lastCat = null;
  let count = 0;
  for (const post of posts) {
    const cat = post.category_id;
    if (cat === lastCat) count++;
    else { lastCat = cat; count = 1; }
    if (count > maxSame) penalty += 0.05;
  }
  return penalty;
}