import * as d3_dsv from 'd3-dsv';
import cocaPerDay from './cocaPerDay';
import RAW_DATA from './../data/coca.csv';
import cocaTotal from './cocaTotal';

export class Data {
    public x: number;
    public y: number;
}

const loadData = () => {
    return d3_dsv.csvParse(RAW_DATA).map(d => {
        return { x: +d['1'], y: +d['2'] } as Data;
    });
};

try {
    const data = loadData();
    cocaPerDay(data);
    cocaTotal(data);
} catch (error) {
    console.log(error);
}
