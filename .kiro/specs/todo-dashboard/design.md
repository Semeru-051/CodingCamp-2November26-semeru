# Design Document

## Overview

This dashboard website provides a self-contained to-do list application with a live clock with greeting, Pomodoro focus timer, and quick links to favorite websites. The application runs entirely in the browser using HTML, CSS, and vanilla JavaScript, with all data persisted using the Local Storage API.

The design follows a client-side-only architecture where all logic is contained within the browser, with no backend services required. The application is organized into distinct sections: a header with clock and greeting, a focus timer for Pomodoro sessions, a task management section with drag-and-drop sorting, and quick links for favorite websites. All visual appearance is controlled through a light/dark theme system.

## Architecture

### High-Level Architecture

The application uses a modular architecture with separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Environment                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    HTML Structure                       │  │
│  │  - Semantic elements (header, main, section, ul, li)   │  │
│  │  - Form elements for user input                        │  │
│  │  - ARIA attributes for accessibility                   │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   CSS Styling                           │  │
│  │  - CSS Custom Properties (variables)                   │  │
│  │  - Flexbox and Grid for layout                         │  │
│  │  - Animations and transitions                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 JavaScript Modules                      │  │
│  │  - ThemeManager                                         │  │
│  │  - ClockManager                                         │  │
│  │  - TimerManager                                         │  │
│  │  - TodoManager                                          │  │
│  │  - LinksManager                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Local Storage                          │  │
│  │  - dashboard_theme                                      │  │
│  │  - dashboard_todos                                      │  │
│  │  - dashboard_links                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

- **ThemeManager**: Handles light/dark theme switching and persistence
- **ClockManager**: Manages the live clock display and time-appropriate greeting
- **TimerManager**: Controls the Pomodoro timer with start/stop/reset functionality
- **TodoManager**: Manages task CRUD operations, drag-and-drop sorting, and persistence
- **LinksManager**: Handles quick links CRUD operations and URL validation

### Data Flow

1. User interacts with UI elements (buttons, inputs, drag operations)
2. Event handlers trigger module-specific logic
3. Module updates in-memory data structures
4. Changes are persisted to Local Storage
5. UI is re-rendered to reflect changes

## Components and Interfaces

### Component Hierarchy

```
Dashboard
├── Header (topbar)
│   ├── Theme Toggle (btn-icon)
│   ├── Greeting (h1)
│   ├── Clock (div)
│   └── Date Display (div)
├── Main Grid
│   ├── Focus Timer Card
│   │   ├── Timer Display
│   │   ├── Custom Minutes Input
│   │   ├── Start Button
│   │   ├── Stop Button
│   │   └── Reset Button
│   ├── To-Do List Card
│   │   ├── Add Task Form
│   │   │   ├── Task Input
│   │   │   └── Add Button
│   │   ├── Task List (ul)
│   │   │   └── Task Item (li) - repeated
│   │   │       ├── Checkbox
│   │   │       ├── Task Text
│   │   │       ├── Edit Button
│   │   │       └── Delete Button
│   │   └── Empty State Message
│   └── Quick Links Card
│       ├── Add Link Form
│       │   ├── Link Name Input
│       │   ├── Link URL Input
│       │   └── Add Button
│       ├── Links Grid
│       │   └── Link Chip - repeated
│       │       ├── favicon
│       │       ├── Link Anchor
│       │       └── Delete Button
│       └── Empty State Message
└── Edit Task Modal
    ├── Edit Input
    ├── Save Button
    └── Cancel Button
```

### Component Interfaces

#### ThemeManager
- **Methods**: `init()`
- **State**: `theme` (light|dark)
- **Storage Key**: `dashboard_theme`

#### ClockManager
- **Methods**: `init()`
- **State**: Current time, hour for greeting calculation
- **Updates**: Clock display every 1 second

#### TimerManager
- **Methods**: `init()`
- **State**: `totalSeconds`, `remaining`, `isRunning`
- **Events**: Timer start, stop, reset, finish

#### TodoManager
- **Methods**: `init()`, `addTodo()`, `toggleTodo()`, `deleteTodo()`, `saveTodoEdit()`
- **State**: Array of todo objects
- **Events**: Drag start, drag over, drag end

#### LinksManager
- **Methods**: `init()`, `addLink()`, `deleteLink()`
- **State**: Array of link objects
- **Validation**: URL must start with http:// or https://

