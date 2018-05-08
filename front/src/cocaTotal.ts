import { Data } from '.';
import * as d3_selection from 'd3-selection';
import * as d3_scale from 'd3-scale';
import * as d3_ease from 'd3-ease';
import * as d3_axis from 'd3-axis';
import * as d3_transition from 'd3-transition';

const createCircle = (
    svg: d3_selection.Selection<any, any, any, any>,
    d: Data,
    x: d3_scale.ScaleLinear<number, number>,
    y: d3_scale.ScaleLinear<number, number>,
    i: number,
) => {
    const transition = d3_transition
        .transition()
        .ease(d3_ease.easeElasticOut)
        .duration(800)
        .delay(i * 3 + 100)
        .attr('cy', y(d.y));

    svg
        .append('circle')
        .attr('cx', x(d.x))
        .attr('cy', y(0))
        .attr('r', 5)
        .attr('fill', 'red')
        .transition()
        .ease(d3_ease.easeElasticOut)
        .duration(800)
        .delay(i * 3 + 100)
        .attr('cy', y(d.y));
};

export default (data: Data[]) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1280 - margin.left - margin.right;
    const height = 720 - margin.top - margin.bottom;

    let sum = 0;
    const cocas = data.map(d => {
        sum += d.y;
        return { x: d.x, y: sum } as Data;
    });

    const x = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...cocas.map(d => d.x)) + 5])
        .range([0, width]);
    const y = d3_scale
        .scaleLinear()
        .domain([0, Math.max(...cocas.map(d => d.y)) + 1])
        .range([height, 0]);

    const svg = d3_selection
        .select('#Cocas')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    cocas.forEach((d, i) => {
        createCircle(svg, d, x, y, i);
    });

    svg
        .append('g')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(d3_axis.axisBottom(x))
        .transition()
        .ease(d3_ease.easeElasticOut)
        .duration(2000)
        .delay(100)
        .attr('font-size', 15);
    svg
        .append('g')
        .call(d3_axis.axisLeft(y))
        .transition()
        .ease(d3_ease.easeElasticOut)
        .duration(2000)
        .delay(100)
        .attr('font-size', 15);
};
