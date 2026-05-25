# Google Calendar Integration in Rehab360

## 1. Overview

Rehab360 allows patients to add their scheduled exercises as reminders to their personal Google Calendar. This is implemented as a **URL-based automation** — not a Google Calendar REST API integration.

Key characteristics:
- No Google API credentials, OAuth tokens, or Google Cloud project are required
- The integration is entirely **client-side (frontend only)**
- The backend is not involved in the calendar interaction at all
- The patient manually confirms the event in Google Calendar — Rehab360 cannot add events automatically

**Purpose:** After a patient builds their weekly exercise schedule, they can click a link that opens Google Calendar in a new browser tab with the event pre-filled. They click "Save" inside Google Calendar to add it to their own calendar.

---

## 2. Integration Approach: The URL Template Method

Google Calendar exposes a public URL that pre-fills a new event form without requiring any authentication:

```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...
```

This is called the **"Add to Google Calendar" URL template**. It is a well-known, publicly documented feature of Google Calendar. Anyone can open this URL and it will show them a pre-filled event creation form in their own account.

### URL Parameters

| Parameter | Description | Example value |
|-----------|-------------|---------------|
| `action`  | Must be `TEMPLATE` to pre-fill a new event | `TEMPLATE` |
| `text`    | The event title | `Wall+Squats` |
| `dates`   | Start and end datetime in `YYYYMMDDTHHmmss/YYYYMMDDTHHmmss` format | `20250525T143000/20250525T144000` |
| `details` | Event description body | `3+sets%0ARehab360+exercise+reminder` |

The URL is constructed using the JavaScript `URLSearchParams` API, which handles all percent-encoding automatically.

---

## 3. The `buildCalendarUrl` Utility

**File:** [client/src/pages/patient/schedule-exercise/utils/buildCalendarUrl.ts](Rehab360/client/src/pages/patient/schedule-exercise/utils/buildCalendarUrl.ts)

```typescript
export function buildCalendarUrl(exerciseName: string, date: string, time: string, sets: number): string {
  const datePart = date.replace(/-/g, '')
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const startDt = `${datePart}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
  const totalMins = h * 60 + m + 10
  const endH = Math.floor(totalMins / 60) % 24
  const endM = totalMins % 60
  const endDt = `${datePart}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: exerciseName,
    dates: `${startDt}/${endDt}`,
    details: `${sets} sets\nRehab360 exercise reminder`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
```

### Step-by-step breakdown

**Input parameters:**
- `exerciseName` — e.g., `"Wall Squats"`
- `date` — ISO date string e.g., `"2025-05-25"`
- `time` — 24-hour time string e.g., `"14:30"`
- `sets` — number of sets e.g., `3`

**Processing:**

1. **Date formatting** — dashes are stripped from the date:
   `"2025-05-25"` → `"20250525"`

2. **Time parsing** — the time string is split on `:` and parsed into hours and minutes:
   `"14:30"` → `h = 14`, `m = 30`

3. **Start datetime** — formatted as `YYYYMMDDTHHmmss`:
   `"20250525T143000"`

4. **End time calculation** — the event duration is hardcoded to **10 minutes**:
   ```
   totalMins = 14 * 60 + 30 + 10 = 880
   endH = Math.floor(880 / 60) % 24 = 14
   endM = 880 % 60 = 40
   ```
   `"20250525T144000"`

5. **URL construction** — `URLSearchParams` builds the query string:
   ```
   action=TEMPLATE
   text=Wall+Squats
   dates=20250525T143000%2F20250525T144000
   details=3+sets%0ARehab360+exercise+reminder
   ```

6. **Final URL:**
   ```
   https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wall+Squats&dates=20250525T143000%2F20250525T144000&details=3+sets%0ARehab360+exercise+reminder
   ```

---

## 4. The `CalendarLinksModal` Component

**File:** [client/src/pages/patient/schedule-exercise/components/CalendarLinksModal.tsx](Rehab360/client/src/pages/patient/schedule-exercise/components/CalendarLinksModal.tsx)

This modal is shown after the patient clicks "Save Schedule" (when reminders are enabled). It presents a list of all scheduled exercises with calendar links, and the final "Save Schedule" button that persists the data to the database.

### Data interface

```typescript
export interface CalendarItem {
  exerciseName: string  // e.g., "Wall Squats"
  date: string          // YYYY-MM-DD, e.g., "2025-05-25"
  time: string          // HH:MM, e.g., "14:30"
  sets: number          // e.g., 3
}
```

### Component props

```typescript
interface Props {
  items: CalendarItem[]   // exercises to display
  onSave: () => void      // called when "Save Schedule" is clicked → triggers API call
  onClose: () => void     // called to dismiss the modal without saving
}
```

### Behavior

