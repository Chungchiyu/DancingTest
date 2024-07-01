/* globals */
import * as THREE from 'three';
import { registerDragEvents } from './dragAndDrop.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import URDFManipulator from '../../src/urdf-manipulator-element.js';
import * as math from 'mathjs';
import Sortable, { Swap } from 'sortablejs';
import { degToRad } from 'three/src/math/MathUtils.js';

Sortable.mount(new Swap());

customElements.define('urdf-viewer', URDFManipulator);

// declare these globally for the sake of the example.
// Hack to make the build work with webpack for now.
// TODO: Remove this once modules or parcel is being used
const viewer = document.querySelector('urdf-viewer');

const limitsToggle = document.getElementById('ignore-joint-limits');
const collisionToggle = document.getElementById('collision-toggle');
const radiansToggle = document.getElementById('radians-toggle');
const autocenterToggle = document.getElementById('autocenter-toggle');
const upSelect = document.getElementById('up-select');
const sliderList = document.querySelector('#controls ul');
const controlsel = document.getElementById('controls');
const controlsToggle = document.getElementById('toggle-controls');
const animToggle = document.getElementById('do-animate');
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 1 / DEG2RAD;
const isLoop = document.getElementById('is-loop');
var loop = false;
let sliders = {};

// Global Functions
const setColor = color => {

    document.body.style.backgroundColor = color;
    viewer.highlightColor = '#' + (new THREE.Color(0xE05749)).lerp(new THREE.Color(color), 0.35).getHexString();

};

// Events
// toggle checkbox
// limitsToggle.addEventListener('click', () => {
//     limitsToggle.classList.toggle('checked');
//     viewer.ignoreLimits = limitsToggle.classList.contains('checked');
// });

// radiansToggle.addEventListener('click', () => {
//     radiansToggle.classList.toggle('checked');
//     Object
//         .values(sliders)
//         .forEach(sl => sl.update());
// });

// collisionToggle.addEventListener('click', () => {
//     collisionToggle.classList.toggle('checked');
//     viewer.showCollision = collisionToggle.classList.contains('checked');
// });

isLoop.addEventListener('click', () => {
    isLoop.classList.toggle('checked');
    if (isLoop.classList.contains('checked'))
        loop = true;
    else
        loop = false;
});

autocenterToggle.addEventListener('click', () => {
    autocenterToggle.classList.toggle('checked');
    viewer.noAutoRecenter = !autocenterToggle.classList.contains('checked');
});

upSelect.addEventListener('change', () => viewer.up = upSelect.value);

controlsToggle.addEventListener('click', () => controlsel.classList.toggle('hidden'));

// watch for urdf changes
viewer.addEventListener('urdf-change', () => {

    Object
        .values(sliders)
        .forEach(sl => sl.remove());
    sliders = {};

});

viewer.addEventListener('ignore-limits-change', () => {

    Object
        .values(sliders)
        .forEach(sl => sl.update());

});

viewer.addEventListener('angle-change', e => {

    if (sliders[e.detail]) sliders[e.detail].update();

});

viewer.addEventListener('joint-mouseover', e => {

    const j = document.querySelector(`li[joint-name="${e.detail}"]`);
    if (j) j.setAttribute('robot-hovered', true);

});

viewer.addEventListener('joint-mouseout', e => {

    const j = document.querySelector(`li[joint-name="${e.detail}"]`);
    if (j) j.removeAttribute('robot-hovered');

});

let originalNoAutoRecenter;
viewer.addEventListener('manipulate-start', e => {

    const j = document.querySelector(`li[joint-name="${e.detail}"]`);
    if (j) {
        j.scrollIntoView({ block: 'nearest' });
        window.scrollTo(0, 0);
    }

    originalNoAutoRecenter = viewer.noAutoRecenter;
    viewer.noAutoRecenter = true;

});

viewer.addEventListener('manipulate-end', e => {

    viewer.noAutoRecenter = originalNoAutoRecenter;

});

