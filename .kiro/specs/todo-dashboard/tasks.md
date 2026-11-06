# Implementation Plan: Todo Dashboard

## Overview

This implementation plan breaks down the todo dashboard into discrete coding steps. The dashboard includes a live clock with greeting, Pomodoro focus timer, to-do list with drag-and-drop sorting, quick links, and light/dark theme switching. All data is persisted using Local Storage. Tasks build incrementally from basic structure to complete integration, with property-based tests for correctness properties defined in the design.

## Tasks

- [x] 1. Set up project structure and initial HTML with semantic elements
  - Ensure HTML structure follows semantic standards with header, main, section elements
  - Add ARIA attributes for accessibility (aria-label, aria-modal, role="dialog")
  - Verify basic layout structure matches design specifications
  - _Requirements: 11.1, 10.1, 3.1_

- [x] 2. Create CSS custom properties for theme system
  - [x] 2.1 Define CSS custom properties (CSS variables) in :root selector
    - Define light theme colors for background, surface, text, primary, accent, danger
    - Define radius, shadow, transition, and font variables
    - _Requirements: 6.1, 6.2, 6.4, 10.2_
  
  - [x] 2.2 Create [data-theme="dark"] selector with dark theme values
    - Define dark theme color palette
    - Ensure contrast ratios meet accessibility requirements (4.5:1 minimum)
    - _Requirements: 6.5, 6.6, 10.6_
  
  - [x] 2.3 Implement CSS reset and base styles
    - Reset box-sizing, margins, and padding
    - Set base font size and system font stack
    - _Requirements: 10.2_

- [x] 3. Implement ThemeManager for light/dark theme switching
  - [x] 3.1 Initialize ThemeManager with data-theme attribute
    - Create ThemeManager module using IIFE pattern
    - Load saved theme from Local Storage (key: 'dashboard_theme')
    - Default to light theme if no saved preference
    - _Requirements: 6.1, 6.2_
  
  - [x] 3.2 Implement theme toggle click handler
    - Read current theme from <html data-theme> attribute
    - Switch between 'light' and 'dark' values
    - Apply new theme using HTML.setAttribute()
    - Save preference to Local Storage
    - _Requirements: 6.3, 6.7, 7.4_
  
  - [ ]* 3.3 Write property test for ThemeManager symmetry
    - **Property 5: Theme Toggle Symmetry**
    - **Validates: Requirements 6.3**
    - Test that two consecutive theme toggles restore original state
    - _Property-Based Test_

- [x] 4. Implement ClockManager for live clock and time-based greeting
  - [x] 4.1 Create clock display with HH:MM:SS format
    - Format time using 24-hour notation with zero-padding
    - Display in clock element (id="clock")
    - _Requirements: 1.1_
  
  - [x] 4.2 Implement time-based greeting logic
    - Morning: 05:00-11:59 → "Good Morning"
    - Afternoon: 12:00-17:59 → "Good Afternoon"
    - Evening: 18:00-21:59 → "Good Evening"
    - Night: 22:00-04:59 → "Good Night"
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  
  - [x] 4.3 Add date display in YYYY-MM-DD format
    - Display day name, month name, date, and year
    - Update independently from clock time
    - _Requirements: 1.2, 1.8_
  
  - [x] 4.4 Implement 1-second interval for real-time updates
    - Use setInterval() to update display every 1000ms
    - Clear interval on page unload to prevent memory leaks
    - _Requirements: 1.8_
  
  - [ ]* 4.5 Write unit tests for ClockManager formatting functions
    - Test pad() function with values 0-59
    - Test greet() function with all time ranges
    - _Requirements: 1.1, 1.4-1.7_

- [x] 5. Implement TimerManager with 60-minute limit
  - [x] 5.1 Update HTML input max attribute to 60
    - Change custom minutes input max="999" to max="60"
    - _Requirements: 2.2 (reference to existing code)_
  
  - [x] 5.2 Implement timer display in MM:SS format
    - Calculate minutes and seconds from remaining seconds
    - Display with zero-padding for both values
    - _Requirements: 2.1_
  
  - [x] 5.3 Implement start button functionality
    - Validate timer not already running and remaining > 0
    - Create setInterval for 1000ms countdown
    - Disable start button while running
    - _Requirements: 2.3, 2.8_
  
  - [x] 5.4 Implement stop button functionality
    - Clear existing interval
    - Set isRunning = false
    - Re-enable start button
    - _Requirements: 2.4, 2.9_
  
  - [x] 5.5 Implement reset button functionality
    - Call stop() to halt timer
    - Reset remaining to totalSeconds
    - Update display
    - _Requirements: 2.5_
  
  - [x] 5.6 Implement timer finish alert
    - Trigger when remaining reaches 0
    - Try Notification API first, fallback to title flashing
    - Flash document.title 10 times at 600ms intervals
    - _Requirements: 2.6_
  
  - [x] 5.7 Implement custom duration input handling
    - Parse input value with parseInt()
    - Validate value is positive number
    - Update totalSeconds and remaining
    - _Requirements: 2.2, 2.9_
  
  - [ ]* 5.8 Write property test for TimerManager countdown
    - **Property 6: Timer Countdown Determinism**
    - **Validates: Requirements 2.7**
    - Test that timer decreases by exactly N seconds after N seconds
    - _Property-Based Test_

