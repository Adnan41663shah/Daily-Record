# Dashboard Stats Calculation Guide

This guide explains how each dashboard number is calculated in EMS-CloudBlitz, in simple terms.

It covers:
- What each metric means
- The exact formula used in code
- Which timestamp is used for filtering
- Important edge cases that affect what users see

---

## 1) Date Filtering Rules (Used Across Dashboards)

Before reading any stat, understand the date logic:

- **Presales-stage records** are filtered by `createdAt`.
- **Sales-stage records** are filtered by `forwardedAt` when available; otherwise by `createdAt`.
- For custom ranges, backend uses local day boundaries:
  - `dateFrom` -> local `00:00:00.000`
  - `dateTo` -> local `23:59:59.999`
- Dashboard timezone defaults to `Asia/Kolkata` for grouped trend labels.

### Effective Dashboard Date (core concept)

For many charts/KPIs:

```text
effectiveDashboardDate =
  if department == 'sales' and forwardedAt exists
    then forwardedAt
    else createdAt
```

---

## 2) Admin Dashboard (Overview Tab)

Frontend: `frontend/src/pages/dashboard/AdminOverviewTab.tsx`  
Backend: `backend/src/controllers/inquiry/dashboardOperations.ts` + `backend/src/helpers/dashboardAggregation.ts`

## 2.1 KPI Cards

### Total Enquiries
- **Definition:** Total inquiries in selected date window.
- **Formula:**  
  `Total Enquiries = count(all inquiries matching dashboard date filter)`

### Presales Inquiries
- **Definition:** Inquiries currently in presales department.
- **Formula:**  
  `Presales Inquiries = count(inquiries where department='presales' in current period)`

### Sales Inquiries
- **Definition:** Inquiries currently in sales department.
- **Formula:**  
  `Sales Inquiries = count(inquiries where department='sales' in current period)`

### Converted
- **Definition:** Inquiries marked converted in selected period.
- **Formula:**  
  `Converted = count(inquiries where isConverted=true and convertedAt within current period)`

### Admitted
- **Definition:** Inquiries marked admitted in selected period.
- **Formula:**  
  `Admitted = count(inquiries where isAdmitted=true and admittedAt within current period)`

### Overall Conversion %
- **Definition:** Share of sales inquiries that became converted in same comparison period.
- **Formula:**  
  `Overall Conversion % = (Converted / Sales Inquiries) * 100`  
  If denominator is 0, value is 0.

### Avg Response Time
- **Definition:** Average time sales team took to attend after forwarding.
- **Formula:**  
  `Avg Response Time = average(attendedAt - forwardedAt)`  
  only for inquiries with both timestamps and non-negative difference.

## 2.2 Trend Badges on KPI Cards

For each card, trend compares **current window** vs **previous equivalent window**:

```text
Trend% = ((current - previous) / previous) * 100
```

Edge handling:
- If previous = 0 and current > 0 -> trend shown as `100%`.
- If previous = 0 and current = 0 -> `0%`.
- UI trend utility caps absolute trend display at `999%`.

## 2.3 Sales Funnel (Enquiries -> Presales -> Sales -> Converted -> Admission)

- This is not a separate backend funnel API.
- It reuses the same card counts above, shown as stages.

## 2.4 Advanced Analytics

### Performance Over Time
- **Definition:** Time buckets showing inquiry volume, conversion volume, and admission volume.
- **Bucketing:**
  - `today`: hourly buckets (0-23)
  - other ranges: daily buckets
- **Formulas per bucket:**
  - `Inquiries = count(records where effective dashboard date in bucket)`
  - `Conversions = count(records where isConverted=true and convertedAt in same bucket)`
  - `Admissions = count(records where isAdmitted=true and admittedAt in same bucket)`

### Lead Source
- **Definition:** Inquiry distribution by normalized medium/source.
- **Formula per source:**  
  `value = count(source)`  
  `conversionRate = (converted in source / total in source) * 100`
- Common normalization: `website/Website/WEBSITE -> Website`, empty -> `unknown`.

### Location
- **Definition:** Inquiry and conversion split by preferred location.
- **Formula per location:**  
  `inquiries = count(location)`  
  `conversions = count(isConverted=true in location)`  
  `conversionRate = (conversions / inquiries) * 100`

### Course
- **Definition:** Inquiry and conversion split by course.
- **Formula per course:**  
  `inquiries = count(course)`  
  `conversions = count(isConverted=true in course)`  
  `conversionRate = (conversions / inquiries) * 100`

## 2.5 Top Performers

### Top Sales Performers
- Built from sales assignees.
- Per user:
  - `totalAttended = count(sales inquiries assignedTo user)`
  - `converted = count(isConverted=true among those)`
  - `admitted = count(isAdmitted=true among those)`
  - `conversionRate = (converted / totalAttended) * 100`
- Ranking sort:
  1. higher `conversionRate`
  2. higher `admitted`
  3. higher `totalAttended`

### Top Presales Performers
- Per user:
  - `totalCreated = count(inquiries createdBy user in range)`
  - `totalForwarded = count(inquiries forwardedBy user to sales in range)`
- Ranking sort:
  1. higher `totalForwarded`
  2. higher `totalCreated`
  3. name alphabetical

## 2.6 Recent Activity

- Shows latest activity records in selected date range.
- Includes actor, action type, inquiry label, optional target user, and timestamp.

---

## 3) Center Dashboard

Frontend: `frontend/src/pages/dashboard/CenterDashboard.tsx`  
Backend: `backend/src/controllers/inquiry/dashboardOperations.ts` (`getCenterDashboardStats`)

