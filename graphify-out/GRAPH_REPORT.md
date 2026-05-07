# Graph Report - bharat-startup  (2026-05-07)

## Corpus Check
- 131 files · ~852,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 416 nodes · 537 edges · 66 communities (64 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `43deb059`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 20 edges
2. `Container()` - 14 edges
3. `validateContent()` - 11 edges
4. `fetchPersonalizedFeed()` - 10 edges
5. `useAuthUser()` - 9 edges
6. `Button()` - 8 edges
7. `generateUniqueSlug()` - 8 edges
8. `Spinner()` - 7 edges
9. `handleServiceError()` - 7 edges
10. `createIdea()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `BlogFeedPage()` --calls--> `useFeed()`  [INFERRED]
  app/blog/page.js → lib/hooks/useFeed.js
- `CommunityFeedPage()` --calls--> `useFeed()`  [INFERRED]
  app/community/page.js → lib/hooks/useFeed.js
- `NewIdeaPage()` --calls--> `useAuthUser()`  [INFERRED]
  app/ideas/new/page.js → lib/utils/useAuthUser.js
- `LoginPage()` --calls--> `useReducedMotion()`  [INFERRED]
  app/login/page.js → components/chat/TypingIndicator.js
- `NewMotivationPage()` --calls--> `useAuthUser()`  [INFERRED]
  app/motivation/new/page.js → lib/utils/useAuthUser.js

## Communities (66 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (26): fetchIndustries(), fetchIndustryBySlug(), fetchOrganizationBySlug(), fetchOrganizationMembers(), fetchOrganizationProducts(), fetchOrganizationRelationships(), fetchOrganizations(), fetchOrganizationsByIndustry() (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (14): AnimatedButton(), DiscussionPreview(), DiscussionTypeSelector(), MagneticInput(), NewDiscussionPage(), NewIdeaPage(), NewMotivationPage(), NewQAPage() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (8): getFileExtension(), getFileIcon(), getFileNameFromUrl(), extractUserInfo(), getUserDisplayName(), cn(), GlassCard(), SectionHeader()

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (11): ChatRoom(), Composer(), Button(), cn(), Spinner(), useTypingIndicator(), getPasswordStrength(), LoginPage() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (3): ChatList(), panelSlide(), slideX()

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (12): createBiography(), createDiscussion(), createIdea(), createMotivation(), createQuestion(), getCurrentUser(), handleServiceError(), normalizeTags() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.23
Nodes (10): applyDiversity(), CommunityFeedPage(), FeedCard(), getContentConfig(), resolveContentType(), useCategoryBoost(), useCommunityFeed(), usePostTracking() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (12): dedupeItems(), fetchPersonalizedFeed(), getLastSession(), getNextCursor(), getSessionSeen(), isItemSeen(), markItemAsSeen(), saveLastSession() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (9): BlogCard(), BlogFeedPage(), useEngagementQueue(), useEngagementTracking(), useFeed(), usePostTracking(), useEngagementNormalizer(), useLRUCache() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (3): Navbar(), QueryProvider(), ThemeProvider()

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (10): CommunityFeedPage(), FeedCard(), getContentConfig(), ParticleField(), useCategoryBoost(), useCommunityFeed(), useIsMobile(), usePostTracking() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (6): DiscussionThread(), BlogPostPage(), formatDate(), generateMetadata(), getImageUrl(), Avatar()

### Community 13 - "Community 13"
Cohesion: 0.36
Nodes (5): useReducedMotion(), getSafePreset(), getTransition(), isValidPreset(), useMotionTransition()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (3): TagInput(), BlogEditor(), useAutoSave()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Container()` connect `Community 1` to `Community 2`, `Community 6`, `Community 8`, `Community 10`, `Community 11`, `Community 16`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 2` to `Community 3`, `Community 4`, `Community 9`, `Community 11`, `Community 16`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `validateContent()` (e.g. with `createIdea()` and `createDiscussion()`) actually correct?**
  _`validateContent()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `useAuthUser()` (e.g. with `NewDiscussionPage()` and `NewIdeaPage()`) actually correct?**
  _`useAuthUser()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._