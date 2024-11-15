async function fetchData() {
    const response = await fetch("/data");
    const data = await response.json();
    return data;
}

// Helper function to group data by a specific key
function groupData(data, key) {
    return data.reduce((acc, item) => {
        acc[item[key]] = (acc[item[key]] || 0) + 1;
        return acc;
    }, {});
}

// Helper function to group data by hour and user agent for the stacked bar chart
function groupDataByHour(data) {
    return data.reduce((acc, item) => {
        const hour = new Date(item.udate).getHours();
        const agent = item.uagent;

        if (!acc[hour]) {
            acc[hour] = {};
        }
        acc[hour][agent] = (acc[hour][agent] || 0) + 1;
        return acc;
    }, {});
}

async function renderCharts() {
    const data = await fetchData();

    // Group data for each chart
    const geoData = groupData(data, "GEO");
    const referData = groupData(data, "refer");

    // Group data by hour for the User Agent stacked chart
    const userAgentDataByHour = groupDataByHour(data);
    const hours = Object.keys(userAgentDataByHour).sort();
    const uniqueUserAgents = Array.from(new Set(data.map(item => item.uagent)));

    // Geolocation Chart as Bar Chart
    new Chart(document.getElementById("geoChart"), {
        type: "bar",
        data: {
            labels: Object.keys(geoData),
            datasets: [{
                label: "Number of Users",
                data: Object.values(geoData),
                backgroundColor: "#36A2EB",
                borderColor: "#007BFF",
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Country"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "User Count"
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Users: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });

    // User Agent Stacked Bar Chart by Hour
    const datasets = uniqueUserAgents.map((agent, index) => ({
        label: agent,
        data: hours.map(hour => userAgentDataByHour[hour][agent] || 0),
        backgroundColor: `hsl(${index * 30}, 70%, 60%)` // Color variation for each agent
    }));

    new Chart(document.getElementById("userAgentChart"), {
        type: "bar",
        data: {
            labels: hours.map(hour => `${hour}:00`), // Hour labels for x-axis
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Hour of Day"
                    },
                    stacked: true
                },
                y: {
                    title: {
                        display: true,
                        text: "User Count"
                    },
                    beginAtZero: true,
                    stacked: true
                }
            },
            plugins: {
                legend: {
                    position: "top"
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });

    // Referral Chart as Doughnut Chart
    new Chart(document.getElementById("referChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(referData),
            datasets: [{
                data: Object.values(referData),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

renderCharts();
