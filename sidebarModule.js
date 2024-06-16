// sidebarModule.js

import { WidgetModule } from './widgetModule.js';

export function initializeSidebars() {
    const sidebarLeft = {
        element: document.getElementById('sidebar'),
        button: document.getElementById('controlsButton'),
        resizeHandle: document.getElementById('resize-handle'),
        collapsedClass: 'collapsed',
        resizeHandleHiddenClass: 'hidden',
        prevHeight: ''
    };

    const sidebarRight = {
        element: document.getElementById('sidebar-right'),
        button: document.getElementById('scenesButton'),
        resizeHandle: document.getElementById('resize-handle-right'),
        collapsedClass: 'collapsed',
        resizeHandleHiddenClass: 'hidden',
        prevHeight: ''
    };

    const sidebars = [sidebarLeft, sidebarRight];
    let isDragging = false, dragStartX, dragStartY, isResizing = false, startY, startHeight, currentMouseY;

    sidebarLeft.button.addEventListener('click', () => toggleSidebar(sidebarLeft));
    sidebarRight.button.addEventListener('click', () => toggleSidebar(sidebarRight));

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'c':
                toggleSidebar(sidebarLeft);
                break;
            case 'v':
                toggleView();
                break;
            case 'r':
                toggleRotation();
                break;
            default:
                break;
        }
    });

    sidebars.forEach(sidebar => {
        sidebar.element.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !e.target.closest('.widget-content') && e.target.id !== sidebar.resizeHandle.id && !document.getElementById('map-container').contains(e.target)) {
                isDragging = true;
                sidebar.element.classList.add('dragging');
                dragStartX = e.clientX - sidebar.element.offsetLeft;
                dragStartY = e.clientY - sidebar.element.offsetTop;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });

        sidebar.resizeHandle.addEventListener('mousedown', (e) => {
            if (!sidebar.element.classList.contains(sidebar.collapsedClass)) {
                isResizing = true;
                startY = e.clientY;
                startHeight = parseInt(document.defaultView.getComputedStyle(sidebar.element).height, 10);
                sidebar.element.classList.add('no-select');
                document.addEventListener('mousemove', onMouseResize);
                document.addEventListener('mouseup', onMouseUpResize);
                currentMouseY = startY;
                requestAnimationFrame(() => resizeLoop(sidebar));
            }
        });
    });

    function toggleSidebar(sidebar) {
        if (!isResizing) {
            if (sidebar.element.classList.contains(sidebar.collapsedClass)) {
                sidebar.element.classList.remove(sidebar.collapsedClass);
                adjustSidebarHeight(sidebar);
                sidebar.resizeHandle.classList.remove(sidebar.resizeHandleHiddenClass);
            } else {
                sidebar.prevHeight = sidebar.element.style.height;
                sidebar.element.classList.add(sidebar.collapsedClass);
                sidebar.element.style.height = '80px';
                sidebar.resizeHandle.classList.add(sidebar.resizeHandleHiddenClass);
            }
        }
    }

    function adjustSidebarHeight(sidebar) {
        const contentHeight = sidebar.element.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight - 80; // Adjust as needed

        if (sidebar.element.offsetHeight < maxHeight) {
            sidebar.element.style.height = `${Math.min(contentHeight, maxHeight)}px`;
        }
    }

    function onMouseMove(e) {
        if (isDragging) {
            const newX = e.clientX - dragStartX;
            const newY = e.clientY - dragStartY;
            const sidebar = isDraggingLeftSidebar(e) ? sidebarLeft : sidebarRight;

            if (newX >= 0 && newX + sidebar.element.offsetWidth <= window.innerWidth) {
                sidebar.element.style.left = `${newX}px`;
            }
            if (newY >= 0 && newY + sidebar.element.offsetHeight <= window.innerHeight) {
                sidebar.element.style.top = `${newY}px`;
            }
        }
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            const sidebar = isDraggingLeftSidebar() ? sidebarLeft : sidebarRight;
            sidebar.element.classList.remove('dragging');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    function onMouseResize(e) {
        if (isResizing) {
            currentMouseY = e.clientY;
        }
    }

    function onMouseUpResize() {
        if (isResizing) {
            isResizing = false;
            const sidebar = isResizingLeftSidebar() ? sidebarLeft : sidebarRight;
            sidebar.element.classList.remove('no-select');
            document.removeEventListener('mousemove', onMouseResize);
            document.removeEventListener('mouseup', onMouseUpResize);
        }
    }

    function resizeLoop(sidebar) {
        if (isResizing) {
            const newHeight = startHeight + (currentMouseY - startY);
            if (newHeight >= 200) {
                sidebar.element.style.height = `${newHeight}px`;
            }
            requestAnimationFrame(() => resizeLoop(sidebar));
        }
    }

    function isDraggingLeftSidebar() {
        return sidebarLeft.element.classList.contains('dragging');
    }

    function isResizingLeftSidebar() {
        return sidebarLeft.element.classList.contains('no-select');
    }
}
