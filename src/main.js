document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.slide');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        renderSlide(index);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    Promise.all([
        d3.csv('../data/processed/california_fire_cleaned.csv'),
        d3.csv('../data/processed/california_wildfire_damage_cleaned.csv'),
        d3.json('../data/California_Counties.geojson')
    ]).then(function(data) {
        const fireIncidents = data[0];
        const wildfireDamage = data[1];
        const caCounties = data[2];
        
        // Parse data
        fireIncidents.forEach(d => {
            d.ArchiveYear = +d.ArchiveYear;
            d.AcresBurned = +d.AcresBurned;
            d.Latitude = +d.Latitude;
            d.Longitude = +d.Longitude;
        });

        wildfireDamage.forEach(d => {
            d.Date = new Date(d.Date);
            d.Homes_Destroyed = +d.Homes_Destroyed;
            d.Fatalities = +d.Fatalities;
            d.Estimated_Financial_Loss_Million_USD = +d.Estimated_Financial_Loss_Million_USD;
        });

        window.renderSlide = function(slideIndex) {
            switch(slideIndex) {
                case 0:
                    renderSlide1(fireIncidents);
                    break;
                case 1:
                    renderSlide2(fireIncidents, caCounties);
                    break;
                case 2:
                    renderSlide3(wildfireDamage);
                    break;
                case 3:
                    renderSlide4(wildfireDamage);
                    break;
            }
        }

        showSlide(currentSlide);

    }).catch(function(error) {
        console.log(error);
    });

    function renderSlide1(data) {
        const chartContainer = d3.select('#chart1');
        chartContainer.html(""); // Clear previous chart

        const yearlyData = d3.nest()
            .key(d => d.ArchiveYear)
            .rollup(v => ({ 
                total_acres: d3.sum(v, d => d.AcresBurned), 
                incident_count: v.length 
            }))
            .entries(data)
            .map(d => ({ 
                year: +d.key, 
                total_acres: d.value.total_acres, 
                incident_count: d.value.incident_count 
            })).sort((a, b) => a.year - b.year);

        const margin = {top: 20, right: 30, bottom: 40, left: 90},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = chartContainer.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(yearlyData.map(d => d.year))
            .padding(0.2);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .domain([0, d3.max(yearlyData, d => d.total_acres)])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll(".bar")
            .data(yearlyData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.total_acres))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.total_acres))
            .on("mouseover", function(d) {
                d3.select(this).style("fill", "brown");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Acres Burned: ${Math.ceil(d.total_acres)}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", "steelblue");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        const y2 = d3.scaleLinear()
            .domain([0, d3.max(yearlyData, d => d.incident_count)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.year) + x.bandwidth() / 2)
            .y(d => y2(d.incident_count));

        svg.append("path")
            .datum(yearlyData)
            .attr("class", "line")
            .attr("d", line)
            .style('stroke', 'orange');

        svg.selectAll(".dot")
            .data(yearlyData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.year) + x.bandwidth() / 2)
            .attr("cy", d => y2(d.incident_count))
            .attr("r", 5)
            .style("fill", "orange")
            .on("mouseover", function(d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Incident Count: ${d.incident_count}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        svg.append("g")
            .attr("transform", `translate(${width}, 0)`)
            .call(d3.axisRight(y2));

        const legendData = [
            { name: 'Acres Burned', color: 'steelblue' },
            { name: 'Incident Count', color: 'orange' }
        ];

        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(legendData)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 23)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => d.color);

        legend.append("text")
            .attr("x", width - 25)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d.name);

        d3.select('#annotation1').text('This chart displays the total acres burned (blue bars) and the number of fire incidents (orange line) per year. There is a clear escalating trend in the number of acres burned over the years.');
    }
    
    function renderSlide2(fireData, mapData) {
        const chartContainer = d3.select('#chart2');
        chartContainer.html("");

        const width = 800;
        const height = 500;

        const projection = d3.geoMercator().fitSize([width, height], mapData);
        const path = d3.geoPath().projection(projection);

        const svg = chartContainer.append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("path")
            .data(mapData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#ccc")
            .attr("stroke", "#fff");

        const years = [...new Set(fireData.map(d => d.ArchiveYear))].sort();
        const slider = d3.select('#year-slider');
        const yearValue = d3.select('#year-value');

        slider
            .attr('min', d3.min(years))
            .attr('max', d3.max(years))
            .attr('value', d3.min(years));

        yearValue.text(d3.min(years));

        function updateMap(year) {
            const filteredData = fireData.filter(d => d.ArchiveYear == year && d.Longitude && d.Latitude);

            const circles = svg.selectAll(".fire-dot")
                .data(filteredData, d => d.id); 

            circles.exit().remove();

            circles.enter().append("circle")
                .attr("class", "fire-dot")
                .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
                .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
                .attr("r", d => Math.sqrt(d.AcresBurned) / 40)
                .style("fill", "red")
                .style("opacity", 0.5);
            
            yearValue.text(year);
            d3.select('#annotation2').text(`This map shows the geographic concentration of wildfires across California for the year ${year}. The size of the red circles corresponds to the number of acres burned.`);
        }

        slider.on('input', function() {
            updateMap(this.value);
        });

        updateMap(d3.min(years));
    }

    function renderSlide3(data) {
        const chartContainer = d3.select('#chart3');
        chartContainer.html("");

        const yearlyData = d3.nest()
            .key(d => d.Date.getFullYear())
            .rollup(v => ({
                homes_destroyed: d3.sum(v, d => d.Homes_Destroyed),
                financial_loss: d3.sum(v, d => d.Estimated_Financial_Loss_Million_USD)
            }))
            .entries(data)
            .map(d => ({ 
                year: +d.key, 
                ...d.value
            })).sort((a, b) => a.year - b.year);

        const margin = {top: 20, right: 30, bottom: 40, left: 90},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = chartContainer.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const years = yearlyData.map(d => d.year);
        const subgroups = ['homes_destroyed', 'financial_loss'];

        const x0 = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding([0.2]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        const x1 = d3.scaleBand()
            .domain(subgroups)
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(yearlyData, d => d3.max(subgroups, key => d[key]))])
            .nice()
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#e41a1c','#4daf4a']);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.append("g")
            .selectAll("g")
            .data(yearlyData)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x0(d.year)},0)`)
            .selectAll("rect")
            .data(d => subgroups.map(key => ({key: key, value: d[key]})))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key))
            .on("mouseover", function(d) {
                d3.select(this).style("fill", d3.rgb(color(d.key)).darker(1));
                tooltip.transition().duration(200).style("opacity", .9);
                const formattedKey = d.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                tooltip.html(`${formattedKey}: ${Math.ceil(d.value)}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", color(d.key));
                tooltip.transition().duration(500).style("opacity", 0);
            });

        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups.slice().reverse())
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));

        d3.select('#annotation3').text('This chart shows the devastating impacts of wildfires, including homes destroyed and estimated financial loss.');
    }

    function renderSlide4(data) {
        const chartContainer = d3.select('#chart4');
        chartContainer.html("");

        const causeData = d3.nest()
            .key(d => d.Cause)
            .rollup(v => v.length)
            .entries(data);

        const width = 450;
        const height = 450;
        const margin = 40;

        const radius = Math.min(width, height) / 2 - margin;

        const svg = chartContainer.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(causeData.map(d => d.key))
            .range(d3.schemeDark2);

        const pie = d3.pie()
            .value(d => d.value);

        const data_ready = pie(causeData);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        svg.selectAll('slices')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.key))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);

        svg.selectAll('slices')
            .data(data_ready)
            .enter()
            .append('text')
            .text(d => `${d.data.key} (${(d.data.value / d3.sum(causeData, c => c.value) * 100).toFixed(2)}%)`)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .style("fill", "white");

        d3.select('#annotation4').text('This pie chart shows the distribution of wildfire causes. As you can see, the largest portion of wildfires are caused by human activity.');
    }
});