- Renders a `<ul>` list; each `<li>` has the exercise name, date/time, and a calendar link
- Uses a local `Set<number>` state called `added` to track which exercise indices have been clicked
- When the patient clicks "Add To Google Calendar":
  - The link opens `buildCalendarUrl(...)` result in a new tab (`target="_blank"`)
  - The link index is added to the `added` set
  - The link is replaced by a green checkmark label "Added to Google Calendar"
- The modal uses `rel="noopener noreferrer"` on the link for security (prevents the new tab from accessing the opener window)
- Clicking outside the modal closes it (overlay click handler)
- The "Save Schedule" button in the footer calls `onSave`, which triggers the API mutation to persist the data to the database — **saving and adding to calendar are independent actions**

---

## 5. Full User Flow

```
Patient opens Weekly Schedule page
        │
        ▼
Drags exercises onto day slots (Monday–Sunday)
Sets reminder date + time per exercise
Toggles reminders on/off (global switch)
        │
        ▼
Clicks "Save Schedule"
        │
        ▼
Validation runs:
  - If reminders ON:  every exercise needs a date AND a time
  - If reminders OFF: every exercise needs a date
        │
   (if any unscheduled exercises)
        ▼
Unscheduled exercises confirmation dialog
        │
        ▼
If reminders ON → CalendarLinksModal opens
        │
  ┌─────┴─────────────────────────────────┐
  │                                       │
  ▼                                       ▼
Patient clicks each               Patient skips and
"Add To Google Calendar" link     clicks "Save Schedule"
        │                                 │
        ▼                                 │
Google Calendar opens                     │
in a new browser tab                      │
(pre-filled event form)                   │
        │                                 │
        ▼                                 │
Patient clicks "Save"                     │
inside Google Calendar                    │
        │                                 │
        └──────────┬──────────────────────┘
                   ▼
        Patient clicks "Save Schedule"
        in CalendarLinksModal
                   │
                   ▼
        POST /patient/weekly-schedule/{patient_id}
                   │
                   ▼
        INSERT INTO weekly_plans (database)
```

If reminders are **disabled**, the modal is skipped entirely and the save goes straight to the database.

---

## 6. Backend API Endpoints

**File:** [server/app/api/patient_routes.py](Rehab360/server/app/api/patient_routes.py)

### GET `/patient/weekly-schedule/{patient_id}`

Returns all exercises available for the patient to schedule, pulled from their active treatment plans.

The SQL query joins:
- `plan_exercises` — the specific exercises (with sets, reps, weight)
- `plans` — the treatment plan (filtered so today falls within `start_date`–`end_date`)
- `exercises` — the exercise definitions (name, visit type)
- `sessions` — the patient's active therapy sessions

```sql
SELECT e.exercise_id, reps, num_sets, pe.weight, time_duration, time_unit,
       e.exercise_name, e.visit_type, pe.session_id, p.plan_id
FROM plan_exercises pe, plans p, exercises e
WHERE p.plan_id = pe.plan_id
  AND e.exercise_id = pe.exercise_id
  AND p.session_id = pe.session_id
  AND p.end_date >= CURDATE()
  AND p.start_date <= CURDATE()
  AND pe.session_id IN (
      SELECT s.session_id FROM sessions s
      WHERE s.patient_id = %s AND s.session_status = 'ACTIVE')
```

### POST `/patient/weekly-schedule/{patient_id}`

Saves the patient's schedule. Request body (Pydantic model):

```python
class SaveWeeklyScheduleRequest(BaseModel):
    reminders_enabled: bool
    schedule: list[SaveScheduleItem]

class SaveScheduleItem(BaseModel):
    exercise_id: int
    day_index: int        # 0 = Sunday, 6 = Saturday
    sets: int
    reminder_date: str | None   # YYYY-MM-DD
    reminder_time: str | None   # HH:MM
    session_id: int | None
    plan_id: int | None
```

---

## 7. Database Storage

**Table:** `weekly_plans`

```sql
CREATE TABLE weekly_plans (
  weekly_plan_id     INT AUTO_INCREMENT,
  plan_id            INT,
  session_id         INT,
  exercise_id        INT,
  reminder_time      DATETIME NOT NULL,
  notification_enabled BOOLEAN,
  exercise_date      DATE,
  PRIMARY KEY (weekly_plan_id, plan_id, session_id, exercise_id)
)
```

### How data is stored

The repository layer uses `INSERT ... ON DUPLICATE KEY UPDATE` so re-saving a schedule is safe and idempotent — no duplicate rows are created.

```python
INSERT INTO weekly_plans (plan_id, session_id, exercise_id,
                          reminder_time, notification_enabled, exercise_date)
VALUES (%s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE
    reminder_time = VALUES(reminder_time),
    notification_enabled = VALUES(notification_enabled)
```

**Sentinel value:** If no reminder date/time is set, the backend stores `1970-01-01 00:00:00` in `reminder_time` and `1970-01-01` in `exercise_date` rather than NULL. This satisfies the `NOT NULL` constraint on `reminder_time`.

