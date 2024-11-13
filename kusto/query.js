const { DefaultAzureCredential } = require("@azure/identity");
const { KustoClient } = require("@azure/data-explorer");

const clusterUri = "https://<YourClusterName>.<region>.kusto.windows.net";
const databaseName = "<YourDatabaseName>";
const query = "Your KQL query here"; // Replace with your actual KQL query

const credential = new DefaultAzureCredential();
const client = new KustoClient({
    endpoint: clusterUri,
    database: databaseName,
    credential: credential
});

async function runQuery() {
    try {
        const results = await client.execute(query);
        return results.tables[0].rows;
    } catch (err) {
        console.error("Error running query:", err);
    }
}

runQuery().then(rows => {
    console.log("Query results:", rows);
    // Here, you can include your D3.js code to process and visualize the data
    renderBoxplots(rows);
});

function renderBoxplots(data) {
    const processedData = data.map(d => ({
        name: d.Name,  // Adjust based on the actual data structure
        min: d.Min,
        p25: d.P25,
        p50: d.P50,
        avg: d.Avg,
        p75: d.P75,
        p90: d.P90,
        max: d.Max
    }));

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
        .domain([0, d3.max(processedData, d => d.max) * 1.1])  // Add a 10% buffer to the max value
        .range([height, 0]);

    const x = d3.scaleBand()
        .domain(processedData.map(d => d.name))
        .range([0, width])
        .padding(0.4);

    // Draw the boxplots
    processedData.forEach((d, i) => {
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

        // Draw median line in blue
        g.append("line").attr("class", "median")
            .attr("x1", 0)
            .attr("x2", x.bandwidth())
            .attr("y1", y(d.p50))
            .attr("y2", y(d.p50))
            .style("stroke", "blue");

        // Draw azure color box for mean and average
        g.append("rect")
            .attr("x", x.bandwidth() / 4)
            .attr("width", x.bandwidth() / 2)
            .attr("y", y(d.avg))
            .attr("height", y(d.p25) - y(d.p75))
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
        .reduce((max, node) => Math.max(max, node.getBBox().width), 0