- [x] 6. Implement TodoManager with full CRUD operations
  - [x] 6.1 Implement task storage with Local Storage
    - Load tasks from Local Storage (key: 'dashboard_todos') on init
    - Save tasks as JSON string on every change
    - Handle empty Local Storage gracefully
    - _Requirements: 3.1, 3.9, 7.2_
  
  - [x] 6.2 Implement addTodo() for new task creation
    - Create task object with unique id (Date.now()), text, done=false
    - Push to todos array
    - Call save() and render()
    - _Requirements: 3.2, 3.3, 3.10_
  
  - [x] 6.3 Implement toggleTodo() for completion status
    - Find task by id
    - Toggle done property
    - Save and re-render
    - _Requirements: 3.6, 3.7, 3.9_
  
  - [x] 6.4 Implement deleteTodo() for task removal
    - Filter todos array to exclude task with matching id
    - Save and re-render
    - _Requirements: 3.8, 3.9_
  
  - [x] 6.5 Implement saveTodoEdit() for task text updates
    - Find task by id
    - Update text if newText.trim() is non-empty
    - Save and re-render
    - _Requirements: 3.5, 3.9_
  
  - [x] 6.6 Implement render() for UI updates
    - Clear listEl.innerHTML
    - Show/hide emptyEl based on todo count
    - Create li elements with all required elements
    - _Requirements: 3.11, 3.12_
  
  - [x] 6.7 Implement edit modal open/close functions
    - openEditModal(): Set editingId, populate input, show modal
    - closeEditModal(): Clear editingId, hide modal/backdrop
    - Focus editInput and select text on open
    - _Requirements: 3.4_
  
  - [ ]* 6.8 Write property test for TodoManager task ID uniqueness
    - **Property 1: Task ID Uniqueness**
    - **Validates: Requirements 3.10**
    - Test that all tasks in list have unique identifiers after additions
    - _Property-Based Test_
  
  - [ ]* 6.9 Write property test for TodoManager persistence
    - **Property 2: Task Persistence Round Trip**
    - **Validates: Requirements 3.11, 7.2**
    - Test that added task preserves id, text, done status after save/reload
    - _Property-Based Test_

- [x] 7. Implement HTML5 drag-and-drop for task reordering
  - [x] 7.1 Add draggable attribute to task list items
    - Set li.draggable = true in render() loop
    - _Requirements: 4.1_
  
  - [x] 7.2 Implement dragstart event handler
    - Set draggedId from element.dataset.id
    - Add 'dragging' class to element
    - Set dataTransfer.effectAllowed = 'move'
    - _Requirements: 4.1_
  
  - [x] 7.3 Implement dragover event handler with drop position calculation
    - Prevent default to allow drop
    - Calculate drop position using getDragAfterElement()
    - Insert dragged element at correct position
    - _Requirements: 4.2, 4.3_
  
  - [x] 7.4 Implement dragend event handler for order persistence
    - Remove 'dragging' class
    - Read new DOM order into array
    - Sort todos array to match DOM order
    - Call save() to persist new order
    - _Requirements: 4.3, 4.4_
  
  - [x] 7.5 Implement getDragAfterElement() helper function
    - Find all non-dragging elements in container
    - Calculate offset from drop position to element center
    - Return closest element before drop position
    - _Requirements: 4.1_
  
  - [x] 7.6 Add CSS for drag visual feedback
    - Style .dragging class with opacity and dashed border
    - Ensure styles match design specification
    - _Requirements: 4.1_
  
  - [ ]* 7.7 Write property test for drag-and-drop order preservation
    - **Property 3: Task List Order Preservation**
    - **Validates: Requirements 4.3, 4.4**
    - Test that reordered tasks maintain new order after save/reload
    - _Property-Based Test_