// create the sliders
viewer.addEventListener('urdf-processed', () => {

    const r = viewer.robot;
    Object
        .keys(r.joints)
        .sort((a, b) => {

            const da = a.split(/[^\d]+/g).filter(v => !!v).pop();
            const db = b.split(/[^\d]+/g).filter(v => !!v).pop();

            if (da !== undefined && db !== undefined) {
                const delta = parseFloat(da) - parseFloat(db);
                if (delta !== 0) return delta;
            }

            if (a > b) return 1;
            if (b > a) return -1;
            return 0;

        })
        .map(key => r.joints[key])
        .forEach(joint => {

            const li = document.createElement('li');
            li.innerHTML =
                `
            <span title="${joint.name}">${joint.name}</span>
            <input type="range" value="0" step="0.0001"/>
            <input type="number" step="0.0001" />
            `;
            li.setAttribute('joint-type', joint.jointType);
            li.setAttribute('joint-name', joint.name);

            sliderList.appendChild(li);

            // update the joint display
            const slider = li.querySelector('input[type="range"]');
            const input = li.querySelector('input[type="number"]');
            li.update = () => {
                // const degMultiplier = radiansToggle.classList.contains('checked') ? 1.0 : RAD2DEG;
                const degMultiplier = RAD2DEG;
                let angle = joint.angle;

                if (joint.jointType === 'revolute' || joint.jointType === 'continuous') {
                    angle *= degMultiplier;
                }

                if (Math.abs(angle) > 1) {
                    angle = angle.toFixed(1);
                } else {
                    angle = angle.toPrecision(2);
                }

                input.value = parseFloat(angle);

                // directly input the value
                slider.value = joint.angle;

                if (viewer.ignoreLimits || joint.jointType === 'continuous') {
                    slider.min = -6.28;
                    slider.max = 6.28;

                    input.min = -6.28 * degMultiplier;
                    input.max = 6.28 * degMultiplier;
                } else {
                    slider.min = joint.limit.lower;
                    slider.max = joint.limit.upper;

                    input.min = joint.limit.lower * degMultiplier;
                    input.max = joint.limit.upper * degMultiplier;
                }
            };

            switch (joint.jointType) {

                case 'continuous':
                case 'prismatic':
                case 'revolute':
                    break;
                default:
                    li.update = () => { };
                    input.remove();
                    slider.remove();

            }

            slider.addEventListener('input', () => {
                viewer.setJointValue(joint.name, slider.value);
                animToggle.classList.remove('checked');
                inputAngles();
                li.update();
            });

            input.addEventListener('change', () => {
                // const degMultiplier = radiansToggle.classList.contains('checked') ? 1.0 : RAD2DEG;
                const degMultiplier = RAD2DEG;
                viewer.setJointValue(joint.name, input.value * degMultiplier);
                inputAngles();
                animToggle.classList.remove('checked');
                li.update();
            });

            li.update();

            sliders[joint.name] = li;

        });

});

document.addEventListener('WebComponentsReady', () => {

    viewer.loadMeshFunc = (path, manager, done) => {

        const ext = path.split(/\./g).pop().toLowerCase();
        switch (ext) {

            case 'gltf':
            case 'glb':
                new GLTFLoader(manager).load(
                    path,
                    result => done(result.scene),
                    null,
                    err => done(null, err),
                );
                break;
            case 'obj':
                new OBJLoader(manager).load(
                    path,
                    result => done(result),
                    null,
                    err => done(null, err),
                );
                break;
            case 'dae':
                new ColladaLoader(manager).load(
                    path,
                    result => done(result.scene),
                    null,
                    err => done(null, err),
                );
                break;
            case 'stl':
                new STLLoader(manager).load(
                    path,
                    result => {
                        const material = new THREE.MeshPhongMaterial();
                        const mesh = new THREE.Mesh(result, material);
                        done(mesh);
                    },
                    null,
                    err => done(null, err),
                );
                break;

        }

    };

    document.querySelector('li[urdf]').dispatchEvent(new Event('click'));

    if (/javascript\/example\/bundle/i.test(window.location)) {
        viewer.package = '../../../urdf';
    }

    // registerDragEvents(viewer, () => {
    //     setColor('#263238');
    //     animToggle.classList.remove('checked');
    //     updateList();
    // });

});

document.addEventListener('jointsDataChanged', function () {
    newCard();
});

