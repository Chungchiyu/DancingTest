const figure = document.getElementById('figure');
const svg = document.getElementById('svgLayer');
const nodes = [
    { id: 0, x: 150, y: 50 },
    { id: 1, x: 158, y: 30 }, { id: 2, x: 165, y: 30 }, { id: 3, x: 172, y: 30 },
    { id: 4, x: 142, y: 30 }, { id: 5, x: 135, y: 30 }, { id: 6, x: 128, y: 30 },
    { id: 7, x: 185, y: 40 }, { id: 8, x: 115, y: 40 },
    { id: 9, x: 160, y: 70 }, { id: 10, x: 140, y: 70 },
    { id: 11, x: 200, y: 105 }, { id: 12, x: 100, y: 105 },
    { id: 13, x: 225, y: 130 }, { id: 14, x: 75, y: 130 },
    { id: 15, x: 250, y: 115 }, { id: 16, x: 50, y: 115 },
    { id: 17, x: 270, y: 117 }, { id: 18, x: 30, y: 117 },
    { id: 19, x: 263, y: 97 }, { id: 20, x: 37, y: 97 },
    { id: 21, x: 247, y: 102 }, { id: 22, x: 53, y: 102 },
    { id: 23, x: 185, y: 200 }, { id: 24, x: 115, y: 200 },
    { id: 25, x: 195, y: 290 }, { id: 26, x: 105, y: 290 },
    { id: 27, x: 185, y: 380 }, { id: 28, x: 115, y: 380 },
    { id: 29, x: 175, y: 400 }, { id: 30, x: 125, y: 400 },
    { id: 31, x: 220, y: 405 }, { id: 32, x: 80, y: 405 }
];
const connections = [
    [0, 2], [0, 5], [7, 2], [8, 5], [9, 10], [11, 12], [13, 11],
    [14, 12], [15, 13], [16, 14], [16, 20], [17, 15], [18, 16],
    [19, 17], [15, 19], [20, 18], [21, 15], [22, 16], [23, 11],
    [24, 12], [24, 23], [25, 23], [26, 24], [27, 25], [28, 26],
    [29, 27], [30, 28], [31, 29], [32, 30], [28, 32], [27, 31]
];
let selectedPoints = [];
let useExteriorAngle = false;
let selectedCoordinateLine = null;
let showCoordinateSystem = false;
let selectedButton = null;

// Initial draw of the dashed circle
drawDashedCircle();

// Modify the CSS for the SVG layer to ensure it's always on top
svg.style.zIndex = '9999';

// Create nodes and connections
nodes.forEach(createNode);
connections.forEach(([startId, endId]) => {
    const start = nodes.find(n => n.id === startId);
    const end = nodes.find(n => n.id === endId);
    createLine(start, end);
});

function createNode(node) {
    const element = document.createElement('div');
    element.className = 'node';
    element.setAttribute('id', node.id);
    element.style.left = `${node.x - 5}px`;
    element.style.top = `${node.y - 5}px`;
    element.textContent = node.id;
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node, element);
    });
    figure.appendChild(element);
}

function createLine(start, end) {
    const line = document.createElement('div');
    line.className = 'line';
    const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    line.style.width = `${length}px`;
    line.style.left = `${start.x}px`;
    line.style.top = `${start.y}px`;
    line.style.transform = `rotate(${angle}rad)`;
    figure.appendChild(line);
}

function selectNode(node, element) {
    const index = selectedPoints.findIndex(p => p.id === node.id);
    if (index !== -1) {
        selectedPoints.splice(index, 1);
        element.classList.remove('selected');
    } else {
        if (selectedPoints.length >= 3) {
            const removedNode = selectedPoints.shift();
            document.querySelector(`.node:nth-child(${removedNode.id + 1})`).classList.remove('selected');
        }
        selectedPoints.push(node);
        element.classList.add('selected');
    }
    showCoordinateSystem = selectedPoints.length === 2;
    updateAngle();
}

function calculateAngle(p1, p2, p3) {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    const cosAngle = dotProduct / (v1Mag * v2Mag);
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
    return Math.acos(clampedCosAngle);
}

function createSVGElement(type) {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
}

function drawDashedCircle() {
    const circle = createSVGElement('circle');
    circle.setAttribute('cx', '150');
    circle.setAttribute('cy', '40');
    circle.setAttribute('r', '35');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'black');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(circle);
}

