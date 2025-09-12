# Future Roadmap: Wall of Advice Feature

## Overview 📝
The "Wall of Advice" will be a Pinterest-style page where Dartmouth students share their experiences, tips, and advice about discovering opportunities on campus.

## Vision 🎯
Create a community-driven platform where students can learn from each other's journeys, mistakes, and successes. This feature aims to build confidence and provide actionable insights from peer experiences.

## Content Strategy 💡

### Types of Advice Posts:
1. **Success Stories**
   - "How I got my first research position"
   - "From undeclared to dream internship"
   - "My path to the Dickey Center fellowship"

2. **Practical Tips**
   - "Best email templates for reaching out to professors"
   - "What I wish I knew before applying to study abroad"
   - "Time management tips for balancing research and coursework"

3. **Encouragement & Mindset**
   - "Why rejection letters aren't the end"
   - "Imposter syndrome is real (and how I dealt with it)"
   - "It's okay to change your path"

4. **Specific Program Insights**
   - "What the D-Plan Internship really taught me"
   - "Life as an international student at Dartmouth"
   - "First-gen student resources I discovered"

### Content Sources:
- **Student Interviews**: Reach out to successful upperclassmen
- **Alumni Stories**: Recent grads sharing their journeys
- **Community Submissions**: Form for students to share their own advice
- **Faculty Insights**: Professors sharing student success stories
- **Program Coordinators**: Tips from people who run key programs

## Technical Implementation 🛠️

### Database Schema (Add to existing Convex schema):
```typescript
// Add to convex/schema.ts
advicePosts: defineTable({
  title: v.string(),
  content: v.string(),
  authorName: v.string(),
  authorYear: v.optional(v.string()),
  authorMajor: v.optional(v.string()),
  category: v.string(), // "research", "internships", "study-abroad", "general", etc.
  tags: v.array(v.string()),
  isAnonymous: v.boolean(),
  isApproved: v.boolean(),
  featured: v.boolean(),
  likes: v.number(),
  createdAt: v.number(),
})
.index("by_category", ["category"])
.index("by_approved", ["isApproved"])
.index("by_featured", ["featured"])
```

### UI Components to Build:
1. **AdviceCard**: Pinterest-style card with hover effects
2. **AdviceGrid**: Masonry layout for cards
3. **AdviceFilters**: Filter by category, year, etc.
4. **AdviceSubmissionForm**: For community contributions
5. **AdviceDetail**: Full post view with comments

### Design Inspiration:
- **Pinterest masonry layout**: Staggered card heights
- **Medium-style reading**: Clean typography, good spacing
- **Instagram vibes**: Visual, engaging, personal
- **Notion-like categories**: Easy filtering and discovery

## Content Collection Plan 📋

### Phase 1: Seed Content
- Interview 10-15 successful students across different areas
- Create template questions for consistency
- Focus on diverse perspectives (international, first-gen, different majors)

### Phase 2: Community Growth
- Launch submission form
- Encourage sharing through existing channels
- Feature system to highlight best advice

### Phase 3: Advanced Features
- Comment system for questions/follow-ups
- Like/bookmark functionality
- Search within advice posts
- Email newsletter with weekly featured advice

## Sample Interview Questions 🎤

1. **Background**: What's your year, major, and one opportunity you discovered?
2. **Discovery**: How did you first learn about this opportunity?
3. **Application**: What was the process like? Any surprises?
4. **Advice**: What would you tell a freshman about exploring opportunities?
5. **Mistakes**: What would you do differently if you could start over?
6. **Resources**: What tools/people helped you the most?

## Marketing & Launch Strategy 📢

### Soft Launch:
- Start with 20-30 high-quality advice posts
- Share with close network for feedback
- Test mobile experience thoroughly

### Public Launch:
- Social media campaign with compelling student stories
- Email to relevant campus groups
- Partner with existing student organizations

### Growth:
- Weekly featured advice posts
- Integration with main chat AI (reference advice posts)
- Cross-promotion with opportunities page

## Success Metrics 📊

### Engagement:
- Time spent on advice pages
- Number of advice posts viewed per session
- Click-through rate to related opportunities

### Community:
- User-submitted advice posts per month
- Quality scores from peer reviews
- Repeat visitors to advice section

### Impact:
- Students mentioning advice posts helped them
- Opportunities discovered through advice references
- Community growth and participation

## Technical Documentation for AI Agents 🤖

### Component Structure:
```
components/advice/
├── AdviceCard.tsx           # Individual advice post card
├── AdviceGrid.tsx           # Masonry layout container
├── AdviceFilters.tsx        # Category and tag filtering
├── AdviceSubmissionForm.tsx # Community contribution form
├── AdviceDetail.tsx         # Full post view
└── types.ts                 # TypeScript definitions
```

### Key Implementation Notes:
- Use `react-masonry-css` for Pinterest-style layout
- Implement virtual scrolling for performance with large datasets
- Add rich text editor for advice submissions (TipTap or similar)
- Ensure mobile-first responsive design
- Include accessibility features (screen reader support, keyboard navigation)

### Integration Points:
- **Chat AI**: Reference relevant advice posts in responses
- **Opportunities**: Link related advice posts to opportunity details
- **User Profiles**: Show user's bookmarked advice posts

---

*This roadmap should be revisited after completing the core opportunities system. The Wall of Advice feature will significantly enhance community engagement and provide valuable peer-to-peer learning opportunities.*