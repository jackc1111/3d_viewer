// backgroundModule.js

import { WidgetModule } from './widgetModule.js';
import { MapModule } from './mapModule.js';

class BackgroundLayer {
    constructor(type, color, texture, opacity = 1, id) {
        this.type = type;
        this.color = color;
        this.texture = texture;
        this.opacity = opacity;
        this.id = id;
    }

    updateBackground() {
        const backgroundElement = document.getElementById(this.id);
        if (this.type === 'Color') {
            backgroundElement.style.backgroundColor = this.color;
            backgroundElement.style.backgroundImage = 'none';
        } else if (this.type === 'Texture' && this.texture) {
            backgroundElement.style.backgroundImage = `url(${this.texture})`;
            backgroundElement.style.backgroundColor = 'transparent';
        } else if (this.type === 'Map') {
            backgroundElement.style.backgroundColor = 'transparent';
            backgroundElement.style.backgroundImage = 'none';
        }
        backgroundElement.style.opacity = this.opacity;
    }
}

export class BackgroundModule {
    constructor() {
        this.widgetModule = new WidgetModule('backgroundsContainer');
        this.backgroundLayers = [];
        this.backgroundContainer = document.getElementById('backgroundContainer');
        this.mapModule = new MapModule();
        this.currentMapId = null;
    }

    addBackground(type) {
        const id = `background-${this.backgroundLayers.length}`;
        const backgroundElement = document.createElement('div');
        backgroundElement.className = 'background-layer';
        backgroundElement.id = id;
        this.backgroundContainer.appendChild(backgroundElement);

        const background = new BackgroundLayer(type, '#000000', null, 1, id);
        this.backgroundLayers.push(background);
        background.updateBackground();

        if (type === 'Map') {
            this.currentMapId = id;
            setTimeout(() => {
                this.mapModule.loadMap(id);
            }, 0);
            background.updateBackground = () => this.mapModule.updateMapOpacity(background.id, background.opacity);
            background.updateBackground();
        }

        const controls = this.getBackgroundControls(background);
        this.widgetModule.createWidget('Background Settings', controls, `background-widget-${this.backgroundLayers.length - 1}`);
    }

    getBackgroundControls(background) {
        const controls = [];

        if (background.type === 'Color') {
            controls.push({
                type: 'color',
                value: background.color,
                label: 'Color',
                onChange: event => {
                    background.color = event.target.value;
                    background.updateBackground();
                }
            });
        } else if (background.type === 'Texture') {
            controls.push({
                type: 'file',
                label: 'Texture',
                onChange: event => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = e => {
                            background.texture = e.target.result;
                            background.updateBackground();
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }

        if (background.type === 'Map') {
            controls.push({
                type: 'range',
                value: background.opacity,
                min: 0,
                max: 1,
                step: 0.01,
                label: 'Opacity',
                onChange: event => {
                    background.opacity = event.target.value;
                    this.mapModule.updateMapOpacity(background.id, background.opacity);
                },
                onWheel: event => this.handleWheel(event, background, 'opacity')
            });
        } else {
            controls.push({
                type: 'range',
                value: background.opacity,
                min: 0,
                max: 1,
                step: 0.01,
                label: 'Opacity',
                onChange: event => {
                    background.opacity = event.target.value;
                    background.updateBackground();
                },
                onWheel: event => this.handleWheel(event, background, 'opacity')
            });
        }

        controls.push({
            type: 'button',
            label: 'Delete Background',
            onClick: () => {
                this.removeBackground(background);
            }
        });

        return controls;
    }

    removeBackground(background) {
        const index = this.backgroundLayers.indexOf(background);
        if (index > -1) {
            this.backgroundLayers.splice(index, 1);
            const widgetId = `background-widget-${index}`;
            this.widgetModule.removeWidget(widgetId);
            const backgroundElement = document.getElementById(background.id);
            if (backgroundElement) {
                backgroundElement.remove();
            }
            if (background.type === 'Map' && background.id === this.currentMapId) {
                this.mapModule.hideMap();
                this.currentMapId = null;
            }
        }
    }

    handleWheel(event, target, property) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.01 : -0.01;
        if (target[property] !== undefined) {
            target[property] = Math.min(Math.max(target[property] + delta, event.target.min), event.target.max);
        }
        event.target.value = target[property];
        if (property === 'opacity' && target.type === 'Map') {
            this.mapModule.updateMapOpacity(target.id, target[property]);
        } else {
            target.updateBackground();
        }
    }
}
