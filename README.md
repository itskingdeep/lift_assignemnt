# Lift Simulation Web App


A responsive web application that simulates elevator/lift mechanics with realistic movement and door operations.

## Features

- Customizable number of floors (1-20) and lifts (1-10)
- Visual representation of building with elevators
- Realistic lift movement (2 seconds per floor)
- Door opening (2.5s) and closing (2.5s) animations
- Smart lift allocation system (chooses nearest available lift)
- Mobile-friendly responsive design
- Floor numbering starting from 1 (Ground floor)

## How to Use

1. **Setup**:
   - Enter the number of floors (1-20)
   - Enter the number of lifts (1-10)
   - Click "Start Simulation"

2. **Using the Simulation**:
   - Click ▲ buttons to call lift to go up
   - Click ▼ buttons to call lift to go down
   - Watch lifts move between floors with door animations
   - Click "Reset Simulation" to start over

## Technical Details

### Architecture
- **Data Layer**: Tracks lift states (position, movement, doors)
- **Controller**: Manages lift allocation and movement logic
- **View**: Visual representation responding to controller commands

### Key Algorithms
- Nearest lift allocation for efficiency
- Queue management for handling multiple requests
- Animation timing for realistic movement

## Installation

No installation required! Simply open `index.html` in any modern browser.

For local development:
```bash
git clone https://github.com/your-username/lift-simulation.git
cd lift-simulation
# Open index.html in browser
