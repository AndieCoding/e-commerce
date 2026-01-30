export class ProductChart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chart = null;
    }
    static get observedAttributes() {
        return ['type', 'product', 'labels', 'data', 'colors'];
    }
    parseAttr(value) {
        try { return JSON.parse(value); }
        catch (e) { return value; }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[name] = (name === 'data' || name === 'colors')
            ? this.parseAttr(newValue)
            : newValue;
        if (this.isConnected) this.renderChart();
    }
    set labels(value) {
        this._labels = value;
        this.renderChart();
    }
    get labels() {
        return this._labels || [];
    }
    set data(value) {
        this._data = value;
        this.renderChart();
    }
    get data() {
        return this._data || [];
    }
    set colors(value) {
        this._colors = value;
        this.renderChart();
    }
    get colors() {
        return this._colors || [];
    }

    connectedCallback() {
        // Estilos básicos para que el canvas se vea
        this.shadowRoot.innerHTML = `
            <style>:host { display: block; width: 100%; }</style>
            <canvas id="chart"></canvas>
        `;
        this.renderChart();
    }

    disconnectedCallback() {
        if (this.chart) this.chart.destroy();
    }

    renderChart() {
        const canvas = this.shadowRoot.getElementById('chart');
        if (!canvas || !this.data) return;
        if (this.chart) this.chart.destroy();

        this.chart = new Chart(canvas, {
            type: this.type || 'bar',
            data: {
                labels: this._labels,
                datasets: [{
                    label: `${this.product || ''}`,
                    data: this.data || [],
                    backgroundColor: this.colors || '#316767',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: typeof window.commonScales !== 'undefined' ? window.commonScales : {}
            }
        });
    }
}
customElements.define('product-chart', ProductChart);