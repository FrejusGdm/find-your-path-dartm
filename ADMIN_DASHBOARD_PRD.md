# Admin Dashboard PRD - Find Your Path

## Overview
**Problem**: Opportunities have broken URLs, poor descriptions, inadequate tags, and no way to edit/manage existing content. Need comprehensive admin interface for content quality management.

**Solution**: Build admin-only dashboard for opportunity management, content quality control, and system maintenance.

---

## 1. Problem Statement

### Current Pain Points
- **Broken URLs**: Many opportunity links don't work or redirect incorrectly
- **Poor Content Quality**: Descriptions are inconsistent, tags are inadequate
- **No Edit Capability**: Cannot update existing opportunities once submitted
- **No Moderation**: Auto-approval means low-quality content goes live immediately
- **Manual Maintenance**: No tools to identify/fix issues at scale

### Impact on Users
- Students click broken links → frustration and lost opportunities
- Poor descriptions → students can't understand opportunities
- Inconsistent tagging → search and filtering doesn't work well
- Outdated information → wasted time on expired/changed opportunities

---

## 2. Goals & Success Metrics

### Primary Goals
1. **Content Quality**: 95%+ of opportunity links work correctly
2. **Admin Efficiency**: Reduce time to fix issues from manual to automated
3. **User Experience**: Improve opportunity discovery through better content

### Success Metrics
- **Link Health**: <5% broken links at any time
- **Content Standards**: All opportunities have complete, standardized descriptions
- **Admin Productivity**: Ability to review/edit 50+ opportunities per hour
- **User Engagement**: Increased click-through rates on opportunities

---

## 3. User Stories

### As an Admin, I want to:
- **Content Management**
  - View all opportunities in a sortable/filterable table
  - Edit any opportunity field (title, description, URL, tags, etc.)
  - Bulk edit multiple opportunities at once
  - Delete or deactivate outdated opportunities

- **Quality Control**
  - See which URLs are broken and fix them quickly
  - Standardize descriptions across similar opportunities
  - Add missing tags and improve categorization
  - Review submitted opportunities before they go live

- **System Monitoring**
  - Get alerts when URLs break or content needs attention
  - See analytics on most popular/least popular opportunities
  - Track user engagement and click-through rates
  - Export data for analysis and backup

- **User Management**
  - See who submitted what opportunities
  - Manage user permissions and roles
  - Handle reports of inappropriate content

---

## 4. Feature Requirements

### 4.1 MVP Features (Phase 1) - 2-3 weeks

#### A. Admin Authentication & Access
- **Route**: `/admin` (protected route)
- **Auth**: Clerk-based authentication with admin role check
- **Admin Users**: Initially just you (provide email for admin role assignment)
- **Security**: Admin-only routes with proper middleware protection

#### B. Opportunity Management Interface
- **Opportunities Table**
  - Sortable columns: Title, Department, Category, Created Date, Status, URL Status
  - Filters: Active/Inactive, Category, Department, Date Range, URL Status
  - Search: Full-text search across title/description
  - Pagination: 25/50/100 items per page
  - Bulk actions: Select multiple → Activate/Deactivate/Delete

- **Edit Opportunity Modal/Page**
  - All fields editable: title, description, department, category
  - URL management: officialUrl, applicationUrl with live validation
  - Tags: Add/remove tags with autocomplete from existing tags
  - Eligibility: Years, majors, international, GPA requirements
  - Contact info: Name, role, email (optional fields)
  - Next steps: Add/edit/reorder action items
  - Save/Cancel with change tracking

#### C. URL Health Monitoring
- **URL Status Indicators**
  - Green: Working (200 status)
  - Yellow: Redirected (300 status)
  - Red: Broken (400/500 status)
  - Gray: Not checked yet

- **URL Testing**
  - Manual "Test URL" button for immediate checking
  - Automatic URL validation on save
  - Batch URL testing for all opportunities
  - URL history tracking (when it broke, previous status)

#### D. Content Quality Tools
- **Missing Data Alerts**
  - Highlight opportunities missing descriptions
  - Flag short descriptions (<50 characters)
  - Identify untagged opportunities
  - Show empty required fields

- **Content Standards**
  - Character count for descriptions
  - Tag suggestions based on category/department
  - Duplicate detection (similar titles/descriptions)
  - Formatting guidelines/templates

### 4.2 Advanced Features (Phase 2) - 3-4 weeks

#### A. Analytics Dashboard
- **Opportunity Performance**
  - Most viewed opportunities (last 30 days)
  - Click-through rates by category
  - Popular departments and tags
  - Conversion funnel: views → clicks → saves

- **System Health**
  - Total opportunities by status
  - URL health overview
  - Recent submissions and edits
  - User engagement trends

#### B. Submission Review System
- **Pending Submissions Queue**
  - New submissions start as "pending" instead of auto-approved
  - Review interface with approve/reject/edit options
  - Bulk approval for trusted submitters
  - Rejection reasons and feedback to submitters

- **Content Moderation**
  - Flag inappropriate content
  - Edit submissions before approval
  - Create content guidelines and templates
  - Quality scoring system

#### C. Advanced Management
- **Bulk Operations**
  - CSV import/export for opportunities
  - Bulk tag addition/removal
  - Batch URL updates
  - Mass category/department changes

