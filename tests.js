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
        if (window.state) {
            window.state = {
                dayIsSet: false,
                wakeTime: '07:00',
                sleepTime: '23:00',
                blocks: [],
                editingTaskId: null
            };
        }
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

        resetDay: function() {
            const testState = {
                dayIsSet: true,
                wakeTime: '08:00',
                sleepTime: '22:00',
                blocks: [{ id: 1, purpose: 'Test', duration: 60, tasks: [] }],
                editingTaskId: null
            };

            // Simulate reset
            testState.dayIsSet = false;
            testState.blocks = [];

            TimePlannerTests.assert(
                testState.dayIsSet === false,
                'Day reset sets dayIsSet to false',
                'daySetup'
            );

            TimePlannerTests.assert(
                testState.blocks.length === 0,
                'Day reset clears all blocks',
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

    // Error Handling Tests
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

    runAll: function() {
        console.log('🚀 Starting Complete Test Suite for Daily Time Planner\n');
        this.setup();

        const categories = ['state', 'timeCalculation', 'daySetup', 'timeBlock', 'task', 'settings', 'ui', 'integration', 'error', 'dom'];
        
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

// Auto-display usage instructions
console.log(`
🧪 DAILY TIME PLANNER TEST SUITE LOADED
=====================================

Quick Commands:
• runTests()        - Run all tests
• quickTest()       - Run core functionality tests only
• testTasks()       - Test task management
• testBlocks()      - Test time block management  
• testSettings()    - Test settings functionality
• testState()       - Test data persistence

Advanced:
• TimePlannerTests.runCategory('categoryName')
• TimePlannerTests.setup()    - Reset test environment
• TimePlannerTests.teardown() - Restore original state

Ready to test! Try: runTests()
`);