- Same formulas as Admin Overview.
- Adds center filter (`preferredLocation` normalization).
- For sales users, center permission is enforced:
  - no permission -> API returns empty stats (not hard 403 in dashboard payload).

Metrics, charts, top performers, and activity follow the same calculation model as admin, but only for the selected center.

---

## 4) Sales Dashboard (Sales User View)

Frontend: `frontend/src/pages/dashboard/SalesDashboardOverview.tsx`  
Backend analytics endpoint: `GET /inquiries/dashboard/sales`

This view combines:
- frontend-calculated KPI cards from the user's inquiries
- backend-provided analytics charts
- follow-up health from `GET /inquiries/my-follow-ups`

## 4.1 KPI Cards

### Assigned Inquiries
- **Displayed label:** Assigned Inquiries
- **Actual logic meaning:** Count of unique inquiries where the sales user had attendance/follow-up activity in selected period.
- **Rule:** inquiry is counted if either:
  1. first follow-up created in range, or
  2. any follow-up created/updated in range
- **All-time fallback:** count inquiries having at least one follow-up.

### Conversions
- **Formula:**  
  `Conversions = count(user inquiries where isConverted=true and convertedAt in range)`

### Admissions
- **Formula:**  
  `Admissions = count(user inquiries where isAdmitted=true and admittedAt in range)`

### Conversion Rate
- **Formula:**  
  `Conversion Rate = (Conversions / Assigned Inquiries) * 100`

### Avg Response Time
- **Formula:**  
  `Avg Response Time = average(attendedAt - forwardedAt)`  
  using current cohort inquiries with both timestamps and non-negative difference.

## 4.2 Analytics Cards/Charts

### Performance Over Time (backend)
- Same structure as admin performance chart:
  - inquiries by effective dashboard date bucket
  - conversions by convertedAt bucket
  - admissions by admittedAt bucket

### Lead Source (backend)
- Source distribution of filtered user inquiries:
  - source resolved from `inquirySource || medium || 'Direct'`
  - then normalized by canonical medium/source mapper.

### Follow-ups (task health in this screen)
- Uses `my-follow-ups` API data to match follow-up page behavior:
  - **Overdue:** incomplete + has nextFollowUpDate + due < now
  - **Upcoming:** incomplete + has nextFollowUpDate + due >= now

---

## 5) Presales Dashboard (Presales User View)

Frontend: `frontend/src/pages/dashboard/PresalesDashboardOverview.tsx`  
Backend: `GET /inquiries/dashboard/presales`

## 5.1 KPI Cards

### Raised Inquiries
- **Formula:**  
  `Raised Inquiries = count(inquiries createdBy current presales user in range)`

### Forwarded by Me
- **Formula:**  
  `Forwarded by Me = count(inquiries where forwardedBy=current user and department='sales' and forwardedAt in range)`

### Pending Follow-ups
- **Definition:** Inquiry-level pending workload (not raw follow-up row count).
- **Logic:** for inquiries that contain follow-ups created by current presales user:
  - exclude inquiry if forwarded to sales or assigned to someone else
  - from incomplete follow-ups, take latest pending follow-up
  - if its pending date is in selected range, count inquiry as pending

### Overdue Follow-ups
- **Definition:** Overdue subset of pending inquiries.
- **Formula:**  
  `Overdue Follow-ups = count(pending inquiries where latest pending nextFollowUpDate < now)`

### Completed Follow-ups
- **Formula:**  
  Count follow-up rows by current user where `completionStatus='complete'` and completion timestamp is in selected range.  
  Completion timestamp preference:
  `completedAt || updatedAt || createdAt`

---

## 6) Generic Dashboard (`/inquiries/dashboard`)

Used only for roles without dedicated admin/sales/presales dashboards.

Metrics include:
- `totalInquiries`, dynamic status counts (hot/warm/cold, etc.)
- `myInquiries` (created by me)
- `assignedInquiries` (assigned to me OR forwarded by me)
- `presalesInquiries`, `salesInquiries`
- `admittedStudents`
- `recentInquiries` (latest 5 non-admitted in role scope)

Important: this endpoint excludes admitted inquiries from most active-pipeline counts.

---

## 7) Important Interpretation Notes for Non-Technical Users

1. **One dashboard can mix different event dates.**  
   Volume uses created/forwarded dates; conversion/admission use convertedAt/admittedAt.

2. **Conversion % denominator changes by dashboard.**
   - Admin/Center cards: `Converted / Sales Inquiries`
   - Sales personal card: `Conversions / Assigned Inquiries`

3. **"Assigned Inquiries" in Sales view is activity-based, not only assignment field.**  
   It reflects where the user actually worked via follow-ups.

4. **Pending follow-up counts are usually inquiry-level in presales logic.**  
   One inquiry with multiple pending actions still contributes one pending inquiry in that KPI.

5. **Admitted inquiries are excluded from active pipeline counts in multiple backend aggregations.**

---

## 8) Endpoint Map (Quick Reference)

- `GET /inquiries/dashboard` -> generic role stats
- `GET /inquiries/dashboard/admin-overview` -> admin full overview
- `GET /inquiries/dashboard/center?center=...` -> center-restricted overview
- `GET /inquiries/dashboard/sales` -> sales chart analytics
- `GET /inquiries/dashboard/presales` -> presales KPI metrics
- `GET /inquiries/my-follow-ups` -> follow-up health used by sales dashboard