- **Automated Maintenance**
  - Scheduled URL checking (daily/weekly)
  - Email alerts for broken links
  - Duplicate opportunity detection
  - Stale content identification (old dates)

### 4.3 Future Features (Phase 3) - 4-6 weeks

#### A. User Management
- **Contributor System**
  - View submission history by user
  - Trust levels: New → Verified → Trusted
  - Automatic approval for trusted contributors
  - Contribution statistics and badges

#### B. Advanced Analytics
- **Student Success Tracking**
  - Integration with "success stories" submissions
  - ROI tracking for opportunities
  - Department/category performance analysis
  - A/B testing for descriptions/titles

#### C. External Integrations
- **Data Sources**
  - Dartmouth official opportunity feeds
  - Department website scraping (with permission)
  - Calendar integration for deadlines
  - Email notifications for updates

---

## 5. Technical Specifications

### 5.1 Frontend (Next.js)
```
/admin
├── /opportunities
│   ├── page.tsx (main table)
│   ├── [id]/edit/page.tsx (edit form)
│   └── components/
│       ├── OpportunityTable.tsx
│       ├── EditOpportunityForm.tsx
│       ├── URLStatusBadge.tsx
│       └── BulkActions.tsx
├── /analytics
│   └── page.tsx (dashboard)
├── /submissions
│   └── page.tsx (pending review)
└── layout.tsx (admin nav)
```

### 5.2 Backend (Convex)
**New Mutations Needed:**
```typescript
// opportunities.ts
export const updateOpportunity = mutation({ ... })
export const deleteOpportunity = mutation({ ... })
export const bulkUpdateOpportunities = mutation({ ... })
export const checkURL = mutation({ ... })
export const approveSubmission = mutation({ ... })

// admin.ts
export const getAdminStats = query({ ... })
export const getURLHealthReport = query({ ... })
export const getPendingSubmissions = query({ ... })
```

**Schema Updates:**
```typescript
// Add to opportunities table
urlStatus: v.optional(v.string()), // "working" | "broken" | "redirect" | "unchecked"
lastUrlCheck: v.optional(v.number()),
submissionStatus: v.string(), // "pending" | "approved" | "rejected"
reviewedBy: v.optional(v.string()),
reviewedAt: v.optional(v.number()),
```

### 5.3 Authentication & Authorization
- **Admin Role Check**: Middleware to verify admin status
- **Admin User Setup**: Add admin role to your Clerk user profile
- **Route Protection**: All `/admin/*` routes require admin authentication
- **Audit Logging**: Track who made what changes when

---

## 6. User Interface Design

### 6.1 Layout
- **Admin Navigation**: Sidebar with Opportunities, Analytics, Submissions, Settings
- **Consistent UI**: Use existing shadcn/ui components for consistency
- **Responsive**: Mobile-friendly for quick edits on the go
- **Dark Mode**: Support existing theme system

### 6.2 Key Screens
1. **Opportunities Table**: Main management interface
2. **Edit Form**: Comprehensive opportunity editor
3. **Analytics Dashboard**: Key metrics and insights
4. **Submissions Queue**: Review pending content
5. **URL Health Report**: Broken link management

---

## 7. Implementation Plan

### Week 1: Foundation
- [ ] Admin authentication and route protection
- [ ] Basic opportunities table with view/filter/search
- [ ] URL status checking functionality
- [ ] Simple edit form for opportunities

### Week 2: Core Management
- [ ] Complete edit form with all fields
- [ ] Bulk operations (activate/deactivate/delete)
- [ ] URL health monitoring and testing
- [ ] Content quality indicators

### Week 3: Polish MVP
- [ ] User experience improvements
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Week 4+: Advanced Features
- [ ] Analytics dashboard
- [ ] Submission review system
- [ ] Automated maintenance tools
- [ ] Advanced bulk operations

---

## 8. Risk Mitigation

### Technical Risks
- **Data Loss**: Implement proper backups and audit trails
- **Performance**: Optimize queries for large datasets
- **Security**: Ensure admin-only access is bulletproof

### User Risks
- **Learning Curve**: Create comprehensive admin documentation
- **Mistakes**: Implement undo functionality and change tracking
- **Overwhelm**: Start with core features, gradually add complexity

---

## 9. Success Criteria

### Phase 1 Success (MVP)
- [ ] Can edit all existing opportunities
- [ ] Can identify and fix broken URLs
- [ ] Can maintain content quality standards
- [ ] Admin workflow reduces maintenance time by 75%

### Phase 2 Success (Advanced)
- [ ] Submission review reduces low-quality content by 90%
- [ ] Analytics provide actionable insights
- [ ] Automated tools catch issues before users encounter them

### Long-term Success
- [ ] 95%+ URL uptime
- [ ] Consistent, high-quality opportunity descriptions
- [ ] Self-sustaining content quality through automation
- [ ] Measurable improvement in student engagement

---

## 10. Next Steps

1. **Immediate**: Provide admin email for role assignment
2. **Week 1**: Begin admin dashboard development
3. **Ongoing**: Document all existing broken URLs for initial cleanup
4. **Future**: Consider expanding admin access to trusted student contributors

---

*This PRD serves as the blueprint for transforming Find Your Path from a content creation platform to a high-quality, well-maintained opportunity discovery system.*