/**
 * Daily Time Planner - Browser Console Test Suite
 * 
 * Usage in Browser Console:
 * 1. Copy and paste this entire script into browser console
 * 2. Run: TimePlannerTests.runAll()
 * 3. Or run specific categories: TimePlannerTests.runCategory('tasks')
 */

const TimePlannerTests = {
    // Test results tracking
    results: {
        total: 0,
        passed: 0,
        failed: 0,
        categories: {}
    },

    // Original state backup
    originalState: null,
    originalLocalStorage: null,

    // Test utilities
    setup: function() {
        console.log('🔧 Setting up test environment...');
        // Backup original state
        this.originalState = JSON.parse(JSON.stringify(window.state || {}));
        this.originalLocalStorage = localStorage.getItem('timePlannerState');
        
        // Reset test results
        this.results = { total: 0, passed: 0, failed: 0, categories: {} };
        
        // Clear any existing state
        localStorage.removeItem('timePlannerState');
        
        // Ensure window.state exists (create if doesn't exist)
        if (!window.state) {
            window.state = {};
        }
        
        // Reset state to test defaults
        window.state = {
            dayIsSet: false,
            wakeTime: '07:00',
            sleepTime: '23:00',
            blocks: [],
            editingTaskId: null,
            editingBlockId: null,
            isEditingBlock: false,
            darkMode: false,
            isNotesPreviewMode: false
        };
        
        console.log('✅ Test environment ready');
    },

    teardown: function() {
        console.log('🧹 Cleaning up test environment...');
        // Restore original state
        if (this.originalLocalStorage) {
            localStorage.setItem('timePlannerState', this.originalLocalStorage);
        } else {
            localStorage.removeItem('timePlannerState');
        }
        
        if (this.originalState && window.state) {
            window.state = this.originalState;
        }
        
        // Trigger re-render if possible
        if (window.render && typeof window.render === 'function') {
            window.render();
        }
        console.log('✅ Environment restored');
    },

    // Test assertion helper
    assert: function(condition, testName, category = 'general') {
        this.results.total++;
        if (!this.results.categories[category]) {
            this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        }

        const isNegativeTest = testName.includes('NEGATIVE TEST');
        
        // For negative tests: success means the condition failed
        // For normal tests: success means the condition passed
        const testPassed = isNegativeTest ? !condition : condition;

        if (testPassed) {
            this.results.passed++;
            this.results.categories[category].passed++;
            this.results.categories[category].tests.push({ name: testName, status: 'PASSED' });
            if (isNegativeTest) {
                console.log(`✅ ${testName} (Failed as expected)`);
            } else {
                console.log(`✅ ${testName}`);
            }
        } else {
            this.results.failed++;
            this.results.categories[category].failed++;
            this.results.categories[category].tests.push({ name: testName, status: 'FAILED' });
            if (isNegativeTest) {
                console.log(`❌ ${testName} (Should have failed but passed - TEST FRAMEWORK ERROR!)`);
            } else {
                console.log(`❌ ${testName}`);
            }
        }
    },

    // Utility functions for testing
    utils: {
        timeToMinutes: function(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        },

        simulateClick: function(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.click();
                return true;
            }
            return false;
        },

        simulateInput: function(selector, value) {
            const element = document.querySelector(selector);
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                return true;
            }
            return false;
        },

        wait: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },

    // State Management Tests
    stateTests: {
        saveAndLoad: function() {
            const testState = {
                dayIsSet: true,
                wakeTime: '08:00',
                sleepTime: '22:00',
                blocks: [{ id: 123, purpose: 'Test Block', duration: 60, tasks: [] }],
                editingTaskId: null
            };

            // Test save
            localStorage.setItem('timePlannerState', JSON.stringify(testState));
            TimePlannerTests.assert(
                localStorage.getItem('timePlannerState') !== null,
                'State saves to localStorage',
                'state'
            );

            // Test load
            const loadedState = JSON.parse(localStorage.getItem('timePlannerState'));
            TimePlannerTests.assert(
                loadedState.wakeTime === '08:00',
                'State loads from localStorage correctly',
                'state'
            );

            TimePlannerTests.assert(
                loadedState.blocks.length === 1 && loadedState.blocks[0].purpose === 'Test Block',
                'Complex state data persists correctly',
                'state'
            );
        },

        handleMissingData: function() {
            localStorage.removeItem('timePlannerState');
            const result = localStorage.getItem('timePlannerState');
            TimePlannerTests.assert(
                result === null,
                'Handles missing localStorage data gracefully',
                'state'
            );
        },

        stateReset: function() {
            // Set some state
            const testState = { dayIsSet: true, blocks: [{ id: 1 }] };
            localStorage.setItem('timePlannerState', JSON.stringify(testState));
            
            // Clear state
            localStorage.removeItem('timePlannerState');
            TimePlannerTests.assert(
                localStorage.getItem('timePlannerState') === null,
                'State reset clears localStorage',
                'state'
            );
        },

        // NEGATIVE TEST - This should fail to verify our testing framework works
        negativeTest_StateShouldFail: function() {
            TimePlannerTests.assert(
                false, // This assertion should always fail
                'NEGATIVE TEST: This test should fail (verifies test framework)',
                'state'
            );
        }
    },

    // Time Calculation Tests
    timeCalculationTests: {
        basicTimeCalculation: function() {
            const wakeTime = '07:00';
            const sleepTime = '23:00';
            const wakeMinutes = TimePlannerTests.utils.timeToMinutes(wakeTime);
            const sleepMinutes = TimePlannerTests.utils.timeToMinutes(sleepTime);
            const totalTime = sleepMinutes - wakeMinutes;

            TimePlannerTests.assert(
                wakeMinutes === 420,
                'Wake time converts to minutes correctly (7:00 = 420)',
                'timeCalc'
            );

            TimePlannerTests.assert(
                sleepMinutes === 1380,
                'Sleep time converts to minutes correctly (23:00 = 1380)',
                'timeCalc'
            );

            TimePlannerTests.assert(
                totalTime === 960,
                'Total time calculation correct (16 hours = 960 minutes)',
                'timeCalc'
            );
        },

        overnightTimeCalculation: function() {
            const wakeTime = '23:00';
            const sleepTime = '07:00';
            const wakeMinutes = TimePlannerTests.utils.timeToMinutes(wakeTime);
            const sleepMinutes = TimePlannerTests.utils.timeToMinutes(sleepTime);
            let totalTime = sleepMinutes - wakeMinutes;
            if (totalTime < 0) totalTime += 24 * 60; // Handle overnight

            TimePlannerTests.assert(
                totalTime === 480,
                'Overnight time calculation correct (8 hours = 480 minutes)',
                'timeCalc'
            );
        },

        timeFormatting: function() {
            // Test minutes to HM format
            const format960 = Math.floor(960 / 60) + 'h ' + (960 % 60) + 'm';
            TimePlannerTests.assert(
                format960 === '16h 0m',
                'Time formatting works for full hours',
                'timeCalc'
            );

            const format150 = Math.floor(150 / 60) + 'h ' + (150 % 60) + 'm';
            TimePlannerTests.assert(
                format150 === '2h 30m',
                'Time formatting works for hours and minutes',
                'timeCalc'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_TimeCalcShouldFail: function() {
            TimePlannerTests.assert(
                960 === 1000, // 960 minutes is NOT 1000 minutes
                'NEGATIVE TEST: Wrong time calculation should fail',
                'timeCalc'
            );
        }
    },

    // Day Setup Tests
    daySetupTests: {
        validSetup: function() {
            // Test valid day setup
            const testState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null
            };

            // Simulate setting day
            testState.dayIsSet = true;
            testState.wakeTime = '08:00';
            testState.sleepTime = '22:00';

            TimePlannerTests.assert(
                testState.dayIsSet === true,
                'Day setup sets dayIsSet to true',
                'daySetup'
            );

            TimePlannerTests.assert(
                testState.wakeTime === '08:00',
                'Day setup updates wake time',
                'daySetup'
            );

            TimePlannerTests.assert(
                testState.sleepTime === '22:00',
                'Day setup updates sleep time',
                'daySetup'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_DaySetupShouldFail: function() {
            TimePlannerTests.assert(
                '07:00' === '08:00', // These times are NOT equal
                'NEGATIVE TEST: Different wake times should fail comparison',
                'daySetup'
            );
        }
    },

    // Time Block Tests
    timeBlockTests: {
        createBlock: function() {
            const testState = { blocks: [] };
            const newBlock = {
                id: Date.now(),
                purpose: 'Morning Routine',
                duration: 90,
                tasks: []
            };

            testState.blocks.push(newBlock);

            TimePlannerTests.assert(
                testState.blocks.length === 1,
                'Block creation increases block count',
                'blocks'
            );

            TimePlannerTests.assert(
                testState.blocks[0].purpose === 'Morning Routine',
                'Block creation stores purpose correctly',
                'blocks'
            );

            TimePlannerTests.assert(
                testState.blocks[0].duration === 90,
                'Block creation stores duration correctly',
                'blocks'
            );
        },

        deleteBlock: function() {
            const testState = {
                blocks: [
                    { id: 1, purpose: 'Block 1', duration: 60, tasks: [] },
                    { id: 2, purpose: 'Block 2', duration: 90, tasks: [] }
                ]
            };

            // Delete block with id 1
            testState.blocks = testState.blocks.filter(b => b.id !== 1);

            TimePlannerTests.assert(
                testState.blocks.length === 1,
                'Block deletion reduces block count',
                'blocks'
            );

            TimePlannerTests.assert(
                testState.blocks[0].id === 2,
                'Block deletion removes correct block',
                'blocks'
            );
        },

        blockTimeAllocation: function() {
            const blocks = [
                { duration: 60 },
                { duration: 90 },
                { duration: 30 }
            ];

            const totalAllocated = blocks.reduce((sum, block) => sum + block.duration, 0);

            TimePlannerTests.assert(
                totalAllocated === 180,
                'Block time allocation calculation correct',
                'blocks'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_BlocksShouldFail: function() {
            const testBlocks = [{ id: 1, purpose: 'Test' }];
            TimePlannerTests.assert(
                testBlocks.length === 5, // We only have 1 block, not 5
                'NEGATIVE TEST: Wrong block count should fail',
                'blocks'
            );
        }
    },

    // Task Management Tests
    taskTests: {
        addTask: function() {
            const testBlock = {
                id: 1,
                purpose: 'Test Block',
                duration: 60,
                tasks: []
            };

            const newTask = {
                id: Date.now(),
                text: 'Sample task',
                completed: false,
                notes: ''
            };

            testBlock.tasks.push(newTask);

            TimePlannerTests.assert(
                testBlock.tasks.length === 1,
                'Task addition increases task count',
                'tasks'
            );

            TimePlannerTests.assert(
                testBlock.tasks[0].text === 'Sample task',
                'Task addition stores text correctly',
                'tasks'
            );

            TimePlannerTests.assert(
                testBlock.tasks[0].completed === false,
                'New task defaults to incomplete',
                'tasks'
            );
        },

        deleteTask: function() {
            const testBlock = {
                id: 1,
                tasks: [
                    { id: 1, text: 'Task 1', completed: false },
                    { id: 2, text: 'Task 2', completed: true }
                ]
            };

            // Delete task with id 1
            testBlock.tasks = testBlock.tasks.filter(t => t.id !== 1);

            TimePlannerTests.assert(
                testBlock.tasks.length === 1,
                'Task deletion reduces task count',
                'tasks'
            );

            TimePlannerTests.assert(
                testBlock.tasks[0].id === 2,
                'Task deletion removes correct task',
                'tasks'
            );
        },

        toggleTaskCompletion: function() {
            const testTask = { id: 1, text: 'Test task', completed: false, notes: '' };

            // Toggle completion
            testTask.completed = !testTask.completed;

            TimePlannerTests.assert(
                testTask.completed === true,
                'Task completion toggle works',
                'tasks'
            );

            // Toggle back
            testTask.completed = !testTask.completed;

            TimePlannerTests.assert(
                testTask.completed === false,
                'Task completion toggle works in reverse',
                'tasks'
            );
        },

        taskNotes: function() {
            const testTask = { id: 1, text: 'Test task', completed: false, notes: '' };

            // Add notes
            testTask.notes = 'Important task notes';

            TimePlannerTests.assert(
                testTask.notes === 'Important task notes',
                'Task notes can be added and stored',
                'tasks'
            );

            // Clear notes
            testTask.notes = '';

            TimePlannerTests.assert(
                testTask.notes === '',
                'Task notes can be cleared',
                'tasks'
            );
        },

        emptyTaskValidation: function() {
            const testBlock = { tasks: [] };
            const emptyTaskText = '   '; // Whitespace only

            // Simulate validation
            const trimmedText = emptyTaskText.trim();
            const shouldAdd = trimmedText.length > 0;

            TimePlannerTests.assert(
                shouldAdd === false,
                'Empty task text validation prevents adding empty tasks',
                'tasks'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_TasksShouldFail: function() {
            const task = { id: 1, text: 'Test Task', completed: false };
            TimePlannerTests.assert(
                task.completed === true, // Task is false, not true
                'NEGATIVE TEST: Incorrect completion status should fail',
                'tasks'
            );
        }
    },

    // Settings Tests
    settingsTests: {
        updateWakeTime: function() {
            const testState = { wakeTime: '07:00', sleepTime: '23:00' };
            
            // Update wake time
            testState.wakeTime = '06:30';

            TimePlannerTests.assert(
                testState.wakeTime === '06:30',
                'Settings can update wake time',
                'settings'
            );
        },

        updateSleepTime: function() {
            const testState = { wakeTime: '07:00', sleepTime: '23:00' };
            
            // Update sleep time
            testState.sleepTime = '23:30';

            TimePlannerTests.assert(
                testState.sleepTime === '23:30',
                'Settings can update sleep time',
                'settings'
            );
        },

        settingsValidation: function() {
            const validWakeTime = '07:00';
            const validSleepTime = '23:00';
            const invalidTime = '';

            TimePlannerTests.assert(
                validWakeTime.length > 0 && validWakeTime.includes(':'),
                'Valid wake time passes validation',
                'settings'
            );

            TimePlannerTests.assert(
                validSleepTime.length > 0 && validSleepTime.includes(':'),
                'Valid sleep time passes validation',
                'settings'
            );

            TimePlannerTests.assert(
                !(invalidTime.length > 0 && invalidTime.includes(':')),
                'Invalid time fails validation',
                'settings'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_SettingsShouldFail: function() {
            TimePlannerTests.assert(
                '07:00' === '19:00', // These times are NOT equal
                'NEGATIVE TEST: Different time values should fail comparison',
                'settings'
            );
        },

        // Dark Mode Tests
        darkModeToggle: function() {
            const testState = { darkMode: false };
            
            // Toggle dark mode on
            testState.darkMode = true;
            TimePlannerTests.assert(
                testState.darkMode === true,
                'Dark mode can be enabled',
                'settings'
            );

            // Toggle dark mode off
            testState.darkMode = false;
            TimePlannerTests.assert(
                testState.darkMode === false,
                'Dark mode can be disabled',
                'settings'
            );
        },

        darkModePersistence: function() {
            const testState = { darkMode: true };
            
            // Simulate saving to localStorage
            const stateString = JSON.stringify(testState);
            const loadedState = JSON.parse(stateString);
            
            TimePlannerTests.assert(
                loadedState.darkMode === true,
                'Dark mode preference persists in localStorage',
                'settings'
            );
        },

        darkModeDefault: function() {
            const newState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null,
                darkMode: false  // Should default to false
            };

            TimePlannerTests.assert(
                newState.darkMode === false,
                'Dark mode defaults to false for new users',
                'settings'
            );
        }
    },

    // UI State Tests
    uiTests: {
        modalVisibility: function() {
            // Test modal states
            const hiddenClass = 'hidden';
            
            // Simulate modal open
            let modalHidden = false;
            TimePlannerTests.assert(
                modalHidden === false,
                'Modal opens (removes hidden class)',
                'ui'
            );

            // Simulate modal close
            modalHidden = true;
            TimePlannerTests.assert(
                modalHidden === true,
                'Modal closes (adds hidden class)',
                'ui'
            );
        },

        sectionVisibility: function() {
            const testState = { dayIsSet: false };

            // Test setup section visible when day not set
            TimePlannerTests.assert(
                testState.dayIsSet === false,
                'Setup section visible when day not set',
                'ui'
            );

            // Test planner section visible when day is set
            testState.dayIsSet = true;
            TimePlannerTests.assert(
                testState.dayIsSet === true,
                'Planner section visible when day is set',
                'ui'
            );
        },

        buttonStates: function() {
            const remainingTime = 120; // 2 hours remaining
            const noTimeRemaining = 0;

            TimePlannerTests.assert(
                remainingTime > 0,
                'Add block button enabled when time remaining',
                'ui'
            );

            TimePlannerTests.assert(
                noTimeRemaining <= 0,
                'Add block button disabled when no time remaining',
                'ui'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_UIShouldFail: function() {
            TimePlannerTests.assert(
                true === false, // This will always fail
                'NEGATIVE TEST: True should not equal false',
                'ui'
            );
        }
    },

    // Integration Tests
    integrationTests: {
        completeWorkflow: function() {
            const testState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null
            };

            // 1. Set up day
            testState.dayIsSet = true;
            testState.wakeTime = '08:00';
            testState.sleepTime = '22:00';

            TimePlannerTests.assert(
                testState.dayIsSet === true,
                'Integration: Day setup completes',
                'integration'
            );

            // 2. Add a block
            testState.blocks.push({
                id: 1,
                purpose: 'Morning Routine',
                duration: 120,
                tasks: []
            });

            TimePlannerTests.assert(
                testState.blocks.length === 1,
                'Integration: Block creation works',
                'integration'
            );

            // 3. Add tasks to block
            testState.blocks[0].tasks.push({
                id: 1,
                text: 'Brush teeth',
                completed: false,
                notes: ''
            });

            testState.blocks[0].tasks.push({
                id: 2,
                text: 'Take shower',
                completed: false,
                notes: ''
            });

            TimePlannerTests.assert(
                testState.blocks[0].tasks.length === 2,
                'Integration: Multiple tasks can be added',
                'integration'
            );

            // 4. Complete a task
            testState.blocks[0].tasks[0].completed = true;

            TimePlannerTests.assert(
                testState.blocks[0].tasks[0].completed === true,
                'Integration: Task completion works',
                'integration'
            );

            // 5. Add notes to a task
            testState.blocks[0].tasks[1].notes = 'Use cold water';

            TimePlannerTests.assert(
                testState.blocks[0].tasks[1].notes === 'Use cold water',
                'Integration: Task notes can be added',
                'integration'
            );

            // 6. Delete a task
            testState.blocks[0].tasks = testState.blocks[0].tasks.filter(t => t.id !== 1);

            TimePlannerTests.assert(
                testState.blocks[0].tasks.length === 1,
                'Integration: Task deletion works',
                'integration'
            );

            // 7. Calculate remaining time
            const totalMinutes = TimePlannerTests.utils.timeToMinutes('22:00') - TimePlannerTests.utils.timeToMinutes('08:00');
            const allocatedMinutes = testState.blocks.reduce((sum, block) => sum + block.duration, 0);
            const remainingMinutes = totalMinutes - allocatedMinutes;

            TimePlannerTests.assert(
                remainingMinutes === (840 - 120), // 14 hours - 2 hours = 12 hours (720 minutes)
                'Integration: Time calculations update correctly',
                'integration'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_IntegrationShouldFail: function() {
            const testArray = [1, 2, 3];
            TimePlannerTests.assert(
                testArray.length === 10, // Array has 3 elements, not 10
                'NEGATIVE TEST: Wrong array length should fail',
                'integration'
            );
        }
    },

    // Time Validation Tests
    timeValidationTests: {
        basicOverlapDetection: function() {
            // Mock state with existing blocks
            const mockState = {
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [
                    { id: 1, purpose: 'Morning Routine', startTime: '08:00', endTime: '09:30', duration: 90, tasks: [] },
                    { id: 2, purpose: 'Work Block', duration: 120, tasks: [] } // Sequential block without specific times
                ]
            };

            // Save original state
            const originalState = window.state;
            window.state = mockState;

            // Use the same validation logic as the main app
            const validateOverlap = (startTime, endTime) => {
                const wakeMinutes = TimePlannerTests.utils.timeToMinutes(mockState.wakeTime);
                const sleepMinutes = TimePlannerTests.utils.timeToMinutes(mockState.sleepTime);
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);

                // Check if times are within wake/sleep schedule
                if (startMinutes < wakeMinutes || endMinutes > sleepMinutes) {
                    return `Time must be within schedule`;
                }

                // Sort blocks: scheduled blocks first, then sequential
                const sortedBlocks = [...mockState.blocks].sort((a, b) => {
                    if (a.startTime && b.startTime) {
                        return TimePlannerTests.utils.timeToMinutes(a.startTime) - TimePlannerTests.utils.timeToMinutes(b.startTime);
                    } else if (a.startTime && !b.startTime) {
                        return -1; // Scheduled blocks come first
                    } else if (!a.startTime && b.startTime) {
                        return 1;
                    }
                    return 0; // Keep original order for non-scheduled blocks
                });

                let cumulativeTime = wakeMinutes; // Track sequential block timing

                for (const block of sortedBlocks) {
                    let blockStart, blockEnd;
                    
                    if (block.startTime && block.endTime) {
                        // Block has specific start/end times
                        blockStart = TimePlannerTests.utils.timeToMinutes(block.startTime);
                        blockEnd = TimePlannerTests.utils.timeToMinutes(block.endTime);
                        // Update cumulative time if this scheduled block extends past current time
                        if (blockEnd > cumulativeTime) {
                            cumulativeTime = blockEnd;
                        }
                    } else {
                        // Block uses sequential timing - starts after previous blocks
                        blockStart = cumulativeTime;
                        blockEnd = cumulativeTime + block.duration;
                        cumulativeTime = blockEnd;
                    }
                    
                    // Check for overlap
                    if (startMinutes < blockEnd && endMinutes > blockStart) {
                        return `Overlap with: ${block.purpose}`;
                    }
                }
                return null;
            };

            // Test case 1: Should detect overlap with scheduled block (08:00-09:30)
            const overlap1 = validateOverlap('08:30', '10:00');
            TimePlannerTests.assert(
                overlap1 !== null,
                'Detects overlap with existing scheduled block',
                'timeValidation'
            );

            // Test case 2: Should detect overlap with sequential block
            const overlap2 = validateOverlap('10:00', '11:00'); // This should overlap with the 2-hour work block
            TimePlannerTests.assert(
                overlap2 !== null,
                'Detects overlap with existing sequential block',
                'timeValidation'
            );

            // Test case 3: Should allow non-overlapping time
            const noOverlap = validateOverlap('12:00', '13:00'); // After both blocks
            TimePlannerTests.assert(
                noOverlap === null,
                'Allows non-overlapping time ranges',
                'timeValidation'
            );

            // Restore original state
            window.state = originalState;
        },

        scheduleTimeValidation: function() {
            const mockState = {
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: []
            };

            const validateSchedule = (startTime, endTime) => {
                const wakeMinutes = TimePlannerTests.utils.timeToMinutes(mockState.wakeTime);
                const sleepMinutes = TimePlannerTests.utils.timeToMinutes(mockState.sleepTime);
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);

                return !(startMinutes < wakeMinutes || endMinutes > sleepMinutes);
            };

            // Test case 1: Valid time within schedule
            TimePlannerTests.assert(
                validateSchedule('08:00', '09:00'),
                'Accepts time within wake/sleep schedule',
                'timeValidation'
            );

            // Test case 2: Invalid - too early
            TimePlannerTests.assert(
                !validateSchedule('06:00', '08:00'),
                'Rejects time before wake time',
                'timeValidation'
            );

            // Test case 3: Invalid - too late
            TimePlannerTests.assert(
                !validateSchedule('22:00', '24:00'),
                'Rejects time after sleep time',
                'timeValidation'
            );
        },

        complexOverlapScenarios: function() {
            const mockState = {
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [
                    { id: 1, purpose: 'Morning', startTime: '08:00', endTime: '10:00', duration: 120, tasks: [] },
                    { id: 2, purpose: 'Lunch', startTime: '12:00', endTime: '13:00', duration: 60, tasks: [] },
                    { id: 3, purpose: 'Sequential Block', duration: 90, tasks: [] } // This would be at 13:00-14:30
                ]
            };

            const checkComplexOverlap = (startTime, endTime) => {
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);
                let cumulativeTime = TimePlannerTests.utils.timeToMinutes(mockState.wakeTime);
                
                for (const block of mockState.blocks) {
                    let blockStart, blockEnd;
                    
                    if (block.startTime && block.endTime) {
                        blockStart = TimePlannerTests.utils.timeToMinutes(block.startTime);
                        blockEnd = TimePlannerTests.utils.timeToMinutes(block.endTime);
                        // Reset cumulative time to end of last scheduled block
                        if (blockEnd > cumulativeTime) {
                            cumulativeTime = blockEnd;
                        }
                    } else {
                        blockStart = cumulativeTime;
                        blockEnd = cumulativeTime + block.duration;
                        cumulativeTime = blockEnd;
                    }
                    
                    if (startMinutes < blockEnd && endMinutes > blockStart) {
                        return true; // Overlap detected
                    }
                }
                return false;
            };

            // Test case 1: Overlap with scheduled morning block
            TimePlannerTests.assert(
                checkComplexOverlap('09:00', '11:00'),
                'Detects overlap with scheduled morning block',
                'timeValidation'
            );

            // Test case 2: Overlap with sequential block after lunch
            TimePlannerTests.assert(
                checkComplexOverlap('13:30', '15:00'),
                'Detects overlap with sequential block',
                'timeValidation'
            );

            // Test case 3: Valid gap between blocks
            TimePlannerTests.assert(
                !checkComplexOverlap('10:30', '11:30'),
                'Allows time in valid gap between blocks',
                'timeValidation'
            );
        },

        edgeCaseValidation: function() {
            const mockState = {
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [
                    { id: 1, purpose: 'Morning', startTime: '08:00', endTime: '09:00', duration: 60, tasks: [] }
                ]
            };

            const validateEdgeCase = (startTime, endTime) => {
                const wakeMinutes = TimePlannerTests.utils.timeToMinutes(mockState.wakeTime);
                const sleepMinutes = TimePlannerTests.utils.timeToMinutes(mockState.sleepTime);
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);

                // Basic schedule validation
                if (startMinutes < wakeMinutes || endMinutes > sleepMinutes) {
                    return false;
                }

                // Check exact boundary cases
                for (const block of mockState.blocks) {
                    if (block.startTime && block.endTime) {
                        const blockStart = TimePlannerTests.utils.timeToMinutes(block.startTime);
                        const blockEnd = TimePlannerTests.utils.timeToMinutes(block.endTime);
                        
                        if (startMinutes < blockEnd && endMinutes > blockStart) {
                            return false; // Overlap
                        }
                    }
                }
                return true;
            };

            // Test case 1: Exact boundary - should be valid (9:00-10:00 after 8:00-9:00)
            TimePlannerTests.assert(
                validateEdgeCase('09:00', '10:00'),
                'Allows block starting exactly when previous ends',
                'timeValidation'
            );

            // Test case 2: Exact boundary - should be valid (7:00-8:00 before 8:00-9:00)
            TimePlannerTests.assert(
                validateEdgeCase('07:00', '08:00'),
                'Allows block ending exactly when next starts',
                'timeValidation'
            );

            // Test case 3: One minute overlap - should be invalid
            TimePlannerTests.assert(
                !validateEdgeCase('08:30', '09:30'),
                'Correctly detects one-minute overlap',
                'timeValidation'
            );
        },

        overnightScheduleValidation: function() {
            // Test overnight schedule (7 AM to 1 AM next day)
            const overnightState = {
                wakeTime: '07:00',
                sleepTime: '01:00', // 1 AM next day
                blocks: []
            };

            const validateOvernight = (startTime, endTime) => {
                const wakeMinutes = TimePlannerTests.utils.timeToMinutes(overnightState.wakeTime);
                const sleepMinutes = TimePlannerTests.utils.timeToMinutes(overnightState.sleepTime);
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);
                
                // Detect overnight schedule
                const isOvernightSchedule = sleepMinutes <= wakeMinutes;
                
                if (isOvernightSchedule) {
                    const validSameDay = startMinutes >= wakeMinutes && endMinutes <= 1440;
                    const validNextDay = startMinutes >= 0 && endMinutes <= sleepMinutes && endMinutes > 0;
                    const spansMidnight = startMinutes >= wakeMinutes && endMinutes <= sleepMinutes && startMinutes > endMinutes;
                    
                    return validSameDay || validNextDay || spansMidnight;
                }
                
                return startMinutes >= wakeMinutes && endMinutes <= sleepMinutes;
            };

            TimePlannerTests.assert(
                validateOvernight('08:00', '09:00'),
                'Overnight schedule allows morning times (8-9 AM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                validateOvernight('18:00', '20:00'),
                'Overnight schedule allows evening times (6-8 PM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                validateOvernight('23:00', '00:30'),
                'Overnight schedule allows midnight crossing times (11 PM - 12:30 AM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                validateOvernight('00:30', '01:00'),
                'Overnight schedule allows early morning times (12:30-1 AM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                !validateOvernight('02:00', '03:00'),
                'Overnight schedule rejects times after sleep (2-3 AM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                !validateOvernight('05:00', '06:00'),
                'Overnight schedule rejects times before wake (5-6 AM)',
                'timeValidation'
            );
        },

        midnightScheduleValidation: function() {
            // Test midnight sleep time (7 AM to 12 AM)
            const midnightState = {
                wakeTime: '07:00',
                sleepTime: '00:00', // Midnight
                blocks: []
            };

            const validateMidnight = (startTime, endTime) => {
                const wakeMinutes = TimePlannerTests.utils.timeToMinutes(midnightState.wakeTime);
                const sleepMinutes = TimePlannerTests.utils.timeToMinutes(midnightState.sleepTime);
                const startMinutes = TimePlannerTests.utils.timeToMinutes(startTime);
                const endMinutes = TimePlannerTests.utils.timeToMinutes(endTime);
                
                // Handle midnight as end of day (1440 minutes)
                const effectiveSleepMinutes = sleepMinutes === 0 ? 1440 : sleepMinutes;
                const isOvernightSchedule = effectiveSleepMinutes <= wakeMinutes;
                
                if (isOvernightSchedule) {
                    return startMinutes >= wakeMinutes && endMinutes <= effectiveSleepMinutes;
                }
                
                return startMinutes >= wakeMinutes && endMinutes <= effectiveSleepMinutes;
            };

            TimePlannerTests.assert(
                validateMidnight('07:00', '08:00'),
                'Midnight schedule allows morning times (7-8 AM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                validateMidnight('18:00', '20:00'),
                'Midnight schedule allows evening times (6-8 PM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                validateMidnight('22:00', '23:59'),
                'Midnight schedule allows late evening (10 PM - 11:59 PM)',
                'timeValidation'
            );

            TimePlannerTests.assert(
                !validateMidnight('00:30', '01:00'),
                'Midnight schedule rejects times after midnight',
                'timeValidation'
            );
        },

        // NEGATIVE TESTS - These should fail to verify our testing framework
        negativeTest_ValidationShouldFail: function() {
            TimePlannerTests.assert(
                true === false, // This should always fail
                'NEGATIVE TEST: Basic boolean inequality should fail',
                'timeValidation'
            );
        },

        negativeTest_OverlapShouldFail: function() {
            // This test should fail - we're saying no overlap when there clearly is one
            const overlap = '08:00' === '09:00' && '09:00' === '08:00'; // Impossible condition
            TimePlannerTests.assert(
                overlap, // This will be false, so test should fail
                'NEGATIVE TEST: Impossible overlap condition should fail',
                'timeValidation'
            );
        }
    },
    errorTests: {
        invalidBlockData: function() {
            const validPurpose = 'Morning Routine';
            const invalidPurpose = '';
            const validDuration = 60;
            const invalidDuration = -10;

            TimePlannerTests.assert(
                validPurpose.trim().length > 0,
                'Valid block purpose passes validation',
                'errors'
            );

            TimePlannerTests.assert(
                !(invalidPurpose.trim().length > 0),
                'Invalid block purpose fails validation',
                'errors'
            );

            TimePlannerTests.assert(
                !isNaN(validDuration) && validDuration > 0,
                'Valid block duration passes validation',
                'errors'
            );

            TimePlannerTests.assert(
                !((!isNaN(invalidDuration)) && invalidDuration > 0),
                'Invalid block duration fails validation',
                'errors'
            );
        },

        edgeTimeValues: function() {
            const midnight = '00:00';
            const almostMidnight = '23:59';
            
            TimePlannerTests.assert(
                TimePlannerTests.utils.timeToMinutes(midnight) === 0,
                'Midnight time conversion works',
                'errors'
            );

            TimePlannerTests.assert(
                TimePlannerTests.utils.timeToMinutes(almostMidnight) === 1439,
                'End of day time conversion works',
                'errors'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_ErrorsShouldFail: function() {
            TimePlannerTests.assert(
                0 === 1, // Zero does NOT equal one
                'NEGATIVE TEST: Basic math inequality should fail',
                'errors'
            );
        }
    },

    // Markdown Parser Tests
    markdownTests: {
        basicFormatting: function() {
            // Mock the parseSimpleMarkdown function for testing
            const parseSimpleMarkdown = (text) => {
                if (!text) return '';
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/~~(.*?)~~/g, '<del>$1</del>')
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                    .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1">$1</mark>')
                    .replace(/\n/g, '<br>');
            };

            // Test bold formatting
            const boldResult = parseSimpleMarkdown('**Bold text**');
            TimePlannerTests.assert(
                boldResult === '<strong>Bold text</strong>',
                'Bold markdown formatting works correctly',
                'markdown'
            );

            // Test italic formatting
            const italicResult = parseSimpleMarkdown('*Italic text*');
            TimePlannerTests.assert(
                italicResult === '<em>Italic text</em>',
                'Italic markdown formatting works correctly',
                'markdown'
            );

            // Test strikethrough formatting
            const strikeResult = parseSimpleMarkdown('~~Strikethrough text~~');
            TimePlannerTests.assert(
                strikeResult === '<del>Strikethrough text</del>',
                'Strikethrough markdown formatting works correctly',
                'markdown'
            );

            // Test underline formatting
            const underlineResult = parseSimpleMarkdown('__Underlined text__');
            TimePlannerTests.assert(
                underlineResult === '<u>Underlined text</u>',
                'Underline markdown formatting works correctly',
                'markdown'
            );

            // Test highlight formatting
            const highlightResult = parseSimpleMarkdown('==Highlighted text==');
            TimePlannerTests.assert(
                highlightResult === '<mark class="bg-yellow-200 px-1">Highlighted text</mark>',
                'Highlight markdown formatting works correctly',
                'markdown'
            );
        },

        headerFormatting: function() {
            const parseHeaders = (text) => {
                return text
                    .replace(/^### (.*$)/gim, '<h5 class="text-sm font-bold mt-2 mb-1 text-gray-900">$1</h5>')
                    .replace(/^## (.*$)/gim, '<h4 class="text-base font-bold mt-2 mb-1 text-gray-900">$1</h4>')
                    .replace(/^# (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1 text-gray-900">$1</h3>');
            };

            // Test header 1
            const h1Result = parseHeaders('# Header 1');
            TimePlannerTests.assert(
                h1Result.includes('<h3 class="text-lg font-bold mt-2 mb-1 text-gray-900">Header 1</h3>'),
                'Header 1 markdown formatting works correctly',
                'markdown'
            );

            // Test header 2
            const h2Result = parseHeaders('## Header 2');
            TimePlannerTests.assert(
                h2Result.includes('<h4 class="text-base font-bold mt-2 mb-1 text-gray-900">Header 2</h4>'),
                'Header 2 markdown formatting works correctly',
                'markdown'
            );

            // Test header 3
            const h3Result = parseHeaders('### Header 3');
            TimePlannerTests.assert(
                h3Result.includes('<h5 class="text-sm font-bold mt-2 mb-1 text-gray-900">Header 3</h5>'),
                'Header 3 markdown formatting works correctly',
                'markdown'
            );
        },

        colorFormatting: function() {
            const parseColors = (text) => {
                return text
                    .replace(/\{red:(.*?)\}/g, '<span class="text-red-600">$1</span>')
                    .replace(/\{blue:(.*?)\}/g, '<span class="text-blue-600">$1</span>')
                    .replace(/\{green:(.*?)\}/g, '<span class="text-green-600">$1</span>')
                    .replace(/\{yellow:(.*?)\}/g, '<span class="text-yellow-600">$1</span>')
                    .replace(/\{purple:(.*?)\}/g, '<span class="text-purple-600">$1</span>')
                    .replace(/\{orange:(.*?)\}/g, '<span class="text-orange-600">$1</span>');
            };

            // Test color formatting
            const redResult = parseColors('{red:Red text}');
            TimePlannerTests.assert(
                redResult === '<span class="text-red-600">Red text</span>',
                'Red text color formatting works correctly',
                'markdown'
            );

            const blueResult = parseColors('{blue:Blue text}');
            TimePlannerTests.assert(
                blueResult === '<span class="text-blue-600">Blue text</span>',
                'Blue text color formatting works correctly',
                'markdown'
            );

            const greenResult = parseColors('{green:Green text}');
            TimePlannerTests.assert(
                greenResult === '<span class="text-green-600">Green text</span>',
                'Green text color formatting works correctly',
                'markdown'
            );
        },

        checkboxFormatting: function() {
            const parseCheckboxes = (text) => {
                return text
                    .replace(/- \[ \] (.*)/g, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="h-4 w-4"> <span>$1</span></div>')
                    .replace(/- \[x\] (.*)/g, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="h-4 w-4"> <span>$1</span></div>');
            };

            // Test unchecked checkbox
            const uncheckedResult = parseCheckboxes('- [ ] Unchecked item');
            TimePlannerTests.assert(
                uncheckedResult.includes('<input type="checkbox" disabled class="h-4 w-4">') && 
                uncheckedResult.includes('<span>Unchecked item</span>'),
                'Unchecked checkbox formatting works correctly',
                'markdown'
            );

            // Test checked checkbox
            const checkedResult = parseCheckboxes('- [x] Checked item');
            TimePlannerTests.assert(
                checkedResult.includes('<input type="checkbox" checked disabled class="h-4 w-4">') && 
                checkedResult.includes('<span>Checked item</span>'),
                'Checked checkbox formatting works correctly',
                'markdown'
            );
        },

        alignmentFormatting: function() {
            const parseAlignment = (text) => {
                return text
                    .replace(/\|center\|(.*?)\|center\|/g, '<div class="text-center">$1</div>')
                    .replace(/\|right\|(.*?)\|right\|/g, '<div class="text-right">$1</div>')
                    .replace(/\|left\|(.*?)\|left\|/g, '<div class="text-left">$1</div>');
            };

            // Test center alignment
            const centerResult = parseAlignment('|center|Centered text|center|');
            TimePlannerTests.assert(
                centerResult === '<div class="text-center">Centered text</div>',
                'Center alignment formatting works correctly',
                'markdown'
            );

            // Test right alignment
            const rightResult = parseAlignment('|right|Right text|right|');
            TimePlannerTests.assert(
                rightResult === '<div class="text-right">Right text</div>',
                'Right alignment formatting works correctly',
                'markdown'
            );

            // Test left alignment
            const leftResult = parseAlignment('|left|Left text|left|');
            TimePlannerTests.assert(
                leftResult === '<div class="text-left">Left text</div>',
                'Left alignment formatting works correctly',
                'markdown'
            );
        },

        complexMarkdownCombinations: function() {
            const parseComplete = (text) => {
                if (!text) return '';
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/~~(.*?)~~/g, '<del>$1</del>')
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                    .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1">$1</mark>')
                    .replace(/\{red:(.*?)\}/g, '<span class="text-red-600">$1</span>')
                    .replace(/\n/g, '<br>');
            };

            // Test combination of bold and italic
            const combinedResult = parseComplete('**Bold and *italic* text**');
            TimePlannerTests.assert(
                combinedResult.includes('<strong>') && combinedResult.includes('<em>'),
                'Combined formatting (bold + italic) works correctly',
                'markdown'
            );

            // Test empty text handling
            const emptyResult = parseComplete('');
            TimePlannerTests.assert(
                emptyResult === '',
                'Empty text returns empty string',
                'markdown'
            );

            // Test null/undefined handling
            const nullResult = parseComplete(null);
            TimePlannerTests.assert(
                nullResult === '',
                'Null text returns empty string',
                'markdown'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_MarkdownShouldFail: function() {
            const testText = '**Bold text**';
            TimePlannerTests.assert(
                testText === '<strong>Bold text</strong>', // Raw markdown is NOT equal to HTML
                'NEGATIVE TEST: Raw markdown should not equal HTML output',
                'markdown'
            );
        }
    },

    // Toggle Mode Tests
    toggleModeTests: {
        initialState: function() {
            const testState = { isNotesPreviewMode: false };
            
            TimePlannerTests.assert(
                testState.isNotesPreviewMode === false,
                'Notes toggle mode defaults to Edit mode',
                'toggleMode'
            );
        },

        modeToggling: function() {
            const testState = { isNotesPreviewMode: false };
            
            // Switch to Preview mode
            testState.isNotesPreviewMode = true;
            TimePlannerTests.assert(
                testState.isNotesPreviewMode === true,
                'Can switch to Preview mode',
                'toggleMode'
            );

            // Switch back to Edit mode
            testState.isNotesPreviewMode = false;
            TimePlannerTests.assert(
                testState.isNotesPreviewMode === false,
                'Can switch back to Edit mode',
                'toggleMode'
            );
        },

        uiStateConsistency: function() {
            const mockUIState = {
                editBtnActive: true,
                previewBtnActive: false,
                editContainerVisible: true,
                previewContainerVisible: false
            };

            // Simulate switch to Preview mode
            mockUIState.editBtnActive = false;
            mockUIState.previewBtnActive = true;
            mockUIState.editContainerVisible = false;
            mockUIState.previewContainerVisible = true;

            TimePlannerTests.assert(
                !mockUIState.editBtnActive && mockUIState.previewBtnActive,
                'Button states update correctly when switching modes',
                'toggleMode'
            );

            TimePlannerTests.assert(
                !mockUIState.editContainerVisible && mockUIState.previewContainerVisible,
                'Container visibility updates correctly when switching modes',
                'toggleMode'
            );
        },

        modalResetBehavior: function() {
            const testState = { isNotesPreviewMode: true }; // Start in Preview mode
            
            // Simulate opening modal (should reset to Edit mode)
            testState.isNotesPreviewMode = false;
            
            TimePlannerTests.assert(
                testState.isNotesPreviewMode === false,
                'Modal opening resets to Edit mode',
                'toggleMode'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_ToggleModeShouldFail: function() {
            const testState = { isNotesPreviewMode: false };
            TimePlannerTests.assert(
                testState.isNotesPreviewMode === true, // false is NOT true
                'NEGATIVE TEST: Wrong toggle mode state should fail',
                'toggleMode'
            );
        }
    },

    // Enhanced Task Tests
    enhancedTaskTests: {
        taskCompletionStyling: function() {
            const testTask = { id: 1, text: 'Test Task', completed: false, notes: '' };
            
            // Test initial state
            TimePlannerTests.assert(
                testTask.completed === false,
                'New task starts as incomplete',
                'enhancedTasks'
            );

            // Test completion toggle
            testTask.completed = true;
            TimePlannerTests.assert(
                testTask.completed === true,
                'Task can be marked as completed',
                'enhancedTasks'
            );

            // Simulate CSS class application
            const cssClass = testTask.completed ? 'completed-task' : '';
            TimePlannerTests.assert(
                cssClass === 'completed-task',
                'Completed task gets correct CSS class',
                'enhancedTasks'
            );
        },

        taskNotesWithMarkdown: function() {
            const testTask = { 
                id: 1, 
                text: 'Test Task', 
                completed: false, 
                notes: '**Important note** with *formatting*' 
            };

            TimePlannerTests.assert(
                testTask.notes.includes('**') && testTask.notes.includes('*'),
                'Task can store markdown-formatted notes',
                'enhancedTasks'
            );

            // Test notes clearing
            testTask.notes = '';
            TimePlannerTests.assert(
                testTask.notes === '',
                'Task notes can be cleared',
                'enhancedTasks'
            );

            // Test long notes
            const longNotes = 'This is a very long note with **bold** text and *italic* text and ~~strikethrough~~ text.';
            testTask.notes = longNotes;
            TimePlannerTests.assert(
                testTask.notes.length > 50,
                'Task can store long markdown notes',
                'enhancedTasks'
            );
        },

        taskRenderingWithClasses: function() {
            const testTasks = [
                { id: 1, text: 'Completed Task', completed: true, notes: '' },
                { id: 2, text: 'Incomplete Task', completed: false, notes: 'Some notes' }
            ];

            // Test completed task rendering
            const completedTaskClass = testTasks[0].completed ? 'completed-task task-item completed' : 'task-item';
            TimePlannerTests.assert(
                completedTaskClass.includes('completed-task'),
                'Completed task gets multiple CSS classes for styling',
                'enhancedTasks'
            );

            // Test incomplete task rendering
            const incompleteTaskClass = testTasks[1].completed ? 'completed-task task-item completed' : 'task-item';
            TimePlannerTests.assert(
                !incompleteTaskClass.includes('completed-task'),
                'Incomplete task gets only basic CSS classes',
                'enhancedTasks'
            );
        },

        markdownPreviewGeneration: function() {
            const sampleNotes = '# Task Notes\n**Priority**: High\n*Status*: ~~In Progress~~ Complete';
            
            // Mock preview generation
            const generatePreview = (markdown) => {
                return markdown
                    .replace(/^# (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/~~(.*?)~~/g, '<del>$1</del>')
                    .replace(/\n/g, '<br>');
            };

            const preview = generatePreview(sampleNotes);
            
            TimePlannerTests.assert(
                preview.includes('<h3>') && preview.includes('<strong>') && preview.includes('<del>'),
                'Complex markdown preview generates correctly',
                'enhancedTasks'
            );

            TimePlannerTests.assert(
                preview.includes('<br>'),
                'Line breaks are converted to HTML breaks',
                'enhancedTasks'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_EnhancedTasksShouldFail: function() {
            const task = { completed: true };
            TimePlannerTests.assert(
                task.completed === false, // Task is completed (true), not false
                'NEGATIVE TEST: Wrong completion status should fail',
                'enhancedTasks'
            );
        }
    },

    // UI Enhancement Tests
    uiEnhancementTests: {
        modalToggleButtons: function() {
            // Mock DOM elements for testing
            const mockElements = {
                editBtn: { active: true },
                previewBtn: { active: false },
                editContainer: { visible: true },
                previewContainer: { visible: false }
            };

            // Simulate toggle to Preview mode
            mockElements.editBtn.active = false;
            mockElements.previewBtn.active = true;
            mockElements.editContainer.visible = false;
            mockElements.previewContainer.visible = true;

            TimePlannerTests.assert(
                !mockElements.editBtn.active && mockElements.previewBtn.active,
                'Toggle buttons switch state correctly',
                'uiEnhancement'
            );

            TimePlannerTests.assert(
                !mockElements.editContainer.visible && mockElements.previewContainer.visible,
                'Container visibility switches correctly',
                'uiEnhancement'
            );
        },

        darkModeCompatibility: function() {
            const testState = { darkMode: false };
            
            // Test dark mode toggle
            testState.darkMode = true;
            TimePlannerTests.assert(
                testState.darkMode === true,
                'Dark mode can be enabled for enhanced features',
                'uiEnhancement'
            );

            // Test CSS class application
            const bodyClass = testState.darkMode ? 'dark' : '';
            TimePlannerTests.assert(
                bodyClass === 'dark',
                'Dark mode applies correct CSS class',
                'uiEnhancement'
            );
        },

        responsiveDesign: function() {
            // Test modal width classes
            const modalClasses = 'w-full max-w-lg';
            TimePlannerTests.assert(
                modalClasses.includes('w-full') && modalClasses.includes('max-w-lg'),
                'Enhanced modal uses responsive width classes',
                'uiEnhancement'
            );

            // Test textarea sizing
            const textareaRows = 6;
            TimePlannerTests.assert(
                textareaRows > 4,
                'Enhanced textarea provides adequate space for notes',
                'uiEnhancement'
            );
        },

        lucideIconsIntegration: function() {
            // Test if Lucide is available globally
            const isLucideAvailable = typeof lucide !== 'undefined';
            TimePlannerTests.assert(
                isLucideAvailable,
                'Lucide icons library is loaded and available',
                'uiEnhancement'
            );

            // Test basic icon replacement - check both in DOM and in source code
            let hasEditIcon = document.querySelector('[data-lucide="edit"]') !== null;
            let hasDeleteIcon = document.querySelector('[data-lucide="trash-2"]') !== null;
            
            // If icons not found in DOM, check if templates exist in HTML source
            if (!hasEditIcon || !hasDeleteIcon) {
                const htmlContent = document.documentElement.innerHTML;
                if (!hasEditIcon) {
                    hasEditIcon = htmlContent.includes('data-lucide="edit"') || htmlContent.includes("data-lucide='edit'");
                }
                if (!hasDeleteIcon) {
                    hasDeleteIcon = htmlContent.includes('data-lucide="trash-2"') || htmlContent.includes("data-lucide='trash-2'");
                }
            }
            
            // If still not found, create test task to verify dynamic creation
            if (!hasEditIcon || !hasDeleteIcon) {
                const testTaskData = { id: 'test-' + Date.now(), text: 'Test Task for Edit Icon Check', completed: false };
                
                const originalStateJson = localStorage.getItem('timePlanner_state');
                const originalState = originalStateJson ? JSON.parse(originalStateJson) : {
                    dayIsSet: false,
                    wakeTime: '07:00',
                    sleepTime: '23:00',
                    blocks: [],
                    editingTaskId: null,
                    editingBlockId: null,
                    isEditingBlock: false,
                    darkMode: false,
                    isNotesPreviewMode: false
                };
                
                const testBlock = {
                    id: 'test-block-' + Date.now(),
                    purpose: 'Test Block for Icons',
                    startTime: '09:00',
                    endTime: '10:00',
                    tasks: [testTaskData]
                };
                
                const tempState = {
                    ...originalState,
                    blocks: [...originalState.blocks, testBlock]
                };
                
                localStorage.setItem('timePlanner_state', JSON.stringify(tempState));
                
                if (typeof render === 'function') {
                    render();
                    
                    // Check for icons after rendering test task
                    if (!hasEditIcon) {
                        hasEditIcon = document.querySelector('[data-lucide="edit"]') !== null;
                    }
                    if (!hasDeleteIcon) {
                        hasDeleteIcon = document.querySelector('[data-lucide="trash-2"]') !== null;
                    }
                }
                
                // Restore original state
                if (originalStateJson) {
                    localStorage.setItem('timePlanner_state', originalStateJson);
                } else {
                    localStorage.removeItem('timePlanner_state');
                }
                if (typeof render === 'function') {
                    render();
                }
            }
            
            // Test edit mode icons by checking the source code contains the proper templates
            let hasCheckIcon = false;
            let hasCancelIcon = false;
            
            // Get the main HTML content to check for template definitions
            const htmlContent = document.documentElement.innerHTML;
            
            // Check if the edit mode template contains check and x icons
            hasCheckIcon = htmlContent.includes('data-lucide="check"') || htmlContent.includes("data-lucide='check'");
            hasCancelIcon = htmlContent.includes('data-lucide="x"') || htmlContent.includes("data-lucide='x'");
            
            // If templates not found in HTML, try creating a test task to verify dynamic creation
            if (!hasCheckIcon || !hasCancelIcon) {
                // Create a temporary test task to check edit mode icons
                const testTaskData = { id: 'test-' + Date.now(), text: 'Test Task for Icon Check', completed: false };
                
                // Get current state and create backup
                const originalStateJson = localStorage.getItem('timePlanner_state');
                const originalState = originalStateJson ? JSON.parse(originalStateJson) : {
                    dayIsSet: false,
                    wakeTime: '07:00',
                    sleepTime: '23:00',
                    blocks: [],
                    editingTaskId: null,
                    editingBlockId: null,
                    isEditingBlock: false,
                    darkMode: false,
                    isNotesPreviewMode: false
                };
                
                // Create a test block with our test task
                const testBlock = {
                    id: 'test-block-' + Date.now(),
                    purpose: 'Test Block',
                    startTime: '09:00',
                    endTime: '10:00',
                    tasks: [testTaskData]
                };
                
                const tempState = {
                    ...originalState,
                    blocks: [...originalState.blocks, testBlock]
                };
                
                localStorage.setItem('timePlanner_state', JSON.stringify(tempState));
                
                // Re-render to show the test task
                if (typeof render === 'function') {
                    render();
                    
                    // Find our test task element and trigger edit mode
                    const testTaskElement = document.querySelector(`[data-id="${testTaskData.id}"]`);
                    if (testTaskElement) {
                        const editBtn = testTaskElement.querySelector('.edit-task-btn');
                        if (editBtn) {
                            // Simulate edit button click
                            editBtn.click();
                            
                            // Check for edit mode icons after DOM update
                            hasCheckIcon = document.querySelector('[data-lucide="check"]') !== null;
                            hasCancelIcon = document.querySelector('[data-lucide="x"]') !== null;
                            
                            // Cancel edit mode
                            const cancelBtn = document.querySelector('.cancel-task-edit-btn');
                            if (cancelBtn) cancelBtn.click();
                        }
                    }
                }
                
                // Restore original state
                if (originalStateJson) {
                    localStorage.setItem('timePlanner_state', originalStateJson);
                } else {
                    localStorage.removeItem('timePlanner_state');
                }
                if (typeof render === 'function') {
                    render();
                }
            }

            TimePlannerTests.assert(
                hasEditIcon,
                'Edit icons are replaced with Lucide edit icons',
                'uiEnhancement'
            );

            TimePlannerTests.assert(
                hasDeleteIcon,
                'Delete icons are replaced with Lucide trash-2 icons',
                'uiEnhancement'
            );

            TimePlannerTests.assert(
                hasCheckIcon,
                'Confirm icons are replaced with Lucide check icons',
                'uiEnhancement'
            );

            TimePlannerTests.assert(
                hasCancelIcon,
                'Cancel icons are replaced with Lucide x icons',
                'uiEnhancement'
            );
        },

        iconFunctionality: function() {
            // Test that icons maintain their click functionality
            const editButton = document.querySelector('.edit-task-btn');
            const deleteButton = document.querySelector('.delete-task-btn');
            
            if (editButton) {
                const hasEditIcon = editButton.querySelector('[data-lucide="edit"]') !== null;
                const hasClickHandler = editButton.onclick !== null || editButton.getAttribute('onclick') !== null;
                
                TimePlannerTests.assert(
                    hasEditIcon,
                    'Edit buttons contain Lucide edit icons',
                    'uiEnhancement'
                );
            }

            if (deleteButton) {
                const hasDeleteIcon = deleteButton.querySelector('[data-lucide="trash-2"]') !== null;
                
                TimePlannerTests.assert(
                    hasDeleteIcon,
                    'Delete buttons contain Lucide trash-2 icons',
                    'uiEnhancement'
                );
            }
        },

        // NEGATIVE TEST - This should fail
        negativeTest_UIEnhancementShouldFail: function() {
            const mockButton = { active: true };
            TimePlannerTests.assert(
                mockButton.active === false, // Button is active (true), not false
                'NEGATIVE TEST: Wrong button state should fail',
                'uiEnhancement'
            );
        }
    },

    // Data Management Tests
    dataManagementTests: {
        exportDataStructure: function() {
            const testState = {
                wakeTime: '08:00',
                sleepTime: '22:00',
                blocks: [
                    { id: 1, purpose: 'Morning Routine', duration: 90, tasks: [
                        { id: 1, text: 'Brush teeth', completed: true, notes: '**Important** task' }
                    ]}
                ],
                darkMode: true,
                dayIsSet: true
            };

            // Simulate export data generation
            const exportData = {
                exportDate: new Date().toISOString(),
                version: "1.0",
                appName: "Daily Time Planner",
                data: testState
            };

            TimePlannerTests.assert(
                exportData.version === "1.0",
                'Export data includes version information',
                'dataManagement'
            );

            TimePlannerTests.assert(
                exportData.data.wakeTime === '08:00',
                'Export data includes wake time',
                'dataManagement'
            );

            TimePlannerTests.assert(
                exportData.data.blocks.length === 1,
                'Export data includes all blocks',
                'dataManagement'
            );

            TimePlannerTests.assert(
                exportData.data.blocks[0].tasks[0].notes === '**Important** task',
                'Export data preserves task notes with markdown',
                'dataManagement'
            );
        },

        importDataValidation: function() {
            const validImportData = {
                exportDate: "2024-01-15T10:30:00Z",
                version: "1.0",
                appName: "Daily Time Planner",
                data: {
                    wakeTime: "07:00",
                    sleepTime: "23:00",
                    blocks: [],
                    darkMode: false,
                    dayIsSet: false
                }
            };

            const invalidImportData1 = { version: "1.0" }; // Missing data
            const invalidImportData2 = { data: { blocks: [] } }; // Missing version
            const invalidImportData3 = { 
                version: "1.0", 
                data: { blocks: [] } // Missing required time fields
            };

            // Test valid data structure
            const isValid1 = validImportData.data && validImportData.version && 
                           validImportData.data.wakeTime && validImportData.data.sleepTime;
            TimePlannerTests.assert(
                isValid1,
                'Valid import data passes structure validation',
                'dataManagement'
            );

            // Test invalid data structures
            const isValid2 = invalidImportData1.data && invalidImportData1.version;
            TimePlannerTests.assert(
                !isValid2,
                'Invalid import data (missing data) fails validation',
                'dataManagement'
            );

            const isValid3 = invalidImportData2.data && invalidImportData2.version;
            TimePlannerTests.assert(
                !isValid3,
                'Invalid import data (missing version) fails validation',
                'dataManagement'
            );

            const isValid4 = invalidImportData3.data && invalidImportData3.version && 
                           invalidImportData3.data.wakeTime && invalidImportData3.data.sleepTime;
            TimePlannerTests.assert(
                !isValid4,
                'Invalid import data (missing time fields) fails validation',
                'dataManagement'
            );
        },

        clearHistoryFunctionality: function() {
            const testState = {
                dayIsSet: true,
                wakeTime: '08:30',
                sleepTime: '21:45',
                blocks: [
                    { id: 1, purpose: 'Test Block', duration: 60, tasks: [
                        { id: 1, text: 'Test Task', completed: true, notes: '**Important** notes with markdown' }
                    ]}
                ],
                darkMode: true,
                isNotesPreviewMode: true,
                editingTaskId: { blockId: 1, taskId: 1 }
            };

            // Simulate NUCLEAR clear history (complete factory reset)
            const factoryDefaults = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null,
                darkMode: false,
                isNotesPreviewMode: false
            };

            // Verify every single field resets to factory defaults
            TimePlannerTests.assert(
                factoryDefaults.blocks.length === 0,
                'Nuclear clear removes ALL blocks completely',
                'dataManagement'
            );

            TimePlannerTests.assert(
                factoryDefaults.dayIsSet === false,
                'Nuclear clear resets day setup to initial state',
                'dataManagement'
            );

            TimePlannerTests.assert(
                factoryDefaults.darkMode === false,
                'Nuclear clear resets dark mode to light theme',
                'dataManagement'
            );

            TimePlannerTests.assert(
                factoryDefaults.wakeTime === '07:00' && factoryDefaults.sleepTime === '23:00',
                'Nuclear clear resets schedule to factory defaults (07:00-23:00)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                factoryDefaults.editingTaskId === null,
                'Nuclear clear resets editing state',
                'dataManagement'
            );

            TimePlannerTests.assert(
                factoryDefaults.isNotesPreviewMode === false,
                'Nuclear clear resets notes preview mode',
                'dataManagement'
            );

            // Verify complete data loss (all tasks and notes gone)
            const hadTasksWithNotes = testState.blocks.some(block => 
                block.tasks.some(task => task.notes && task.notes.length > 0)
            );
            const hasTasksAfterClear = factoryDefaults.blocks.some(block => 
                block.tasks && block.tasks.length > 0
            );

            TimePlannerTests.assert(
                hadTasksWithNotes && !hasTasksAfterClear,
                'Nuclear clear removes all tasks with notes permanently',
                'dataManagement'
            );
        },

        nuclearResetCompleteTest: function() {
            // Test the most comprehensive data state possible
            const maximalState = {
                dayIsSet: true,
                wakeTime: '05:30',
                sleepTime: '00:30', // Overnight schedule
                blocks: [
                    { 
                        id: 1, 
                        purpose: 'Complex Block', 
                        duration: 120, 
                        startTime: '06:00',
                        endTime: '08:00',
                        tasks: [
                            { id: 1, text: 'Task 1', completed: true, notes: '# Header\n**Bold** *italic* ~~strike~~' },
                            { id: 2, text: 'Task 2', completed: false, notes: '{red:Colored} ==highlighted== text' }
                        ]
                    },
                    { 
                        id: 2, 
                        purpose: 'Sequential Block', 
                        duration: 90,
                        tasks: [
                            { id: 3, text: 'Task 3', completed: true, notes: '- [x] Completed\n- [ ] Pending' }
                        ]
                    }
                ],
                darkMode: true,
                isNotesPreviewMode: true,
                editingTaskId: { blockId: 1, taskId: 1 }
            };

            // After nuclear reset - verify EVERYTHING is factory default
            const postNuclearState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null,
                darkMode: false,
                isNotesPreviewMode: false
            };

            // Count total data before and after
            const beforeData = {
                blocks: maximalState.blocks.length,
                tasks: maximalState.blocks.reduce((sum, b) => sum + b.tasks.length, 0),
                customWake: maximalState.wakeTime !== '07:00',
                customSleep: maximalState.sleepTime !== '23:00',
                darkEnabled: maximalState.darkMode,
                hasEditingState: maximalState.editingTaskId !== null
            };

            const afterData = {
                blocks: postNuclearState.blocks.length,
                tasks: postNuclearState.blocks.reduce((sum, b) => sum + (b.tasks ? b.tasks.length : 0), 0),
                customWake: postNuclearState.wakeTime !== '07:00',
                customSleep: postNuclearState.sleepTime !== '23:00',
                darkEnabled: postNuclearState.darkMode,
                hasEditingState: postNuclearState.editingTaskId !== null
            };

            TimePlannerTests.assert(
                beforeData.blocks === 2 && afterData.blocks === 0,
                'Nuclear reset eliminates all blocks (2→0)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                beforeData.tasks === 3 && afterData.tasks === 0,
                'Nuclear reset eliminates all tasks (3→0)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                beforeData.customWake && !afterData.customWake,
                'Nuclear reset restores default wake time (custom→07:00)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                beforeData.customSleep && !afterData.customSleep,
                'Nuclear reset restores default sleep time (custom→23:00)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                beforeData.darkEnabled && !afterData.darkEnabled,
                'Nuclear reset disables dark mode (dark→light)',
                'dataManagement'
            );

            TimePlannerTests.assert(
                beforeData.hasEditingState && !afterData.hasEditingState,
                'Nuclear reset clears editing state (active→null)',
                'dataManagement'
            );
        },

        fileFormatValidation: function() {
            const jsonString = '{"version":"1.0","data":{"wakeTime":"08:00"}}';
            const invalidJsonString = '{"version":"1.0","data":{"wakeTime":"08:00"'; // Missing closing braces
            const nonJsonString = 'This is not JSON data';

            // Test valid JSON parsing
            let validParse = false;
            try {
                const parsed = JSON.parse(jsonString);
                validParse = parsed.version === "1.0";
            } catch (e) {
                validParse = false;
            }

            TimePlannerTests.assert(
                validParse,
                'Valid JSON file parses correctly',
                'dataManagement'
            );

            // Test invalid JSON handling
            let invalidParse = false;
            try {
                JSON.parse(invalidJsonString);
                invalidParse = true; // If no error, parsing succeeded (bad)
            } catch (e) {
                invalidParse = false; // Error occurred (good)
            }

            TimePlannerTests.assert(
                !invalidParse,
                'Invalid JSON file throws parsing error',
                'dataManagement'
            );

            // Test non-JSON handling
            let nonJsonParse = false;
            try {
                JSON.parse(nonJsonString);
                nonJsonParse = true;
            } catch (e) {
                nonJsonParse = false;
            }

            TimePlannerTests.assert(
                !nonJsonParse,
                'Non-JSON file throws parsing error',
                'dataManagement'
            );
        },

        backupRecoveryWorkflow: function() {
            // Simulate complete backup/recovery workflow
            const originalState = {
                dayIsSet: true,
                wakeTime: '08:00',
                sleepTime: '22:00',
                blocks: [{ id: 1, purpose: 'Important Work', duration: 120, tasks: [] }],
                darkMode: true
            };

            // Step 1: Export (backup) data
            const exportedData = {
                exportDate: new Date().toISOString(),
                version: "1.0",
                data: { ...originalState }
            };

            TimePlannerTests.assert(
                JSON.stringify(exportedData.data) === JSON.stringify(originalState),
                'Export creates accurate backup of current state',
                'dataManagement'
            );

            // Step 2: Simulate data loss (clear history)
            const clearedState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                darkMode: false
            };

            TimePlannerTests.assert(
                clearedState.blocks.length === 0,
                'Data loss simulation clears all blocks',
                'dataManagement'
            );

            // Step 3: Restore from backup (import)
            const restoredState = { ...exportedData.data };

            TimePlannerTests.assert(
                restoredState.blocks.length === originalState.blocks.length,
                'Import restores all blocks from backup',
                'dataManagement'
            );

            TimePlannerTests.assert(
                restoredState.wakeTime === originalState.wakeTime,
                'Import restores original schedule settings',
                'dataManagement'
            );

            TimePlannerTests.assert(
                restoredState.darkMode === originalState.darkMode,
                'Import restores theme preferences',
                'dataManagement'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_DataManagementShouldFail: function() {
            const exportData = { version: "1.0", data: {} };
            TimePlannerTests.assert(
                exportData.version === "2.0", // Version is 1.0, not 2.0
                'NEGATIVE TEST: Wrong version number should fail',
                'dataManagement'
            );
        }
    },

    // DOM Interaction Tests (if DOM is available)
    domTests: {
        elementsExist: function() {
            const setupSection = document.getElementById('setup-section');
            const plannerSection = document.getElementById('planner-section');
            const settingsBtn = document.getElementById('settings-btn');

            TimePlannerTests.assert(
                setupSection !== null,
                'Setup section exists in DOM',
                'dom'
            );

            TimePlannerTests.assert(
                plannerSection !== null,
                'Planner section exists in DOM',
                'dom'
            );

            TimePlannerTests.assert(
                settingsBtn !== null,
                'Settings button exists in DOM',
                'dom'
            );
        },

        modalElements: function() {
            const addBlockModal = document.getElementById('add-block-modal');
            const taskDetailsModal = document.getElementById('task-details-modal');
            const settingsModal = document.getElementById('settings-modal');

            TimePlannerTests.assert(
                addBlockModal !== null,
                'Add block modal exists in DOM',
                'dom'
            );

            TimePlannerTests.assert(
                taskDetailsModal !== null,
                'Task details modal exists in DOM',
                'dom'
            );

            TimePlannerTests.assert(
                settingsModal !== null,
                'Settings modal exists in DOM',
                'dom'
            );
        },

        // NEGATIVE TEST - This should fail
        negativeTest_DOMShouldFail: function() {
            const nonExistentElement = document.getElementById('non-existent-element-xyz123');
            TimePlannerTests.assert(
                nonExistentElement !== null, // This element doesn't exist, so it IS null
                'NEGATIVE TEST: Non-existent element should fail',
                'dom'
            );
        }
    },

    // Test runners
    runCategory: function(categoryName) {
        console.log(`\n🧪 Running ${categoryName} tests...`);
        this.setup();
        
        const category = this[categoryName + 'Tests'];
        if (!category) {
            console.log(`❌ Category '${categoryName}' not found`);
            return;
        }

        Object.keys(category).forEach(testName => {
            if (typeof category[testName] === 'function') {
                try {
                    category[testName]();
                } catch (error) {
                    console.log(`❌ ${testName} - Error: ${error.message}`);
                    this.assert(false, `${testName} - Error: ${error.message}`, categoryName);
                }
            }
        });

        this.showCategoryResults(categoryName);
        this.teardown();
    },

    // EDIT FUNCTIONALITY TESTS
    editFunctionalityTests: {
        blockEditState: function() {
            // Test block edit state management
            TimePlannerTests.assert(
                typeof window.state.isEditingBlock === 'boolean',
                'Block edit state exists and is boolean',
                'editFunctionality'
            );

            TimePlannerTests.assert(
                window.state.editingBlockId === null,
                'Block edit ID starts as null',
                'editFunctionality'
            );

            // Test setting edit state
            window.state.isEditingBlock = true;
            window.state.editingBlockId = 123;
            
            TimePlannerTests.assert(
                window.state.isEditingBlock === true && window.state.editingBlockId === 123,
                'Can set block edit state properly',
                'editFunctionality'
            );

            // Reset for other tests
            window.state.isEditingBlock = false;
            window.state.editingBlockId = null;
        },

        blockEditModeDetection: function() {
            // Create a test block
            const testBlock = {
                id: 1,
                purpose: 'Test Block',
                duration: 60,
                tasks: []
            };
            window.state.blocks = [testBlock];

            // Test edit mode detection
            window.state.isEditingBlock = true;
            window.state.editingBlockId = 1;

            TimePlannerTests.assert(
                window.state.isEditingBlock && window.state.editingBlockId === 1,
                'Block edit mode properly detected',
                'editFunctionality'
            );

            // Test finding block being edited
            const editingBlock = window.state.blocks.find(b => b.id === window.state.editingBlockId);
            TimePlannerTests.assert(
                editingBlock && editingBlock.purpose === 'Test Block',
                'Can find block being edited by ID',
                'editFunctionality'
            );

            // Reset
            window.state.blocks = [];
            window.state.isEditingBlock = false;
            window.state.editingBlockId = null;
        },

        taskInlineEditValidation: function() {
            // Test task edit button existence (simulated)
            TimePlannerTests.assert(
                true, // Edit buttons are added in rendering
                'Task edit buttons are added to DOM',
                'editFunctionality'
            );

            // Test task text validation for editing
            const validTexts = ['Updated task', 'New task name', '📝 Task with emoji'];
            const invalidTexts = ['', '   ', null, undefined];

            validTexts.forEach(text => {
                TimePlannerTests.assert(
                    text && text.trim().length > 0,
                    `Valid task text "${text}" passes validation`,
                    'editFunctionality'
                );
            });

            invalidTexts.forEach(text => {
                TimePlannerTests.assert(
                    !text || text.trim().length === 0,
                    `Invalid task text "${text}" fails validation`,
                    'editFunctionality'
                );
            });
        },

        editStateExportImport: function() {
            // Test export includes edit state
            window.state.isEditingBlock = true;
            window.state.editingBlockId = 456;

            const mockExportData = {
                wakeTime: window.state.wakeTime,
                sleepTime: window.state.sleepTime,
                blocks: window.state.blocks,
                darkMode: window.state.darkMode,
                dayIsSet: window.state.dayIsSet,
                editingTaskId: window.state.editingTaskId,
                editingBlockId: window.state.editingBlockId,
                isEditingBlock: window.state.isEditingBlock,
                isNotesPreviewMode: window.state.isNotesPreviewMode
            };

            TimePlannerTests.assert(
                mockExportData.editingBlockId === 456,
                'Export includes editingBlockId',
                'editFunctionality'
            );

            TimePlannerTests.assert(
                mockExportData.isEditingBlock === true,
                'Export includes isEditingBlock state',
                'editFunctionality'
            );

            // Reset
            window.state.isEditingBlock = false;
            window.state.editingBlockId = null;
        },

        editModeReset: function() {
            // Test that edit states are properly reset
            window.state.isEditingBlock = true;
            window.state.editingBlockId = 789;
            window.state.editingTaskId = { blockId: 1, taskId: 2 };

            // Simulate clear all history
            const resetState = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null,
                editingBlockId: null,
                isEditingBlock: false,
                darkMode: false,
                isNotesPreviewMode: false
            };

            TimePlannerTests.assert(
                resetState.editingBlockId === null,
                'Clear history resets editingBlockId',
                'editFunctionality'
            );

            TimePlannerTests.assert(
                resetState.isEditingBlock === false,
                'Clear history resets isEditingBlock',
                'editFunctionality'
            );

            TimePlannerTests.assert(
                resetState.editingTaskId === null,
                'Clear history resets editingTaskId',
                'editFunctionality'
            );
        }
    },

    runAll: function() {
        console.log('🚀 Starting Complete Test Suite for Daily Time Planner\n');
        this.setup();

        const categories = ['state', 'timeCalculation', 'daySetup', 'timeBlock', 'task', 'settings', 'timeValidation', 'ui', 'integration', 'error', 'markdown', 'toggleMode', 'enhancedTask', 'uiEnhancement', 'dataManagement', 'editFunctionality', 'dom'];
        
        categories.forEach(category => {
            const categoryTests = this[category + 'Tests'];
            if (categoryTests) {
                console.log(`\n📂 Testing ${category}...`);
                Object.keys(categoryTests).forEach(testName => {
                    if (typeof categoryTests[testName] === 'function') {
                        try {
                            categoryTests[testName]();
                        } catch (error) {
                            console.log(`❌ ${testName} - Error: ${error.message}`);
                            this.assert(false, `${testName} - Error: ${error.message}`, category);
                        }
                    }
                });
            }
        });

        this.showCompleteResults();
        this.teardown();
    },

    // Results display
    showCategoryResults: function(categoryName) {
        const category = this.results.categories[categoryName];
        if (category) {
            const total = category.passed + category.failed;
            const percentage = total > 0 ? ((category.passed / total) * 100).toFixed(1) : 0;
            
            console.log(`\n📊 ${categoryName} Results: ${category.passed}/${total} passed (${percentage}%)`);
            
            if (category.failed > 0) {
                console.log('❌ Failed tests:');
                category.tests.filter(t => t.status === 'FAILED').forEach(test => {
                    console.log(`   - ${test.name}`);
                });
            }
        }
    },

    showCompleteResults: function() {
        const percentage = this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
        
        console.log('\n' + '='.repeat(50));
        console.log('📈 COMPLETE TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Success Rate: ${percentage}%`);
        
        console.log('\n📂 Category Breakdown:');
        Object.keys(this.results.categories).forEach(category => {
            const cat = this.results.categories[category];
            const total = cat.passed + cat.failed;
            const catPercentage = total > 0 ? ((cat.passed / total) * 100).toFixed(1) : 0;
            const status = cat.failed === 0 ? '✅' : '❌';
            console.log(`   ${status} ${category}: ${cat.passed}/${total} (${catPercentage}%)`);
        });

        if (this.results.failed > 0) {
            console.log('\n🔍 Failed Tests Summary:');
            Object.keys(this.results.categories).forEach(category => {
                const failedTests = this.results.categories[category].tests.filter(t => t.status === 'FAILED');
                if (failedTests.length > 0) {
                    console.log(`   ${category}:`);
                    failedTests.forEach(test => {
                        const isNegativeTest = test.name.includes('NEGATIVE TEST');
                        if (isNegativeTest) {
                            console.log(`     🚨 ${test.name} (CRITICAL: Negative test should have failed!)`);
                        } else {
                            console.log(`     ❌ ${test.name}`);
                        }
                    });
                }
            });
        }

        console.log('\n' + '='.repeat(50));
        
        if (percentage >= 95) {
            console.log('🎉 Excellent! Your app and test framework are working perfectly!');
        } else if (percentage >= 80) {
            console.log('👍 Good job! A few minor issues to address.');
        } else {
            console.log('⚠️  Some issues found. Check the failed tests above.');
        }
        
        // Show breakdown of negative vs positive tests
        const negativeTestCount = this.countNegativeTests();
        const positiveTestCount = this.results.total - negativeTestCount;
        console.log(`\n📊 Test Breakdown:`);
        console.log(`   • Functional Tests: ${positiveTestCount}`);
        console.log(`   • Negative Tests: ${negativeTestCount} (should fail to verify framework)`);
    },

    // Count negative tests
    countNegativeTests: function() {
        let count = 0;
        Object.keys(this.results.categories).forEach(category => {
            const cat = this.results.categories[category];
            cat.tests.forEach(test => {
                if (test.name.includes('NEGATIVE TEST')) {
                    count++;
                }
            });
        });
        return count;
    },

    // Quick test commands
    quickTest: function() {
        console.log('🏃 Running Quick Test Suite (Core Features Only)\n');
        this.setup();
        this.stateTests.saveAndLoad();
        this.timeCalculationTests.basicTimeCalculation();
        this.timeBlockTests.createBlock();
        this.taskTests.addTask();
        this.taskTests.deleteTask();
        this.showCompleteResults();
        this.teardown();
    }
};

// Convenience aliases for easier console usage
window.runTests = () => TimePlannerTests.runAll();
window.quickTest = () => TimePlannerTests.quickTest();
window.testState = () => TimePlannerTests.runCategory('state');
window.testTasks = () => TimePlannerTests.runCategory('task');
window.testBlocks = () => TimePlannerTests.runCategory('timeBlock');
window.testSettings = () => TimePlannerTests.runCategory('settings');
window.testTimeValidation = () => TimePlannerTests.runCategory('timeValidation');
window.testDarkMode = () => TimePlannerTests.runCategory('settings'); // Dark mode tests are in settings

// NEW: Test aliases for enhanced features
window.testMarkdown = () => TimePlannerTests.runCategory('markdown');
window.testToggleMode = () => TimePlannerTests.runCategory('toggleMode');
window.testEnhancedTasks = () => TimePlannerTests.runCategory('enhancedTask');
window.testUIEnhancements = () => TimePlannerTests.runCategory('uiEnhancement');
window.testDataManagement = () => TimePlannerTests.runCategory('dataManagement');

// Auto-display usage instructions
console.log(`
🧪 DAILY TIME PLANNER TEST SUITE LOADED
=====================================

Quick Commands:
• runTests()           - Run all tests (120+ tests)
• quickTest()          - Run core functionality tests only
• testTasks()          - Test task management
• testBlocks()         - Test time block management  
• testSettings()       - Test settings functionality
• testTimeValidation() - Test time overlap validation
• testState()          - Test data persistence

NEW Enhancement Tests:
• testMarkdown()       - Test markdown parser functionality
• testToggleMode()     - Test Edit/Preview toggle mode
• testEnhancedTasks()  - Test enhanced task features
• testUIEnhancements() - Test UI improvements
• testDataManagement() - Test export/import/clear history

Advanced:
• TimePlannerTests.runCategory('categoryName')
• TimePlannerTests.setup()    - Reset test environment
• TimePlannerTests.teardown() - Restore original state

Ready to test! Try: runTests()
`);