function drawCoordinateSystem(x, y) {
    const size = 50;
    const angles = [0, -Math.PI / 4, -Math.PI / 2, Math.PI / 2, Math.PI, 3 * Math.PI / 4];
    const labels = ['RH', 'IH', 'UV', 'DV', 'LH', 'OH'];

    angles.forEach((angle, index) => {
        const line = createSVGElement('line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x + size * Math.cos(angle));
        line.setAttribute('y2', y + size * Math.sin(angle));
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('data-label', labels[index]);
        line.style.transition = 'all 0.3s ease';

        const hitBox = createSVGElement('line');
        hitBox.setAttribute('x1', x);
        hitBox.setAttribute('y1', y);
        hitBox.setAttribute('x2', x + size * Math.cos(angle));
        hitBox.setAttribute('y2', y + size * Math.sin(angle));
        hitBox.setAttribute('stroke', 'transparent');
        hitBox.setAttribute('stroke-width', '3');

        const label = createSVGElement('text');
        label.setAttribute('x', x + (size + 10) * Math.cos(angle));
        label.setAttribute('y', y + (size + 10) * Math.sin(angle));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        label.textContent = labels[index];
        label.style.opacity = '0';

        hitBox.addEventListener('mouseover', () => {
            line.setAttribute('stroke', 'red');
            line.setAttribute('stroke-width', '2');
            label.style.opacity = '1';
        });

        hitBox.addEventListener('mouseout', () => {
            if (selectedCoordinateLine !== line) {
                line.setAttribute('stroke', 'black');
                line.setAttribute('stroke-width', '1');
            }
            label.style.opacity = '0';
        });

        hitBox.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedCoordinateLine) {
                selectedCoordinateLine.setAttribute('stroke', 'black');
                selectedCoordinateLine.setAttribute('stroke-width', '1');
            }
            line.setAttribute('stroke', 'blue');
            line.setAttribute('stroke-width', '2');
            selectedCoordinateLine = line;

            const endX = parseFloat(line.getAttribute('x2'));
            const endY = parseFloat(line.getAttribute('y2'));
            const virtualPoint = { x: endX, y: endY, id: labels[index] };
            selectNode(virtualPoint, { classList: { add: () => { }, remove: () => { } } });
        });

        svg.appendChild(line);
        svg.appendChild(hitBox);
        svg.appendChild(label);
    });
}

