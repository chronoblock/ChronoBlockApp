# Daily Time Planner Web App

A simple, elegant web application for planning and organizing your daily schedule. Structure your day by creating time blocks, adding tasks, and tracking your progress.

## ✨ Features

- **Day Setup**: Define your wake-up and sleep times to establish your available time
- **Time Blocks**: Create focused time periods for different activities (e.g., Morning Routine, Work, Exercise)
- **Task Management**: Add, complete, and delete tasks within each time block
- **Task Notes**: Add detailed notes and comments to individual tasks
- **Settings**: Easily adjust your wake-up and sleep times at any point
- **Time Tracking**: Visual display of total, allocated, and remaining time
- **Data Persistence**: All your data is saved in localStorage and persists across browser sessions

## 🚀 Getting Started

1. **Start Local Server**:
   ```bash
   cd /path/to/time_management_webapp
   python3 -m http.server 8000
   ```

2. **Open in Browser**: Navigate to `http://localhost:8000`

3. **Set Your Day**: Enter your wake-up and sleep times, then click "Set Day"

4. **Create Time Blocks**: Click "+ Add Time Block" to create focused periods

5. **Add Tasks**: Add specific tasks to each time block and track completion

6. **Adjust Settings**: Click the ⚙️ settings icon to modify your schedule anytime

## 🧪 Testing

The app includes a comprehensive testing suite that runs in the browser console:

### How to Run Tests

1. Open your browser with the app running
2. Open Developer Console (F12)
3. Copy and paste the entire `tests.js` file content into the console
4. Run tests with simple commands:

```javascript
// Run all tests
runTests()

// Run specific categories
testTasks()      // Task management tests
testBlocks()     // Time block tests
testSettings()   // Settings functionality
testState()      // Data persistence tests

// Quick core functionality test
quickTest()
```

### Test Coverage

The testing suite includes **37 comprehensive tests** covering:

- ✅ **State Management** (4 tests) - localStorage save/load, data persistence
- ✅ **Time Calculations** (4 tests) - Time math, overnight handling, formatting
- ✅ **Day Setup** (3 tests) - Wake/sleep time setup, day reset
- ✅ **Time Blocks** (4 tests) - Create, delete, time allocation
- ✅ **Task Management** (6 tests) - Add, delete, complete, notes, validation
- ✅ **Settings** (4 tests) - Update times, validation
- ✅ **UI State** (4 tests) - Modal handling, section visibility
- ✅ **Integration** (2 tests) - Complete workflows
- ✅ **Error Handling** (3 tests) - Invalid data, edge cases
- ✅ **DOM Elements** (3 tests) - Required elements exist

### Negative Tests

Each category includes **negative tests** that are designed to fail, ensuring the test framework is working correctly. These tests pass when they fail their assertions (as expected).

**Expected Results**: ~100% success rate with all functional tests passing and negative tests failing as intended.

## 📁 File Structure

```
├── index.html          # Main application file (HTML, CSS, JavaScript)
├── tests.js           # Comprehensive test suite for browser console
├── README.md          # This documentation
└── LICENSE            # Project license
```

## 💾 Data Storage

- Uses browser **localStorage** for data persistence
- Data survives page refreshes and browser restarts
- To reset all data: Open console and run `localStorage.clear()` then refresh

## 🛠️ Technology Stack

- **HTML5** - Structure and semantics
- **Tailwind CSS** - Responsive styling and design
- **Vanilla JavaScript** - Application logic and interactivity
- **localStorage** - Client-side data persistence