**`notification_enabled`:** Stores the global reminders toggle. This flag is informational — the backend **never sends push notifications**. It is stored for potential future use.

---

## 8. Architecture Layer Summary

| Layer | File | Role in calendar feature |
|-------|------|--------------------------|
| UI component | `CalendarLinksModal.tsx` | Shows exercise list, renders links, tracks "added" state |
| URL builder | `buildCalendarUrl.ts` | Constructs the Google Calendar URL |
| Page controller | `ExerciseSchedule.tsx` | Validates input, decides whether to show modal |
| API hook | `useSaveWeeklySchedule.ts` | TanStack Query mutation wrapping the POST call |
| API hook | `useGetWeeklySchedule.ts` | TanStack Query query wrapping the GET call |
| Route handler | `patient_routes.py` | HTTP layer — receives requests, calls service |
| Service | `patient_services.py` | Business logic layer (thin here) |
| Repository | `patient_repository.py` | Raw SQL — reads exercises, writes weekly_plans |
| Database | `weekly_plans` table | Persists schedule + reminder metadata |

**The Google Calendar side (URL opens in browser) is completely outside this stack.** Rehab360 has no connection to Google's servers.

---

## 9. What Happens on the Google Calendar Side

When the patient opens the constructed URL:

1. Google Calendar detects the `action=TEMPLATE` parameter
2. It pre-fills a "New Event" form with:
   - **Title:** the exercise name
   - **Date and time:** the start and end datetimes from the `dates` parameter
   - **Description:** the sets count and the "Rehab360 exercise reminder" label
3. The patient is shown the event creation form inside their own Google Calendar account
4. They click "Save" — Google saves the event to their calendar
5. The browser tab can be closed

Rehab360 has no way to know whether the patient actually saved the event. The "Added to Google Calendar" state in the modal is set purely by whether the patient **clicked the link**, not by any confirmation from Google.

---

## 10. Limitations and Design Decisions

| Limitation | Explanation |
|------------|-------------|
| **One-way only** | Rehab360 can push events to Google Calendar but cannot read, update, or delete them |
| **No event tracking** | Google Calendar event IDs are never stored — there is no link between a `weekly_plans` row and any calendar event |
| **Manual action required** | The patient must click each link and confirm each event individually in Google Calendar |
| **No push notifications** | `notification_enabled` is stored in the database but the backend never sends any alerts or reminders |
| **10-minute duration** | All calendar events are 10 minutes regardless of actual exercise duration — this is hardcoded in `buildCalendarUrl.ts` |
| **No sync** | If the patient changes their schedule in Rehab360, the old Google Calendar events are not updated or removed |
| **No OAuth** | Rehab360 never accesses the user's Google account — the integration works entirely through the public URL template |

### Why this approach was chosen

- **Zero infrastructure cost:** No Google Cloud project, no OAuth 2.0 setup, no service account, no API quota management
- **Works for any Google account:** The user authenticates with Google themselves when they open the URL
- **Simple and reliable:** A URL that opens a browser tab cannot fail due to token expiry, quota limits, or API changes
- **Appropriate for MVP scope:** Calendar reminders are a convenience feature; a lightweight approach is sufficient

The trade-off is that the integration is not automated — users must act manually. A future version could use the Google Calendar API with OAuth to create events programmatically, which would also enable syncing and deletion.

---

## 11. Key Files Reference

| File | Purpose |
|------|---------|
| [client/src/pages/patient/schedule-exercise/utils/buildCalendarUrl.ts](Rehab360/client/src/pages/patient/schedule-exercise/utils/buildCalendarUrl.ts) | Constructs the Google Calendar URL from exercise data |
| [client/src/pages/patient/schedule-exercise/components/CalendarLinksModal.tsx](Rehab360/client/src/pages/patient/schedule-exercise/components/CalendarLinksModal.tsx) | Modal UI component showing calendar links |
| [client/src/pages/patient/schedule-exercise/ExerciseSchedule.tsx](Rehab360/client/src/pages/patient/schedule-exercise/ExerciseSchedule.tsx) | Main schedule page — controls save flow and modal display |
| [client/src/hooks/paitent/useSaveWeeklySchedule.ts](Rehab360/client/src/hooks/paitent/useSaveWeeklySchedule.ts) | TanStack Query mutation for saving the schedule |
| [client/src/hooks/paitent/useGetWeeklySchedule.ts](Rehab360/client/src/hooks/paitent/useGetWeeklySchedule.ts) | TanStack Query query for fetching exercises |
| [server/app/api/patient_routes.py](Rehab360/server/app/api/patient_routes.py) | Backend route handlers for the schedule endpoints |
| [server/app/dal/patient_repository.py](Rehab360/server/app/dal/patient_repository.py) | Database layer — SQL queries for reading/writing schedule data |
| [db/init.sql](Rehab360/db/init.sql) | Database schema including `weekly_plans` table definition |