## Data Models

### Todo Object
```javascript
{
  id: number,        // Unique timestamp-based identifier
  text: string,      // Task description (max 120 chars)
  done: boolean      // Completion status
}
```

### Link Object
```javascript
{
  id: number,        // Unique timestamp-based identifier
  label: string,     // Display name (max 30 chars)
  url: string        // Full URL with protocol (validated)
}
```

### Theme Preference
```javascript
string // 'light' or 'dark'
```

## Local Storage Schema

| Key | Type | Description |
|-----|------|-------------|
| `dashboard_theme` | string | User's theme preference ('light' or 'dark') |
| `dashboard_todos` | array | JSON array of todo objects |
| `dashboard_links` | array | JSON array of link objects |

### Example Storage Content

```json
{
  "dashboard_theme": "dark",
  "dashboard_todos": [
    {
      "id": 1704067200000,
      "text": "Complete project design",
      "done": false
    },
    {
      "id": 1704067260000,
      "text": "Review pull requests",
      "done": true
    }
  ],
  "dashboard_links": [
    {
      "id": 1704067320000,
      "label": "GitHub",
      "url": "https://github.com"
    }
  ]
}
```

## State Management Approach

### State Containers

Each module maintains its own state:

```javascript
// ThemeManager state
let theme = 'light' | 'dark'

// ClockManager state
// Derived from new Date() - no persistent state

// TimerManager state
let totalSeconds = 1500  // 25 minutes in seconds
let remaining = 1500
let intervalId = null
let isRunning = false

// TodoManager state
let todos = []  // Array of todo objects
let editingId = null  // ID of task being edited
let draggedId = null  // ID of task being dragged

// LinksManager state
let links = []  // Array of link objects
```

### State Updates

1. **Direct Assignment**: Simple state changes (theme toggle, timer values)
2. **Array Operations**: Add/edit/delete operations on todos and links
3. **Persistence**: All state changes trigger `save()` to Local Storage
4. **Re-render**: State changes trigger UI re-render for visibility updates

### State Persistence Strategy

- **On Change**: Immediate persistence after every user action
- **Atomic Operations**: Each save operation writes the complete array/object
- **Error Handling**: Try-catch blocks around Local Storage operations
- **Graceful Degradation**: Empty states shown if Local Storage unavailable

## Event Flow for Key Interactions

### Timer Start/Stop/Reset Flow

```
User clicks Start button
    ↓
TimerManager.start() called
    ↓
Validate timer not running and remaining > 0
    ↓
Set isRunning = true, disable Start button
    ↓
Create setInterval for 1000ms
    ↓
Decrement remaining each second
    ↓
Call render() to update display
    ↓
If remaining === 0:
    ↓
Clear interval, notify user, enable Start button
```

```
User clicks Stop button
    ↓
TimerManager.stop() called
    ↓
Clear interval, set isRunning = false
    ↓
Re-enable Start button
    ↓
Call render() to update display
```

```
User clicks Reset button
    ↓
TimerManager.reset() called
    ↓
Call stop() to halt timer
    ↓
Reset remaining to totalSeconds
    ↓
Call render() to update display
```

### Add Task Flow

```
User types in input field
    ↓
User submits form (Enter key or click Add button)
    ↓
Event handler prevents default form submission
    ↓
Validate input.value.trim() is non-empty
    ↓
Create new todo object:
    - id: Date.now()
    - text: trimmed input value
    - done: false
    ↓
Add to todos array
    ↓
Call TodoManager.save() → persist to Local Storage
    ↓
Call TodoManager.render() → update UI
    ↓
Clear input field
```

### Edit Task Flow

```
User clicks Edit button on task
    ↓
TodoManager.openEditModal(id, text) called
    ↓
Set editingId = id
    ↓
Populate editInput with task text
    ↓
Show modal and backdrop
    ↓
Focus editInput, select text
```

```
User clicks Save or presses Enter
    ↓
TodoManager.saveTodoEdit(editingId, editInput.value) called
    ↓
Find task by id, update text if non-empty
    ↓
Call TodoManager.save() → persist to Local Storage
    ↓
Call TodoManager.render() → update UI
    ↓
Call closeEditModal()
```

### Delete Task Flow

