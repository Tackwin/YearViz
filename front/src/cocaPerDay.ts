import { Data } from '.';
import * as d3_selection from 'd3-selection';
import * as d3_scale from 'd3-scale';
import * as d3_ease from 'd3-ease';
import * as d3_shape from 'd3-shape';
import * as d3_axis from 'd3-axis';
import * as d3_transition from 'd3-transition';
import percentile from './percentile';

const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const width = 1280 - margin.left - margin.right;
const height = 720 - margin.top - margin.bottom;
const SMOOTH_OVER = 20;

export default (data: Data[]) => {
    const xBar = d3_scale
        .scaleBand()
        .domain(data.map(d => d.x.toString()))
        .range([0, width])
        .paddingOuter(0.1)
        .paddingInner(0.1);
    const xLine = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...data.map(d => d.x))])
        .range([0, width]);
    const y = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...data.map(d => d.y))])
        .range([height, 0]);

    const svg = d3_selection
        .select('#Cocas_par_jour')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('id', 'main_g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    svg.append('g').attr('id', 'histo');

    updateData(data);

    document.getElementById('Jour_label').onclick = () => {
        const days = data.map(d => d);
        updateData(data);
    };
    document.getElementById('Semaine_label').onclick = () => {
        const weeks = [];
        for (let i = 0; i < data.length; i += 7) {
            const d = new Data();
            d.x = i / 7;
            d.y = 0;
            for (let j = i; j < data.length && j < i + 7; j += 1) {
                d.y += data[j].y;
            }
            weeks.push(d);
        }

        updateData(weeks);
    };
};

const updateData = (data: Data[]) => {
    let sum = 0;
    let summingOver = 0;
    for (let i = 0; i + 1 < SMOOTH_OVER / 2; i += 1) {
        sum += data[i].y;
        summingOver += 1;
    }
    const smoothedData = data.map((d, i) => {
        if (i + SMOOTH_OVER / 2 < data.length) {
            sum += data[i + SMOOTH_OVER / 2].y;
            summingOver += 1;
        }
        if (i > SMOOTH_OVER / 2) {
            sum -= data[i - SMOOTH_OVER / 2].y;
            summingOver -= 1;
        }
        return {
            x: d.x,
            y: sum / summingOver,
        } as Data;
    });

    const percentile95 = data.map((d, i) => {
        return {
            x: d.x,
            y: percentile(data.slice(0, i + 1).map(d => d.y), 95),
        };
    });
    const percentile05 = data.map((d, i) => {
        return {
            x: d.x,
            y: percentile(data.slice(0, i + 1).map(d => d.y), 5),
        };
    });

    const xLine = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...data.map(d => d.x))])
        .range([0, width]);
    const y = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...data.map(d => d.y))])
        .range([height, 0]);

    const svg = d3_selection.select('#main_g');
    const line = d3_shape
        .line<Data>()
        .x(d => xLine(d.x))
        .y(d => y(d.y));

    updateHisto(data);

    svg.select('#percentile95').remove();
    svg
        .append('path')
        .attr('id', 'percentile95')
        .datum(percentile95)
        .attr('class', 'line')
        .attr('fill', 'none')
        .style('stroke', '#f40000AA')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .style('stroke-width', 5)
        .attr('d', line);

    svg.select('#smoothedData').remove();
    svg
        .append('path')
        .attr('id', 'smoothedData')
        .datum(smoothedData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .style('stroke', '#f40000FF')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .style('stroke-width', 5)
        .attr('d', line);

    svg.select('#percentile05').remove();
    const path = svg
        .append('path')
        .attr('id', 'percentile05')
        .datum(percentile05)
        .attr('class', 'line')
        .attr('fill', 'none')
        .style('stroke', '#f4000055')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .style('stroke-width', 5)
        .attr('d', line);

    // Add the X Axis
    svg.select('#x-axis').remove();
    svg
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3_axis.axisBottom(xLine));

    // Add the Y0 Axis
    svg.select('#y-axis').remove();
    svg
        .append('g')
        .attr('id', 'y-axis')
        .attr('class', 'axisSteelBlue')
        .call(d3_axis.axisLeft(y));
};

const updateHisto = (data: Data[]) => {
    const xBar = d3_scale
        .scaleBand()
        .domain(data.map(d => d.x.toString()))
        .range([0, width])
        .paddingOuter(0.1)
        .paddingInner(0.1);
    const y = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...data.map(d => d.y))])
        .range([height, 0]);

    const svg = d3_selection.select('#main_g');

    svg.select('#histo').remove();
    svg
        .append('g')
        .attr('id', 'histo')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .style('stroke', 'none')
        .style('fill', '#aa6666')
        .attr('x', d => xBar(d.x.toString()))
        .attr('width', d => xBar.bandwidth())
        .attr('y', d => y(0))
        .attr('height', d => 0)
        .each(function(d, i) {
            const height_transition = d3_transition
                .transition()
                .duration(1000 + Math.random() * 500)
                .delay(Math.random() * 500)
                .ease(d3_ease.easeElasticOut);
            d3_selection
                .select(this)
                .transition(height_transition)
                .attr('height', y(0) - y(d.y))
                .attr('y', y(d.y));
        });
};
