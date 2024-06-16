// widgetModule.js

export class WidgetModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    createWidget(title, controls, widgetId) {
        const widget = document.createElement('div');
        widget.className = 'widget';
        widget.id = widgetId;

        const header = document.createElement('div');
        header.className = 'widget-header';
        header.textContent = title;
        widget.appendChild(header);

        const content = document.createElement('div');
        content.className = 'widget-content';
        widget.appendChild(content);

        controls.forEach(control => {
            const controlElement = this.createControl(control);
            content.appendChild(controlElement);
        });

        header.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            this.updateContainerHeight();
        });

        this.container.appendChild(widget);
        this.updateContainerHeight();

        const observer = new MutationObserver(() => {
            this.updateContainerHeight();
        });

        observer.observe(widget, { childList: true });

        const currentHeight = this.container.offsetHeight;
        const contentHeight = this.container.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight - 80;

        if (currentHeight < maxHeight) {
            this.container.style.height = `${Math.min(contentHeight, maxHeight)}px`;
        }
    }

    updateContainerHeight() {
        const contentHeight = this.container.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight - 80;

        if (this.container.children.length === 0) {
            this.container.style.height = '0px';
        } else if (this.container.offsetHeight < maxHeight) {
            this.container.style.height = `${Math.min(contentHeight, maxHeight)}px`;
        }
    }

    removeWidget(widgetId) {
        const widget = document.getElementById(widgetId);
        if (widget) {
            this.container.removeChild(widget);
            this.updateContainerHeight();
        }
    }

    createControl(control) {
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
    }
}