function updateAngle() {
    svg.innerHTML = '';

    if (selectedPoints.length >= 2) {
        const [p1, p2] = selectedPoints;
        const line = createSVGElement('line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('stroke', 'blue');
        line.setAttribute('stroke-width', '6');
        svg.appendChild(line);
    }

    if (selectedPoints.length === 3) {
        const [p1, p2, p3] = selectedPoints;
        const line2 = createSVGElement('line');
        line2.setAttribute('x1', p2.x);
        line2.setAttribute('y1', p2.y);
        line2.setAttribute('x2', p3.x);
        line2.setAttribute('y2', p3.y);
        line2.setAttribute('stroke', 'blue');
        line2.setAttribute('stroke-width', '6');
        svg.appendChild(line2);

        const interiorAngle = calculateAngle(p1, p2, p3);
        const exteriorAngle = 2 * Math.PI - interiorAngle;
        drawAngle(p1, p2, p3, interiorAngle, 'red', false);
        drawAngle(p1, p2, p3, exteriorAngle, 'blue', true);
    }

    if (selectedPoints.length >= 2) {
        const [p1, p2] = selectedPoints;
        drawCoordinateSystem(p2.x, p2.y);
        
        // Highlight saved coordinate lines
        selectedPoints.forEach(point => {
            if (typeof point.id === 'string') {
                const coordinateLine = svg.querySelector(`line[data-label="${point.id}"]`);
                if (coordinateLine) {
                    coordinateLine.setAttribute('stroke', 'blue');
                    coordinateLine.setAttribute('stroke-width', '2');
                }
            }
        });
    }

    drawDashedCircle();
}

function drawAngle(p1, p2, p3, angle, color, isExteriorAngle) {
    if (isExteriorAngle && !useExteriorAngle) return;
    if (!isExteriorAngle && useExteriorAngle) return;

    const radius = 30;
    const startAngle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const endAngle = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    const start = {
        x: p2.x + radius * Math.cos(startAngle),
        y: p2.y + radius * Math.sin(startAngle)
    };
    const end = {
        x: p2.x + radius * Math.cos(endAngle),
        y: p2.y + radius * Math.sin(endAngle)
    };

    let sweepFlag = 1;
    if ((endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI) > Math.PI) {
        sweepFlag = isExteriorAngle ? 1 : 0;
    } else {
        sweepFlag = isExteriorAngle ? 0 : 1;
    }

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const path = createSVGElement('path');
    const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y} L ${p2.x} ${p2.y} Z`;
    path.setAttribute('d', d);
    path.setAttribute('fill', `rgba(${color === 'red' ? '255,0,0' : '0,0,255'}, 0.2)`);
    path.setAttribute('stroke', color);

    path.addEventListener('click', (e) => {
        e.stopPropagation();
        useExteriorAngle = !useExteriorAngle;
        updateAngle();
    });

    svg.appendChild(path);
}

// Create save buttons
const savedAngles = Array(6).fill(null);
for (let i = 0; i < 6; i++) {
    const button = document.querySelectorAll('.angleCard');
    button[i].addEventListener('click', (e) => {
        e.stopPropagation();
        if (button[i].classList.contains('selected')) {
            button[i].classList.remove('selected');
            // showAllAngle();
        }
        else
            selectAngleButton(i);
    });
}

// Create update button
const updateButton = document.createElement('button');
updateButton.textContent = 'Update';
updateButton.style.position = 'absolute';
updateButton.style.right = '10px';
updateButton.style.bottom = '10px';
updateButton.addEventListener('click', saveAngle);
figure.appendChild(updateButton);

function loadAngleFromButtonContent(content) {
    // Parse the content and load the angle
    const pointIds = content.split(',').map(id => id.trim());
    selectedPoints = pointIds.map(id => {
        if (['RH', 'IH', 'UV', 'DV', 'LH', 'OH'].includes(id)) {
            // For coordinate lines
            return { id: id, x: 0, y: 0 }; // Coordinates will be set in updateAngle
        } else {
            return nodes.find(n => n.id === parseInt(id));
        }
    });
    updateAngle();
    highlightSelectedNodes();
}

// Define angleData at the top level of your script
let angleData = Array(6).fill(null);

function saveAngle() {
    if (selectedPoints.length == 0) {
        updateButtonLabel(selectedButton, 'none');
        return;
    } else if (selectedPoints.length !== 3) {
        alert('Please select three points or coordinate positions to save an angle.');
        return;
    }
    if (selectedButton === null) {
        alert('Please select an angle button to save the angle.');
        return;
    }
    const newAngleData = selectedPoints.map(p => {
        if (typeof p.id === 'string') {
            // For coordinate lines, store the line details
            return { id: p.id, x: p.x, y: p.y };
        }
        return p.id;
    });
    
    const angleDataString = newAngleData.map(p => typeof p === 'object' ? p.id : p).join(',');

    if (groups.length > 0 && selectedGroup !== null) {
        // If groups exist and one is selected, save to the selected group
        groups[selectedGroup].data[`J${selectedButton + 1}`] = angleDataString;
    } else {
        // If no groups exist or no group is selected, save to angleData
        angleData[selectedButton] = newAngleData;
    }

    updateButtonLabel(selectedButton, angleDataString);
}

function updateButtonLabel(index, angleData) {
    const button = document.querySelector(`.angleCard:nth-of-type(${index + 1})`);
    if (angleData === 'none') {
        button.querySelector('.angleCard-content').textContent = 'none';
    } else if (typeof angleData === 'string') {
        button.querySelector('.angleCard-content').textContent = angleData;
    } else if (Array.isArray(angleData)) {
        button.querySelector('.angleCard-content').textContent = angleData.map(p => typeof p === 'object' ? p.id : p).join(',');
    } else {
        console.error('Unexpected angleData format:', angleData);
        button.querySelector('.angleCard-content').textContent = 'Error';
    }
}

function selectAngleButton(index) {
    if (selectedButton !== null) {
        const prevButton = document.querySelector(`.angleCard:nth-of-type(${selectedButton + 1})`);
        prevButton.classList.remove('selected');
    }
    selectedButton = index;
    const button = document.querySelector(`.angleCard:nth-of-type(${index + 1})`);
    button.classList.add('selected');

    let currentAngleData;
    if (groups.length > 0 && selectedGroup !== null) {
        // If groups exist and one is selected, load from the selected group
        currentAngleData = groups[selectedGroup].data[`J${index + 1}`];
    } else {
        // If no groups exist or no group is selected, load from angleData
        currentAngleData = angleData[index];
    }

    if (currentAngleData) {
        if (typeof currentAngleData === 'string') {
            loadAngleFromButtonContent(currentAngleData);
        } else if (Array.isArray(currentAngleData)) {
            loadAngle(currentAngleData);
        } else {
            console.error('Unexpected angleData format:', currentAngleData);
            clearFigure();
        }
    } else {
        // Load angle data from button content if no data in groups or angleData
        const buttonContent = button.querySelector('.angleCard-content').textContent.trim();
        if (buttonContent !== 'none') {
            loadAngleFromButtonContent(buttonContent);
        } else {
            clearFigure(); // Clear the figure if content is 'none'
        }
    }
}

function loadAngle(angleData) {
    selectedPoints = angleData.map(point => {
        if (typeof point === 'object') {
            // For coordinate lines
            return point;
        } else {
            return nodes.find(n => n.id === point);
        }
    });
    updateAngle();
    highlightSelectedNodes();
}

function highlightSelectedNodes() {
    // Remove highlight from all nodes
    document.querySelectorAll('.node').forEach(node => {
        node.classList.remove('selected');
    });
    // Highlight selected nodes
    selectedPoints.forEach(point => {
        if (typeof point.id === 'number') {
            document.getElementById(point.id).classList.add('selected');
        }
    });
}

// Add click event to figure to deselect all nodes
figure.addEventListener('click', () => {
    clearFigure();
});

function clearFigure() {
    document.querySelectorAll('.node').forEach(node => {
        node.classList.remove('selected');
    });
    selectedPoints = [];
    useExteriorAngle = false;
    selectedCoordinateLine = null;
    showCoordinateSystem = false;
    updateAngle();
}

document.getElementById('addGroupBtn').addEventListener('click', addGroup);

window.groups = [];
let selectedGroup = null;

document.addEventListener('DOMContentLoaded', () => {
    const defaultGroup = { name: 'default', data: {} };
    const angleCards = document.querySelectorAll('.angleCard');
    angleCards.forEach((card, index) => {
        const content = card.querySelector('.angleCard-content').textContent.trim();
        defaultGroup.data[`J${index + 1}`] = content;
    });
    groups.push(defaultGroup);
    updateGroups();
});

function addGroup() {
    let name = document.getElementById('newGroupName').value.trim();
    if (name === '') {
        name = 'default';
    }
    
    // Collect data from J1~J6
    const groupData = {};
    for (let i = 1; i <= 6; i++) {
        const cardContent = document.querySelector(`.angleCard:nth-of-type(${i}) .angleCard-content`).textContent;
        groupData[`J${i}`] = cardContent;
    }

    groups.push({ name, data: groupData });
    updateGroups();
    document.getElementById('newGroupName').value = '';
    // Clear angleData when a group is added
    angleData = Array(6).fill(null);
}

function updateGroups() {
    const groupsContainer = document.getElementById('groups-container');
    groupsContainer.innerHTML = ''; // Clear existing groups
    groups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'angleCard';
        card.innerHTML = `
            <div class="angleCard-label">G${index + 1}</div>
            <div class="angleCard-content">${group.name}</div>
        `;
        card.addEventListener('click', () => selectGroup(index));
        groupsContainer.appendChild(card);
    });
}

function selectGroup(index) {
    if (selectedGroup === index) {
        // If the same group is clicked again, deselect it
        const groupCard = document.querySelector(`#groups-container .angleCard:nth-child(${index + 1})`);
        groupCard.classList.remove('selected');
        selectedGroup = null;
        // Load data from angleData
        for (let i = 1; i <= 6; i++) {
            const card = document.querySelector(`.angleCard:nth-of-type(${i})`);
            const content = angleData[i - 1] ? angleData[i - 1].map(p => typeof p === 'object' ? p.id : p).join(',') : 'none';
            card.querySelector('.angleCard-content').textContent = content;
        }
    } else {
        // Deselect previously selected group
        if (selectedGroup !== null) {
            const prevGroupCard = document.querySelector(`#groups-container .angleCard:nth-child(${selectedGroup + 1})`);
            prevGroupCard.classList.remove('selected');
        }

        selectedGroup = index;
        const group = groups[index];
        const groupCard = document.querySelector(`#groups-container .angleCard:nth-child(${index + 1})`);
        groupCard.classList.add('selected');

        if (group && group.data) {
            // Update J1~J6 angleCards with the group data
            for (let i = 1; i <= 6; i++) {
                const card = document.querySelector(`.angleCard:nth-of-type(${i})`);
                const content = group.data[`J${i}`] || 'none';
                card.querySelector('.angleCard-content').textContent = content;
            }
        }
    }
}