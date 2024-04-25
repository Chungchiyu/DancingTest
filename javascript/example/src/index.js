/* globals */
import * as THREE from 'three';
import { registerDragEvents } from './dragAndDrop.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import URDFManipulator from '../../src/urdf-manipulator-element.js';
import * as math from 'mathjs';
import { LoadingManager } from 'three';
import URDFLoader from '../../src/URDFLoader.js';

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
let sliders = {};

// Global Functions
const setColor = color => {

    document.body.style.backgroundColor = color;
    viewer.highlightColor = '#' + (new THREE.Color(0xffffff)).lerp(new THREE.Color(color), 0.35).getHexString();

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

    const j = document.querySelector(`li[joint-name="${ e.detail }"]`);
    if (j) j.setAttribute('robot-hovered', true);

});

viewer.addEventListener('joint-mouseout', e => {

    const j = document.querySelector(`li[joint-name="${ e.detail }"]`);
    if (j) j.removeAttribute('robot-hovered');

});

let originalNoAutoRecenter;
viewer.addEventListener('manipulate-start', e => {

    const j = document.querySelector(`li[joint-name="${ e.detail }"]`);
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
            <span title="${ joint.name }">${ joint.name }</span>
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
                    li.update = () => {};
                    input.remove();
                    slider.remove();

            }

            slider.addEventListener('input', () => {
                viewer.setJointValue(joint.name, slider.value);
                animToggle.classList.remove('checked');
                li.update();
            });

            input.addEventListener('change', () => {
                // const degMultiplier = radiansToggle.classList.contains('checked') ? 1.0 : RAD2DEG;
                const degMultiplier = RAD2DEG;
                viewer.setJointValue(joint.name, input.value * degMultiplier);
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

    registerDragEvents(viewer, () => {
        setColor('#263238');
        animToggle.classList.remove('checked');
        updateList();
    });

});

let j = 0, k = 0;
let t_now, t_prev = 0;
var frame;
// init 2D UI and animation
const updateAngles = () => {

    if (!viewer.setJointValue) return;
    var ul = document.querySelector(".appendList");
    if (ul.children.length < 2) return;
    // reset everything to 0 first
    // const resetJointValues = viewer.angles;
    // for (const name in resetJointValues) resetJointValues[name] = 0;
    // viewer.setJointValues(resetJointValues);

    // animate the legs
    t_now = Date.now();
    let frameRate = 24.0;
    
    if (t_now - t_prev > 1000.0/frameRate) { // set frame rate to 20Hz
        console.log("dt:"+(t_now - t_prev));
        
        if (k == 0) {
            var j_set_1 = [];
            ul.childNodes[j+1].querySelector('b').innerText.split(',').forEach( ele => j_set_1.push(+ele));
            var j_set_2 = [];
            ul.childNodes[j+2].querySelector('b').innerText.split(',').forEach( ele => j_set_2.push(+ele));
            var speed = parseFloat(ul.childNodes[j+1].querySelector('input').value);
            if (speed == '') return;
            var isTime = ul.childNodes[j+1].querySelector('button').innerText == 's';
            frame = frameGenerator(j_set_1, j_set_2, speed, isTime, frameRate);
        }
        
        for (let i = 0; i < 6; i++) {
            viewer.setJointValue(`joint_${ i+1 }`, frame[k][i]*DEG2RAD);
        }
        if (k < frame.length-1) k++;
        else {
            k = 0; j++;
            if (j > ul.children.length-2) j = 0;
        }
        t_prev = t_now;
    }
};

function frameGenerator(pos1, pos2, value, isTime, fr) {
    var frame = new Array(6);
    var dP_dt;
    var dP = math.subtract(pos2, pos1);
    var max_steps = 2;
    if (isTime)
        dP_dt = math.dotDivide(dP, (value * fr));
    else {
        dP_dt = new Array(6);
        for (let i = 0; i < 6; i++) dP_dt[i] = (dP[i] > 0 ? 1 : -1) * value / fr;
    }

    for (let i = 0; i < 6; i++) {
        if (dP[i] != 0) frame[i] = math.range(pos1[i], pos2[i], dP_dt[i]).toArray();
        else frame[i] = new Array(max_steps).fill(pos1[i]);
        if (frame[i].length > max_steps) max_steps = frame[i].length;
        // console.log(frame[i]);
    }

    for (let i = 0; i < 6; i++) {
        if (frame[i].length < max_steps) {
            frame[i] = math.reshape([frame[i], 
                new Array(max_steps - frame[i].length).fill(frame[i][frame[i].length-1])], [max_steps]);
        }
    }
    return math.transpose(frame);
}

const updateLoop = () => {

    if (animToggle.classList.contains('checked')) {
        updateAngles();
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

    animToggle.addEventListener('click', () => animToggle.classList.toggle('checked'));

    // stop the animation if user tried to manipulate the model
    viewer.addEventListener('manipulate-start', e => animToggle.classList.remove('checked'));
    viewer.addEventListener('urdf-processed', e => updateAngles());
    updateLoop();
    viewer.camera.position.set(-5.5/3, 3.5/3, 5.5/3);
    viewer.noAutoRecenter = true;

});

var addBtn = document.querySelector(".addBtn");
var refreshBtn = document.querySelector('.refreshBtn');
var speed_value = [0];

addBtn.addEventListener('click', function(){
    var ul = document.querySelector(".appendList");
    var li = document.createElement("li");
    var rmvBtn = document.createElement("button");

    var input = document.createElement('input');
    input.type = 'number';
    input.addEventListener('change', () => {
        j = 0; k = 0;
    });

    var speedBtn = document.createElement('button');
    speedBtn.innerText = 's';

    speedBtn.addEventListener('click', () => {
        if (speedBtn.innerText == 's') speedBtn.innerText = 'deg/s';
        else speedBtn.innerText = 's';
        j = 0; k = 0;
    });

    var joint_angle = [viewer.robot.joints.joint_1.angle,
                        viewer.robot.joints.joint_2.angle,
                        viewer.robot.joints.joint_3.angle,
                        viewer.robot.joints.joint_4.angle,
                        viewer.robot.joints.joint_5.angle,
                        viewer.robot.joints.joint_6.angle]

    li.appendChild(document.createElement('dt'));
    li.querySelector('dt').appendChild(document.createTextNode(ul.children.length+1+':'));
    li.appendChild(document.createElement('b'));
    for (var angle in joint_angle) {
        li.querySelector('b').appendChild(document.createTextNode(math.round(joint_angle[angle]*RAD2DEG,1)+','));
    }
    li.querySelector('b').innerText = li.querySelector('b').innerText.slice(0, -1);
    li.appendChild(input);
    li.appendChild(speedBtn);
    li.appendChild(rmvBtn);
    ul.appendChild(li);    

    rmvBtn.innerHTML = '<i class="fa fa-remove"></i>';
    rmvBtn.addEventListener('click', () => {
        ul.removeChild(li);
        updateJointSet(ul);
        if (ul.children.length < 2) {
            animToggle.classList.remove('checked');
        }
    });
});

const updateJointSet = (ul) => {
    for (let i=0; i < ul.children.length; i++) {
        ul.childNodes[i+1].querySelector('dt').innerText = i+1 + ':';
    }
};

refreshBtn.addEventListener('click', () => {
    j = 0;
    k = 0;
});