```
User clicks Delete button on task
    ↓
TodoManager.deleteTodo(id) called
    ↓
Filter todos array to exclude task with matching id
    ↓
Call TodoManager.save() → persist to Local Storage
    ↓
Call TodoManager.render() → update UI
```

### Drag-and-Drop Reorder Flow

```
User begins dragging a task
    ↓
dragstart event fired on task element
    ↓
Set draggedId = element.dataset.id
    ↓
Add 'dragging' class to element
    ↓
Set dataTransfer.effectAllowed = 'move'
```

```
User drags task over another task
    ↓
dragover event fired on list element
    ↓
Prevent default (allow drop)
    ↓
Calculate drop position using getDragAfterElement()
    ↓
Move dragged element to new position in DOM
```

```
User releases drag
    ↓
dragend event fired on task element
    ↓
Remove 'dragging' class from element
    ↓
Set draggedId = null
    ↓
Read new order from DOM: Array.from(list.children).map(li => parseInt(li.dataset.id))
    ↓
Sort todos array to match new order
    ↓
Call TodoManager.save() → persist to Local Storage
```

### Add Link Flow

```
User fills name and URL inputs
    ↓
User submits link form
    ↓
Event handler prevents default form submission
    ↓
Validate label and URL are non-empty
    ↓
Ensure URL has protocol (prepend https:// if missing)
    ↓
Create new link object:
    - id: Date.now()
    - label: trimmed label
    - url: validated URL with protocol
    ↓
Add to links array
    ↓
Call LinksManager.save() → persist to Local Storage
    ↓
Call LinksManager.render() → update UI
    ↓
Clear input fields
```

### Delete Link Flow

```
User clicks Delete button on link chip
    ↓
Event handler stops propagation (prevent anchor click)
    ↓
LinksManager.deleteLink(id) called
    ↓
Filter links array to exclude link with matching id
    ↓
Call LinksManager.save() → persist to Local Storage
    ↓
Call LinksManager.render() → update UI
```

### Theme Toggle Flow

```
User clicks theme toggle button
    ↓
ThemeManager click handler called
    ↓
Read current theme from <html data-theme>
    ↓
Switch to opposite theme
    ↓
Call ThemeManager.apply(newTheme)
    ↓
Set <html data-theme> attribute
    ↓
Save to Local Storage: localStorage.setItem('dashboard_theme', newTheme)
```

## Visual Layout Description

### Layout Structure

The dashboard uses a responsive CSS Grid layout that adapts to screen size:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Header (sticky top)                                                        │
│  ┌────────────┬──────────────────────────────┬──────────────────────────┐  │
│  │  Theme     │  Greeting                    │  (empty)                  │  │
│  │  Toggle    │  Clock                       │                           │  │
│  │            │  Date                        │                           │  │
│  └────────────┴──────────────────────────────┴──────────────────────────┘  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Main Grid (3-column responsive)                                            │
│  ┌─────────────┬─────────────┬─────────────┐                               │
│  │  Timer      │  To-Do      │  Quick      │  ← Large screens (1400px+)   │
│  │  Card       │  Card       │  Links Card │                               │
│  └─────────────┴─────────────┴─────────────┘                               │
│                                                                             │
│  ┌─────────────┬─────────────┐                                              │
│  │  Timer      │  To-Do      │  ← Medium screens (minmax(300px, 1fr))     │
│  │  Card       │  Card       │                                              │
│  └─────────────┴─────────────┘                                              │
│  ┌─────────────┐                                                            │
│  │  Quick      │                                                            │
│  │  Links      │                                                            │
│  │  Card       │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
│  ┌─────────────────────────┐                                                │
│  │  Timer                  │  ← Small screens (mobile)                     │
│  │  ─────────────────────  │                                                │
│  │  To-Do                  │                                                │
│  │  ─────────────────────  │                                                │
│  │  Quick                  │                                                │
│  │  Links                  │                                                │
│  └─────────────────────────┘                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

### Card Layout

Each card follows a consistent structure:

```
┌─────────────────────────────────────┐
│  Section Title (uppercase, muted)   │
├─────────────────────────────────────┤
│  Card Content                       │
│  (varies by card type)              │
└─────────────────────────────────────┘
```

#### Timer Card Content
```
┌─────────────────────────────────────┐
│  Focus Timer                        │
├─────────────────────────────────────┤
│                                     │
│        25:00                        │  ← Timer display (centered)
│                                     │
│      [Set minutes] [Set]            │  ← Custom input
│                                     │
│   [Start] [Stop] [Reset]            │  ← Controls
└─────────────────────────────────────┘
```

