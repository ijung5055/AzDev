// Sample data with longer names and a higher max value
const data = [
    { name: "Production-to-Production", min: 25, p25: 30, p50: 35, avg: 40, p75: 60, p90: 72,  max: 104 },
    { name: "Production-to-OutForRepair", min: 3, p25: 7, p50: 9, avg: 12, p75: 55, p90: 59, max: 60 },
    { name: "Maintenance-to-Production", min: 6, p25: 11, p50: 14, avg: 16, p75: 18, p90: 21, max: 33 },
    { name: "Production-to-Maintenance", min: 4, p25: 8, p50: 12, avg: 13, p75: 16, p90: 19, max: 42 },
    { name: "Production-to-Scrap", min: 5, p25: 9, p50: 13, avg: 15, p75: 17, p90: 20,  max: 50 }
];

// Dimensions and margins
const margin = { top: 20, right: 30, bottom: 100, left: 40 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#boxplots")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create scales
const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.max) * 1.1])  // Add a 10% buffer to the max value
    .range([height, 0]);

const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.4);

// Draw the boxplots
data.forEach((d, i) => {
    const g = svg.append("g")
        .attr("transform", `translate(${x(d.name)},0)`);

    // Draw min and max whiskers with horizontal bars swapped with p90
    g.append("line").attr("class", "whisker")
        .attr("x1", x.bandwidth() / 8)
        .attr("x2", 7 * x.bandwidth() / 8)
        .attr("y1", y(d.min))
        .attr("y2", y(d.min));

    g.append("line").attr("class", "whisker")
        .attr("x1", x.bandwidth() / 8)
        .attr("x2", 7 * x.bandwidth() / 8)
        .attr("y1", y(d.max))
        .attr("y2", y(d.max));

    g.append("line").attr("class", "whisker")
        .attr("x1", x.bandwidth() / 2)
        .attr("x2", x.bandwidth() / 2)
        .attr("y1", y(d.min))
        .attr("y2", y(d.max));

    // Draw transparent box
    g.append("rect").attr("class", "box")
        .attr("x", 0)
        .attr("width", x.bandwidth())
        .attr("y", y(d.p75))
        .attr("height", y(d.p25) - y(d.p75))
        .style("fill", "azure");

    // Draw median line in blue
    g.append("line").attr("class", "median")
        .attr("x1", 0)
        .attr("x2", x.bandwidth())
        .attr("y1", y(d.p50))
        .attr("y2", y(d.p50))
        .style("stroke", "blue");

    // Draw mean and average box with azure color
    g.append("rect")
        .attr("x", x.bandwidth() / 4)
        .attr("width", x.bandwidth() / 2)
        .attr("y", y(d.avg))
        .attr("height", 2)
        .style("fill", "azure");

    // Draw mean circle
    g.append("circle").attr("class", "mean")
        .attr("cx", x.bandwidth() / 2)
        .attr("cy", y(d.avg))
        .attr("r", 5);

    // Draw p90 line with original min/max size
    g.append("line").attr("class", "whisker")
        .attr("x1", x.bandwidth() / 4)
        .attr("x2", 3 * x.bandwidth() / 4)
        .attr("y1", y(d.p90))
        .attr("y2", y(d.p90));
});

// Add axes
svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

const xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// Rotate x-axis labels
xAxis.selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

// Adjust SVG height based on longest label
const longestLabel = xAxis.selectAll("text").nodes()
    .reduce((max, node) => Math.max(max, node.getBBox().width), 0);

d3.select("#boxplots svg")
    .attr("height", height + margin.top + margin.bottom + longestLabel - 40); // Adjusting the height dynamically

