// lightSettings.js

import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { WidgetModule } from './widgetModule.js';

export class LightModule {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.lightHelpers = [];
        this.widgetModule = new WidgetModule('ui');
    }

    createLightHelper(light) {
        if (light.isDirectionalLight) {
            return new THREE.DirectionalLightHelper(light, 1);
        } else if (light.isPointLight) {
            return new THREE.PointLightHelper(light, 1);
        } else if (light.isSpotLight) {
            return new THREE.SpotLightHelper(light);
        }
    }

    addLight() {
        const lightType = document.getElementById('lightTypeSelector').value;
        let light;
        if (lightType === 'DirectionalLight') {
            light = new THREE.DirectionalLight(0xffffff, 1);
        } else if (lightType === 'PointLight') {
            light = new THREE.PointLight(0xffffff, 1, 100);
        } else if (lightType === 'SpotLight') {
            light = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 6);
        }
        light.position.set(5, 5, 5);
        this.scene.add(light);
        this.lights.push(light);

        const lightHelper = this.createLightHelper(light);
        this.lightHelpers.push(lightHelper);
        this.scene.add(lightHelper);

        const controls = this.getLightControls(light);
        this.widgetModule.createWidget('Light Settings', controls, `light-widget-${this.lights.length - 1}`);
    }

    getLightControls(light) {
        const controls = [
            {
                type: 'color',
                value: light.color.getStyle(),
                label: 'Color',
                onChange: event => light.color.set(event.target.value)
            },
            {
                type: 'range',
                value: light.intensity,
                min: 0,
                max: 2,
                step: 0.1,
                label: 'Intensity',
                onChange: event => light.intensity = event.target.value,
                onWheel: event => this.handleWheel(event, light, 'intensity')
            },
            {
                type: 'range',
                value: light.position.x,
                min: -10,
                max: 10,
                step: 0.1,
                label: 'Position X',
                onChange: event => {
                    light.position.x = event.target.value;
                    this.updateLightHelper(light);
                },
                onWheel: event => this.handleWheel(event, light.position, 'x')
            },
            {
                type: 'range',
                value: light.position.y,
                min: -10,
                max: 10,
                step: 0.1,
                label: 'Position Y',
                onChange: event => {
                    light.position.y = event.target.value;
                    this.updateLightHelper(light);
                },
                onWheel: event => this.handleWheel(event, light.position, 'y')
            },
            {
                type: 'range',
                value: light.position.z,
                min: -10,
                max: 10,
                step: 0.1,
                label: 'Position Z',
                onChange: event => {
                    light.position.z = event.target.value;
                    this.updateLightHelper(light);
                },
                onWheel: event => this.handleWheel(event, light.position, 'z')
            },
            {
                type: 'button',
                label: 'Toggle Light Helper',
                onClick: () => this.toggleLightHelper(light)
            },
            {
                type: 'button',
                label: 'Toggle Light',
                onClick: () => this.toggleLight(light)
            },
            {
                type: 'button',
                label: 'Delete Light',
                onClick: () => {
                    this.removeLight(light);
                }
            }
        ];

        if (light.isPointLight || light.isSpotLight) {
            controls.push({
                type: 'range',
                value: light.distance,
                min: 0,
                max: 100,
                step: 1,
                label: 'Distance',
                onChange: event => light.distance = event.target.value,
                onWheel: event => this.handleWheel(event, light, 'distance')
            });
        }

        if (light.isSpotLight) {
            controls.push({
                type: 'range',
                value: light.angle,
                min: 0,
                max: Math.PI / 2,
                step: 0.01,
                label: 'Angle',
                onChange: event => light.angle = event.target.value,
                onWheel: event => this.handleWheel(event, light, 'angle')
            });
        }

        return controls;
    }

    toggleLightHelper(light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            const lightHelper = this.lightHelpers[index];
            lightHelper.visible = !lightHelper.visible;
        }
    }

    toggleLight(light) {
        light.visible = !light.visible;
    }

    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            this.scene.remove(light);
            this.scene.remove(this.lightHelpers[index]);
            this.lights.splice(index, 1);
            this.lightHelpers.splice(index, 1);
            const widgetId = `light-widget-${index}`;
            this.widgetModule.removeWidget(widgetId);
            adjustSidebarHeight(document.getElementById('sidebar-right'));
        }
    }

    updateLightHelper(light) {
        const lightHelper = this.lightHelpers[this.lights.indexOf(light)];
        if (lightHelper) {
            lightHelper.update();
        }
    }

    updateHelpers() {
        this.lightHelpers.forEach(helper => helper.update());
    }

    handleWheel(event, target, property) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        if (target[property] !== undefined) {
            target[property] = Math.min(Math.max(target[property] + delta, event.target.min), event.target.max);
        }
        event.target.value = target[property];
        if (property.startsWith('position')) {
            this.updateLightHelper(target);
        }
    }
}

// Додавання обробника події wheel до створених елементів input type="range"
WidgetModule.prototype.createControl = function(control) {
    let controlElement;
    if (control.type === 'color') {
        controlElement = document.createElement('input');
        controlElement.type = 'color';
        controlElement.value = control.value;
        controlElement.addEventListener('input', control.onChange);
    } else if (control.type === 'range') {
        controlElement = document.createElement('input');
        controlElement.type = 'range';
        controlElement.min = control.min;
        controlElement.max = control.max;
        controlElement.step = control.step;
        controlElement.value = control.value;
        controlElement.addEventListener('input', control.onChange);
        controlElement.addEventListener('wheel', control.onWheel);
    } else if (control.type === 'file') {
        controlElement = document.createElement('input');
        controlElement.type = 'file';
        controlElement.addEventListener('change', control.onChange);
    } else if (control.type === 'button') {
        controlElement = document.createElement('button');
        controlElement.textContent = control.label;
        controlElement.addEventListener('click', control.onClick);
    }

    const controlWrapper = document.createElement('div');
    controlWrapper.className = 'control-wrapper';
    controlWrapper.appendChild(controlElement);

    if (control.label) {
        const label = document.createElement('label');
        label.textContent = control.label;
        controlWrapper.insertBefore(label, controlElement);
    }

    return controlWrapper;
};
