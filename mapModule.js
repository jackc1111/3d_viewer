import * as L from 'https://unpkg.com/leaflet/dist/leaflet-src.esm.js';
import { WidgetModule } from './widgetModule.js';

export class MapModule {
    constructor() {
        this.maps = {};
        this.opacity = 1;
        this.widgetModule = new WidgetModule('ui');
    }

    loadMap(id) {
        const mapContainer = document.getElementById(id);
        mapContainer.style.display = 'block';

        const map = L.map(id, { zoomControl: false, dragging: false, attributionControl: false }).setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.maps[id] = map;
        this.updateMapState(id);

        this.createMapWidget(id);
    }

    hideMap() {
        if (this.currentMapId && this.maps[this.currentMapId]) {
            const mapContainer = document.getElementById(this.currentMapId);
            mapContainer.style.display = 'none';
            delete this.maps[this.currentMapId];
        }
    }

    updateMapOpacity(id, opacity) {
        const mapContainer = document.getElementById(id);
        if (mapContainer) {
            mapContainer.style.opacity = opacity;
        }
    }

    updateMapState(id) {
        const mapContainer = document.getElementById(id);
        if (this.maps[id]) {
            mapContainer.style.zIndex = '0';
        } else {
            mapContainer.style.zIndex = '-1';
        }
    }

    setMapCenter(lat, lng) {
        if (this.currentMapId && this.maps[this.currentMapId]) {
            this.maps[this.currentMapId].setView([lat, lng], this.maps[this.currentMapId].getZoom());
        }
    }

    createMapWidget(id) {
        this.widgetModule.createWidget('Map Settings', [], `map-widget-${id}`);
    }
}