- [x] 8. Implement LinksManager with URL validation
  - [x] 8.1 Implement link storage with Local Storage
    - Load links from Local Storage (key: 'dashboard_links') on init
    - Save links as JSON string on every change
    - _Requirements: 5.7, 7.3_
  
  - [x] 8.2 Implement addLink() for new link creation
    - Validate label and URL are non-empty
    - Ensure URL has protocol (prepend 'https://' if missing)
    - Create link object with id, label, url
    - Call save() and render()
    - _Requirements: 5.2, 5.3, 5.4, 5.8_
  
  - [x] 8.3 Implement deleteLink() for link removal
    - Filter links array to exclude link with matching id
    - Call save() and render()
    - _Requirements: 5.6, 5.7_
  
  - [x] 8.4 Implement render() for link grid display
    - Clear grid.innerHTML
    - Show/hide emptyEl based on link count
    - Create link chip elements with favicon, anchor, delete button
    - _Requirements: 5.5_
  
  - [x] 8.5 Implement favicon URL generation
    - Extract origin from URL
    - Construct Google favicon service URL
    - Handle errors gracefully (hide image on error)
    - _Requirements: 5.5_
  
  - [x] 8.6 Add URL validation in addLink()
    - Check URL starts with 'http://' or 'https://' using regex
    - If missing, prepend 'https://'
    - _Requirements: 5.8, 11.1_
  
  - [ ]* 8.7 Write property test for URL protocol validation
    - **Property 4: Link URL Protocol Validation**
    - **Validates: Requirements 5.8**
    - Test that all stored URLs start with http:// or https://
    - _Property-Based Test_

- [x] 9. Set up event handlers and data persistence integration
  - [x] 9.1 Initialize ThemeManager on DOMContentLoaded
    - Call ThemeManager.init()
    - Ensure theme loads immediately on page load
    - _Requirements: 6.1, 7.1_
  
  - [x] 9.2 Initialize ClockManager on DOMContentLoaded
    - Call ClockManager.init()
    - Ensure clock starts immediately
    - _Requirements: 1.8, 7.1_
  
  - [x] 9.3 Initialize TimerManager on DOMContentLoaded
    - Call TimerManager.init()
    - Ensure timer starts at 25:00
    - _Requirements: 2.1, 7.1_
  
  - [x] 9.4 Initialize TodoManager on DOMContentLoaded
    - Call TodoManager.init()
    - Ensure tasks load from Local Storage
    - _Requirements: 3.1, 7.1_
  
  - [x] 9.5 Initialize LinksManager on DOMContentLoaded
    - Call LinksManager.init()
    - Ensure links load from Local Storage
    - _Requirements: 5.1, 7.1_
  
  - [x] 9.6 Add input maxlength attributes
    - Task input: maxlength="120"
    - Link name input: maxlength="30"
    - Edit input: maxlength="120"
    - _Requirements: 3.3, 5.4_
  
  - [x] 9.7 Add required attributes to form inputs
    - todo-input: required
    - link-name: required
    - link-url: required
    - _Requirements: 11.1_

- [x] 10. Testing and bug fixes
  - [x] 10.1 Run full workflow integration tests
    - Test theme toggle persists across reloads
    - Test clock updates in real-time
    - Test timer start/stop/reset flow
    - Test adding/editing/deleting tasks
    - Test drag-and-drop reordering
    - Test adding/removing links
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 10.2 Write unit tests for all managers
    - Test ThemeManager with all theme scenarios
    - Test ClockManager with different hours
    - Test TimerManager with various durations
    - Test TodoManager CRUD operations
    - Test LinksManager validation
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 10.3 Test error handling scenarios
    - Test Local Storage quota exceeded (simulated)
    - Test invalid URL input
    - Test drag-and-drop with disabled API
    - Test empty state displays correctly
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [ ]* 10.4 Test browser compatibility scenarios
    - Test in Chrome 90+ simulation
    - Test in Firefox 88+ simulation
    - Test in Edge 90+ simulation
    - Test in Safari 14+ simulation
    - _Requirements: 8.1-8.4_
  
  - [x] 10.5 Fix any identified bugs
    - Address issues found during testing
    - Verify all requirements are met
    - Ensure no regressions in existing functionality
    - _Requirements: 10.5, 10.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property-based tests validate universal correctness properties defined in the design
- Unit tests validate specific examples and edge cases
- All tasks build incrementally, ensuring each step validates core functionality
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["3.1", "3.2", "4.1", "4.2", "4.3", "4.4"] },
    { "id": 2, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 4, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7"] },
    { "id": 7, "tasks": ["3.3", "4.5", "5.8", "6.8", "6.9", "7.7", "8.7"] },
    { "id": 8, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5"] }
  ]
}
```
