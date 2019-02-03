const scale = 50;

function elt(name, attrs, ...children) {
    let dom = document.createElement(name);

    Object.entries(attrs).map(([k, v]) => dom.setAttribute(k, v));

    children.forEach(child => dom.appendChild(child));

    return dom;
}

function drawGrid(level) {
    return elt('table', {
        class: 'background',
        style: `width: ${ level.width * scale }px`
    }, ...level.rows.map(row =>
            elt('tr', { style: `height: ${scale}px`},
                ...row.map(ch =>
                    elt('td', { class: ch}))
            )
    ));
}

function drawActors(actors) {
    return elt('div', {}, ...actors.map(a => {
        const rect = elt('div', { class: `actor ${a.type}` });
        
        rect.style.width = `${a.size.x * scale}px`;
        rect.style.height = `${a.size.y * scale}px`;
        rect.style.left = `${a.pos.x * scale}px`;
        rect.style.top = `${a.pos.y * scale}px`;

        return rect;
    }));
}

class DOMDisplay {
    constructor(parent, level) {
        this.dom = elt('div', { class: 'game' }, drawGrid(level));
        this.actorLayer = null;
        
        parent.appendChild(this.dom);
    }

    clear() { this.dom.remove(); }
}

DOMDisplay.prototype.syncState = function (state) {
    if (this.actorLayer) this.actorLayer.remove();

    this.actorLayer = drawActors(state.actors);
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
};

DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
    const width = this.dom.clientWidth;
    const height = this.dom.clientHeight;
    const margin = width / 3;

    const left = this.dom.scrollLeft,
        right = left + width;
    const top = this.dom.scrollTop,
        bottom = top + height;
    
    let player = state.player;
    let center = player.pos.plus(player.size.times(0.5)).times(scale);

    if (center.x < left + margin) {
        this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
        this.dom.scrollLeft = center.x - (width - margin);
    }

    if (center.y < top + margin) {
        this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
        this.dom.scrollTop = center.y - (height - margin)
    }
};