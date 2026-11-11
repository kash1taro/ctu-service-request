# CTU Smart Campus Service Request System

## Run
Service workers need `http://localhost` (not file://):
```
cd ctu-service-request
python -m http.server 8000      # or: npx serve
```
Open http://localhost:8000, reload once (caches assets), then DevTools > Network > Offline to test.

## File structure
| File | Role |
|---|---|
| `js/ui.js` | Presentation (DOM only) |
| `js/app.js` | Controller, connects UI and logic |
| `js/requestService.js` | Request-processing logic (validation, ID, filtering, status) |
| `js/dataService.js` | Data access (mock server API, localStorage) |
| `js/config.js` | Status keys/labels and concern types |
| `sw.js`, `manifest.json`, `icon.svg` | PWA |

## Architecture diagram
```
 ┌──────────┐ handlers ┌──────────┐ createRequest()/   ┌────────────────┐ insert()/update()/ ┌─────────────┐
 │  ui.js   │◄────────►│  app.js  │ changeStatus()/    │requestService.js│ getAll()           │dataService.js│
 │ (forms,  │ callbacks│(controller)│──listRequests()─► │(validate, ID,  │──────────────────► │(localStorage │
 │  list)   │          │          │                    │ status, filter)│◄────────────────── │ "server" API)│
 └──────────┘          └──────────┘                    └────────────────┘   data / errors    └─────────────┘
        config.js (status labels, concern types) is shared read-only by ui.js and requestService.js
        sw.js caches the app shell (index, css, js) for offline loading
```
UI never touches storage; storage never touches DOM; logic knows neither.

## HOTS answers
**Identical descriptions:** each submission gets its own ID (`CTU-<timestamp>-<random>`) and is pushed as a new record. Nothing is matched or merged by description, so both are tracked independently.

**Status rename (Part II):** records store status *keys* (`pending`, `in_progress`, `resolved`). Labels live only in `config.js`. Change the three `label` values to Submitted / Under Review / Completed. The form, filter, list and storage need no edits.

**Offline:** app shell loads from cache. Saved requests can still be viewed. Submitting or changing status shows "NOT completed" and nothing is saved, so the app never claims success falsely.

**Usability HOTS:** completing the tasks only measures effectiveness. Usability also needs efficiency (extra time and clicks hunting for buttons), errors (wrong clicks/backtracking), learnability (could a new user find things without help), and satisfaction (frustration, confidence). A user who succeeds slowly and with frustration indicates a poorly usable interface.

## Usability test record (fill in with your real classmate's results)
| Task | Completed (Yes/No) | Time Taken | Errors Observed |
|---|---|---|---|
| Submit a service request | | | |
| Locate the submitted request | | | |
| Check the request status | | | |

Suggested improvement to implement/propose: make the Submit button larger and sticky on mobile, and add a "Copy ID" button after submission.

## Video script (Part V)
- **A Server failure:** submit normally (success + ID shown) -> tick "Simulate server failure" -> submit again -> red error says NOT saved, list unchanged. Also tick Offline in DevTools to show the offline message.
- **B Validation:** submit blank (all errors) -> enter name "123" and description "abc" (invalid messages) -> fix -> success.
- **C Loose coupling:** show original label in `config.js` ("Pending") -> change to "Submitted" (or change a label in `ui.js`) -> reload; filter, storage, validation still work. Explain the module separation.
- Also show: two identical descriptions -> different IDs; search by ID; filter by status; install/offline reload.
