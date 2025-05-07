// Application State
const state = {
    floors: 0,
    lifts: 0,
    liftStates: [],
    queue: []
};

// DOM Elements
const setupPanel = document.getElementById('setupPanel');
const simulationContainer = document.getElementById('simulationContainer');
const floorsContainer = document.getElementById('floorsContainer');
const liftsContainer = document.getElementById('liftsContainer');
const startSimulationBtn = document.getElementById('startSimulation');
const resetSimulationBtn = document.getElementById('resetSimulation');
const floorsInput = document.getElementById('floorsInput');
const liftsInput = document.getElementById('liftsInput');

// Initialize the application
function init() {
    startSimulationBtn.addEventListener('click', startSimulation);
    resetSimulationBtn.addEventListener('click', resetSimulation);
}

// Start the simulation
function startSimulation() {
    const floors = parseInt(floorsInput.value);
    const lifts = parseInt(liftsInput.value);
    
    if (floors < 2 || lifts < 1) {
        alert('Please enter valid numbers (min 2 floors and 1 lift)');
        return;
    }
    
    state.floors = floors;
    state.lifts = lifts;
    state.liftStates = Array(lifts).fill().map((_, i) => ({
        id: i,
        currentFloor: 0,
        targetFloors: [],
        isMoving: false,
        isDoorOpen: false
    }));
    state.queue = [];
    
    renderBuilding();
    
    setupPanel.style.display = 'none';
    simulationContainer.style.display = 'block';
}

// Reset the simulation
function resetSimulation() {
    simulationContainer.style.display = 'none';
    setupPanel.style.display = 'block';
    floorsContainer.innerHTML = '';
    liftsContainer.innerHTML = '';
}

// Render the building with floors and lifts
// In the renderBuilding function, reverse the floor order:
// In the renderBuilding function:
function renderBuilding() {
    floorsContainer.innerHTML = '';
    liftsContainer.innerHTML = '';
    document.documentElement.style.setProperty('--floors', state.floors);
    
    // Create floors from top floor down to floor 1
    for (let i = state.floors; i >= 1; i--) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        floor.dataset.floor = i;
        
        const floorLabel = document.createElement('div');
        floorLabel.className = 'floor-label';
        floorLabel.textContent = `Floor ${i}`;
        
        const buttons = document.createElement('div');
        buttons.className = 'floor-buttons';
        
        const upButton = document.createElement('button');
        upButton.className = 'floor-button';
        upButton.textContent = '▲';
        upButton.dataset.floor = i;
        upButton.dataset.direction = 'up';
        if (i === state.floors) {  // Disable up button on top floor
            upButton.disabled = true;
        }
        
        const downButton = document.createElement('button');
        downButton.className = 'floor-button';
        downButton.textContent = '▼';
        downButton.dataset.floor = i;
        downButton.dataset.direction = 'down';
        if (i === 1) {  // Disable down button on bottom floor (1)
            downButton.disabled = true;
        }
        
        upButton.addEventListener('click', () => callLift(i, 'up'));
        downButton.addEventListener('click', () => callLift(i, 'down'));
        
        buttons.appendChild(upButton);
        buttons.appendChild(downButton);
        floor.appendChild(floorLabel);
        floor.appendChild(buttons);
        floorsContainer.appendChild(floor);
    }
    
    // Create lifts starting at floor 1 (bottom)
    for (let i = 0; i < state.lifts; i++) {
        const lift = document.createElement('div');
        lift.className = 'lift';
        lift.dataset.lift = i;
        lift.style.bottom = '10px'; // Position at floor 1 (bottom)
        
        const leftDoor = document.createElement('div');
        leftDoor.className = 'lift-door left';
        
        const rightDoor = document.createElement('div');
        rightDoor.className = 'lift-door right';
        
        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);
        liftsContainer.appendChild(lift);
    }
}