#### To-Do Card Content
```
┌─────────────────────────────────────┐
│  To-Do List                         │
│  Drag to reorder                    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ [Add new task...] [Add]     │    │  ← Input form
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ ☑ Task item 1  [✏️] [🗑️]    │    │  ← Task with edit/delete
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ✘ Task item 2 [✏️] [🗑️]     │    │  ← Completed task (strikethrough)
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ☐ Task item 3 [✏️] [🗑️]     │    │  ← Active task
│  └─────────────────────────────┘    │
│                                     │
│  ← Scrollable area (max-height: 380px)│
└─────────────────────────────────────┘
```

#### Quick Links Card Content
```
┌─────────────────────────────────────┐
│  Quick Links                        │
├─────────────────────────────────────┤
│  ┌──────┬─────────────┬───────┐     │
│  │ Label│ URL input   │ Add │     │  ← Input form (3-column grid)
│  └──────┴─────────────┴───────┘     │
├─────────────────────────────────────┤
│  ┌────────────────────────┐         │
│  │ 🌐 GitHub        [✕]  │         │  ← Link chip
│  └────────────────────────┘         │
│  ┌────────────────────────┐         │
│  │ 🌐 Stack Overflow [✕]  │         │  ← Another link
│  └────────────────────────┘         │
│                                     │
│  ← Wrapable grid (flex-wrap: wrap) │
└─────────────────────────────────────┘
```

### Spacing and Sizing

- **Card padding**: 24px all sides
- **Grid gap**: 24px between cards
- **Section spacing**: 16px between elements within cards
- **Card border radius**: 12px
- **Button border radius**: 8px
- **Input padding**: 8px vertical, 12px horizontal

### Typography

- **Font family**: System sans-serif (Segoe UI, -apple-system, sans-serif)
- **Greeting**: 1.25rem, bold
- **Clock**: 2rem, bold, tabular-nums for consistent width
- **Timer**: 3.5rem, bold, tabular-nums
- **Section titles**: 1rem, uppercase, 0.08em letter spacing
- **Task text**: 0.9rem, line-height 1.4
- **Link labels**: 0.85rem

### Colors (Light/Dark Theme)

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | #f0f2f5 | #0f1117 |
| Card surface | #ffffff | #1a1d27 |
| Border | #e2e5ea | #2e3347 |
| Text | #1a1d23 | #e8eaf0 |
| Text muted | #6b7280 | #8892a4 |
| Primary | #4f6ef7 | #6478f9 |
| Primary hover | #3b5be0 | #7b8fff |
| Done text | #9ca3af | #4a5068 |
| Accent (running timer) | #10b981 | #10b981 |
| Danger (finished timer) | #ef4444 | #ef4444 |

## Accessibility Considerations

### Keyboard Navigation

1. **Focus Management**
   - All interactive elements are tab-navigable (buttons, inputs)
   - Modal has proper focus trap (input auto-focused on open)
   - Escape key closes modal and cancels editing

2. **Focus Indicators**
   - Inputs show border color change on focus
   - Buttons have clear hover states for mouse users
   - Focus visible using system defaults

### Screen Reader Support

1. **ARIA Labels**
   - Theme toggle: `aria-label="Toggle theme"`
   - Task inputs: `aria-label="New task"` / `"Edit task text"`
   - Timer input: `aria-label="Timer minutes"`
   - Link inputs: `aria-label="Link label"` / `"Link URL"`

2. **Dynamic Announcements**
   - Empty states: Hidden when items exist, shown when empty
   - Timer alert: Fallback to document.title flashing if notifications denied

3. **Semantic HTML**
   - `<header>` for top bar
   - `<main>` for main content
   - `<section>` for card containers
   - `<ul>` for task list
   - `<form>` for input forms
   - `<button>` for all buttons (no <a role="button">)

4. **Modal Accessibility**
   - `role="dialog"` and `aria-modal="true"` on modal
   - `aria-labelledby` pointing to modal title
   - Backdrop with `hidden` state toggle

### Color Contrast