window.newCard = function () {
    // let jointAngles = Object.keys(viewer.robot.joints)
    //     .slice(0, 6)
    //     .map(key => {
    //         let angleInDegrees = viewer.robot.joints[key].angle * RAD2DEG;
    //         let formattedAngle = angleInDegrees.toFixed(1);
    //         return formattedAngle.endsWith('.0') ? parseInt(angleInDegrees) : formattedAngle;
    //     });

    let img = capture();

    const cardContainer = document.getElementById('poseCard-container');

    const card = document.createElement('div');
    card.className = 'ui-element';
    card.innerHTML = `
        <div class="angles">
            ${window.jointsData.map(data => Object.entries(data.angles).map(([key, angle]) => `<div>${angle.toFixed(1)}</div>`).join(''))}
        </div>
        <div class="icon">
            <img src="${img}" alt="Icon">
        </div>
        <div class="duration">
            <div class="number">1</div>
            <input value="${window.jointsData[0].time}"></input>
            <button class="duration-btn">s</button>
        </div>
        <button class="close">X</button>
    `;

    card.querySelector('.close').addEventListener('click', (event) => {
        event.stopPropagation();
        cardContainer.removeChild(card);
        const marker = window.progressContainer.querySelectorAll('.progress-marker');
        window.progressContainer.removeChild(marker[parseInt(card.querySelector('.number').textContent) - 1]);

        cardContainer.childNodes.forEach((card, index) => {
            if (card.querySelector('.number')) {
                card.querySelector('.number').innerText = index + 1;
            }
        });
        updateJointsSet();
    });

    card.querySelector('input').addEventListener('click', (event) => {
        event.stopPropagation();
    })

    card.querySelector('.duration-btn').addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.textContent === 's') {
            this.textContent = 'deg/s';
        } else {
            this.textContent = 's';
        }
    });

    card.addEventListener('click', () => {
        cardContainer.childNodes.forEach(child => child.classList.remove('highlighted'));
        card.classList.add('highlighted');

        window.video.currentTime = card.querySelector('input').value;

        for (let i = 0; i < 6; i++)
            viewer.setJointValue(`joint_${i + 1}`, card.querySelector('.angles').innerText.split('\n')[i] * DEG2RAD);
    });

    let i = 0;
    for (; i < cardContainer.childNodes.length; i++) {
        if (window.jointsData[0].time < cardContainer.childNodes[i].querySelector('input').value) {
            cardContainer.insertBefore(card, cardContainer.childNodes[i]);
            break;
        }
    }
    if (i == cardContainer.childNodes.length) {
        cardContainer.appendChild(card);
    }

    cardContainer.childNodes.forEach((card, index) => {
        if (card.querySelector('.number')) {
            card.querySelector('.number').innerText = index + 1;
        }
    });

    new Sortable(cardContainer, {
        ghostClass: 'highlighted', // The class applied to the hovered swap item
        animation: 150,
        filter: 'input'
    });

    updateJointsSet();
}

let jointsDataSet = [];
function updateJointsSet() {
    const cardContainer = document.getElementById('poseCard-container');

    jointsDataSet = Array.from(cardContainer.childNodes).map(card => {
        const time = parseFloat(card.querySelector('input').value);
        const angles = [];

        card.querySelector('.angles').querySelectorAll('div').forEach(angleElement => {
            angles.push(parseFloat(angleElement.textContent));
        });

        return { time, angles };
    });

    console.log(jointsDataSet);
}

// init 2D UI and animation
function updateArmPosition() {
    // const currentTime = video.currentTime;
    const currentTime = (Date.now() - startTime) / 1e3;

    console.log(currentTime);

    for (let i = 0; i < jointsDataSet.length - 1; i++) {
        if (currentTime >= jointsDataSet[i].time && currentTime < jointsDataSet[i + 1].time) {
            const t1 = jointsDataSet[i].time;
            const t2 = jointsDataSet[i + 1].time;
            const a1 = jointsDataSet[i].angles;
            const a2 = jointsDataSet[i + 1].angles;

            const interpolatedAngles = a1.map((angle1, index) => {
                const angle2 = a2[index];
                return angle1 + (angle2 - angle1) * (currentTime - t1) / (t2 - t1);
            });

            Object.keys(viewer.robot.joints).forEach((jointName, index) => {
                viewer.setJointValue(jointName, interpolatedAngles[index] * DEG2RAD);
            });

            break;
        }
    }

    if (currentTime > jointsDataSet[jointsDataSet.length - 1].time) {
        animToggle.classList.toggle('checked');
        window.video.pause();
    }
}

let startTime;

const updateLoop = () => {

    if (animToggle.classList.contains('checked')) {
        updateArmPosition();
    }

    requestAnimationFrame(updateLoop);

};