// Call a lift to a specific floor
function callLift(floor, direction) {
    // Check if there's already a lift coming to this floor
    const existingRequest = state.queue.find(req => req.floor === floor && req.direction === direction);
    if (existingRequest) return;
    
    // Add to queue
    state.queue.push({ floor, direction });
    
    // Process queue
    processQueue();
}

// Process the lift queue
function processQueue() {
    if (state.queue.length === 0) return;
    
    const request = state.queue[0];
    
    // Find the best lift for this request
    const bestLift = findBestLift(request.floor, request.direction);
    
    if (bestLift !== null) {
        // Remove this request from queue
        state.queue.shift();
        
        // Add to lift's target floors if not already there
        if (!bestLift.targetFloors.includes(request.floor)) {
            bestLift.targetFloors.push(request.floor);
            bestLift.targetFloors.sort((a, b) => a - b);
        }
        
        // If lift is idle, start moving
        if (!bestLift.isMoving) {
            moveLift(bestLift);
        }
    }
}

// Find the best lift for a floor request
function findBestLift(floor, direction) {
    let bestLift = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < state.liftStates.length; i++) {
        const lift = state.liftStates[i];
        
        // Skip if lift is moving in opposite direction
        if (lift.isMoving && lift.targetFloors.length > 0) {
            const currentDirection = lift.targetFloors[0] > lift.currentFloor ? 'up' : 'down';
            if ((currentDirection === 'up' && direction === 'down' && lift.targetFloors[0] >= floor) ||
                (currentDirection === 'down' && direction === 'up' && lift.targetFloors[0] <= floor)) {
                continue;
            }
        }
        
        // Calculate distance
        const distance = Math.abs(lift.currentFloor - floor);
        
        // If lift is idle or moving towards the floor
        if (!lift.isMoving || 
            (lift.targetFloors[0] >= floor && lift.currentFloor <= floor) ||
            (lift.targetFloors[0] <= floor && lift.currentFloor >= floor)) {
            
            if (distance < minDistance) {
                minDistance = distance;
                bestLift = lift;
            }
        }
    }
    
    return bestLift;
}

// Move lift to its target floors
function moveLift(lift) {
    if (lift.targetFloors.length === 0) {
        lift.isMoving = false;
        processQueue();
        return;
    }
    
    lift.isMoving = true;
    const targetFloor = lift.targetFloors[0];
    
    // Calculate distance to move (each floor is 80px, starting from 1)
    const distance = Math.abs(targetFloor - lift.currentFloor);
    const duration = distance * 2 * 1000; // 2s per floor
    
    // Calculate new bottom position (floor 1 = 0px, floor 2 = 80px, etc.)
    const newBottom = 10 + ((targetFloor - 1) * 100);
    // Animate lift movement
    const liftElement = document.querySelector(`.lift[data-lift="${lift.id}"]`);
    liftElement.style.transition = `bottom ${duration}ms linear`;
    liftElement.style.bottom = `${newBottom}px`;
    
    // Update state when movement completes
    setTimeout(() => {
        lift.currentFloor = targetFloor;
        lift.targetFloors.shift();
        openDoors(lift);
    }, duration);
}

// Open lift doors
function openDoors(lift) {
    const liftElement = document.querySelector(`.lift[data-lift="${lift.id}"]`);
    const doors = liftElement.querySelectorAll('.lift-door');
    
    lift.isDoorOpen = true;
    doors.forEach(door => door.classList.add('open'));
    
    // Close doors after 2.5s
    setTimeout(() => {
        closeDoors(lift);
    }, 2500);
}

// Close lift doors
function closeDoors(lift) {
    const liftElement = document.querySelector(`.lift[data-lift="${lift.id}"]`);
    const doors = liftElement.querySelectorAll('.lift-door');
    
    doors.forEach(door => door.classList.remove('open'));
    
    // After doors are closed (2.5s), move to next target or become idle
    setTimeout(() => {
        lift.isDoorOpen = false;
        moveLift(lift);
    }, 2500);
}

// Initialize the app
init();