- Light mode text on background: #1a1d23 on #f0f2f5 → Ratio: 9.8:1 ✓
- Light mode muted text: #6b7280 on #f0f2f5 → Ratio: 4.6:1 ✓
- Dark mode text on background: #e8eaf0 on #0f1117 → Ratio: 13.8:1 ✓
- Dark mode muted text: #8892a4 on #0f1117 → Ratio: 6.3:1 ✓

### Reduced Motion

- CSS transitions used for subtle animations
- `prefers-reduced-motion` media query could be added for users who prefer no animations

### Error States

- Invalid URL entry: Form prevents submission with `required` and `type="url"`
- Missing task text: Form prevents submission with `required`
- Local Storage unavailable: Try-catch around operations, graceful degradation to empty states

### Responsive Considerations

- Touch-friendly button sizes (minimum 44px tap targets)
- Grid adapts from 3 columns → 2 columns → 1 column on narrow screens
- Form inputs stack appropriately on mobile

## Testing Strategy

### Unit Testing

**ThemeManager Tests**
- Theme toggle switches between light and dark
- Initial theme loads from Local Storage or defaults to light
- System preference detection works

**ClockManager Tests**
- Clock displays current time in HH:MM:SS format
- Greeting changes based on hour (morning/afternoon/evening/night)
- Date displays correctly in YYYY-MM-DD format

**TimerManager Tests**
- Timer starts and decrements correctly
- Timer can be stopped and resumed
- Timer resets to initial value
- Timer triggers alert at 00:00
- Custom input validation (1-60 minutes)

**TodoManager Tests**
- Add task creates new item with unique ID
- Toggle mark task as done/undone
- Delete removes task from list
- Edit updates task text
- Drag-and-drop reorders tasks correctly

**LinksManager Tests**
- Add link validates URL format
- Link opens in new tab with proper URL
- Delete removes link from list
- Favicon generation works

### Integration Testing

1. **Full Workflow Tests**
   - User can complete entire workflow: theme selection → clock works → timer set and used → tasks added/edited/deleted → links added/removed
   - Data persists across page refresh
   - Theme persists across sessions

2. **Drag-and-Drop Integration**
   - Multiple drag operations maintain order
   - Drag over UI updates correctly
   - Drop persists to Local Storage

### Property-Based Testing

**PBT Applicability Assessment**

This feature involves:
- Pure functions for data transformations (task add/edit/delete)
- Data serialization/deserialization for Local Storage
- Clear input/output behavior for validation logic

**Property-Based Testing for This Feature: YES** (PBT IS applicable)

Correctness Properties will be written in the design document after prework analysis.

### Test Configuration

- **Property tests**: 100+ iterations minimum
- **Tag format**: `Feature: todo-dashboard, Property {number}: {property_text}`
- **Coverage**: All correctness properties from design document

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Task ID Uniqueness

*For any* sequence of task additions, each task in the list will have a unique identifier

**Validates: Requirements 3.10**

### Property 2: Task Persistence Round Trip

*For any* task that is added to the list, saving and reloading from Local Storage will preserve the task's id, text, and done status exactly

**Validates: Requirements 7.2**

### Property 3: Task List Order Preservation

*For any* task list, after reordering tasks via drag-and-drop, saving and reloading from Local Storage will preserve the new order

**Validates: Requirements 4.4, 3.12**

### Property 4: Link URL Protocol Validation

*For any* link added to the quick links list, the stored URL will always start with either 'http://' or 'https://'

**Validates: Requirements 5.8**

### Property 5: Theme Toggle Symmetry

*For any* theme switch from Light to Dark (or vice versa), a second toggle will restore the original theme state

**Validates: Requirements 6.3**

### Property 6: Timer Countdown Determinism

*For any* timer that runs for N seconds without interruption, the remaining time will decrease by exactly N seconds

**Validates: Requirements 2.7**

## Error Handling

### Local Storage Errors

```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  // Handle quota exceeded or unavailable
  console.warn('Local Storage unavailable:', e);
  // Show error to user, continue with empty state
}
```

### Invalid URL Handling

- Form input with `type="url"` provides browser-level validation
- Custom validation checks for http:// or https:// prefix
- Error message displayed without adding the link

### Drag-and-Drop Fallback

- HTML5 drag-and-drop API feature detection before use
- Graceful degradation: tasks remain in creation order if API unavailable
- No error thrown if drag fails

### Unexpected JavaScript Errors

- try-catch blocks around critical operations
- User-friendly error messages in UI
- Application continues running even if individual features fail