const updateList = () => {

    document.querySelectorAll('#urdf-options li[urdf]').forEach(el => {

        el.addEventListener('click', e => {

            const urdf = e.target.getAttribute('urdf');
            const color = e.target.getAttribute('color');

            viewer.up = '+Z';
            document.getElementById('up-select').value = viewer.up;
            viewer.urdf = urdf;
            // animToggle.classList.add('checked');
            setColor(color);

        });

    });

};

updateList();

document.addEventListener('WebComponentsReady', () => {

    animToggle.addEventListener('click', () => {
        animToggle.classList.toggle('checked');
        startTime = Date.now() - window.video.currentTime * 1e3;
        if (animToggle.classList.contains('checked'))
            window.video.play();
        else
            window.video.pause();
    });

    // stop the animation if user tried to manipulate the model
    viewer.addEventListener('manipulate-start', e => animToggle.classList.remove('checked'));
    viewer.addEventListener('urdf-processed', e => updateArmPosition());
    updateLoop();
    viewer.camera.position.set(-5.5 / 3, 3.5 / 3, 5.5 / 3);
    // viewer.control
    viewer.noAutoRecenter = true;

});

var addBtn = document.querySelector(".addBtn");
var refreshBtn = document.querySelector('.refreshBtn');
var clearBtn = document.querySelector(".clearBtn");

addBtn.addEventListener('click', function () {
    let jointAngles = Object.keys(viewer.robot.joints)
        .slice(0, 6)
        .map(key => {
            let angleInDegrees = viewer.robot.joints[key].angle * RAD2DEG;
            let formattedAngle = angleInDegrees.toFixed(1);
            return formattedAngle.endsWith('.0') ? parseInt(angleInDegrees) : formattedAngle;
        });

    let img = capture();

    const cardContainer = document.getElementById('poseCard-container');
    const card = document.createElement('div');
    card.className = 'ui-element';
    card.innerHTML = `
        <div class="angles">
            <div>${jointAngles.map(angle => `<div>${angle}</div>`).join('')}</div>
        </div>
        <div class="icon">
            <img src="${img}" alt="Icon">
        </div>
        <div class="duration">
            <div class="number">${cardContainer.childNodes.length + 1}</div>
            <input value="1"></input>
            <button class="duration-btn">s</button>
        </div>
        <button class="close">X</button>
    `;

    card.querySelector('.close').addEventListener('click', (event) => {
        event.stopPropagation();
        cardContainer.removeChild(card);
    });

    card.querySelector('input').addEventListener('click', (event) => {
        event.stopPropagation();
    })

    card.querySelector('.duration-btn').addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.textContent === 's') {
            this.textContent = 'deg/s';
        } else {
            this.textContent = 's';
        }
    });

    card.addEventListener('click', () => {
        cardContainer.childNodes.forEach(child => child.classList.remove('highlighted'));
        card.classList.add('highlighted');

        for (let i = 0; i < 6; i++)
            viewer.setJointValue(`joint_${i + 1}`, card.querySelector('.angles').innerText.split('\n')[i] * DEG2RAD);
    });

    cardContainer.appendChild(card);

    new Sortable(cardContainer, {
        ghostClass: 'highlighted', // The class applied to the hovered swap item
        animation: 150
    });

    updateJointsSet();
});

clearBtn.addEventListener('click', () => {
    const cardContainer = document.getElementById('poseCard-container');
    cardContainer.innerHTML = "";
    animToggle.classList.remove('checked');
    isChangeAngle = false;
})

refreshBtn.addEventListener('click', () => {
    const cardContainer = document.getElementById('poseCard-container');
    cardContainer.childNodes.forEach((card, index) => {
        if (card.querySelector('.number')) {
            card.querySelector('.number').innerText = index + 1;
        }
    });
});

function capture() {
    // const renderer = new THREE.WebGLRenderer();
    viewer.renderer.render(viewer.scene, viewer.camera);
    const img = viewer.renderer.domElement.toDataURL();
    return img;
}

var homeBtn = document.querySelector('.homeBtn');
homeBtn.addEventListener('click', () => {
    var joint = new Array(6).fill(0);
    for (let angle in joint)
        viewer.setJointValue(`joint_${parseInt(angle) + 1}`, joint[angle]);
})