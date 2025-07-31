# wildfire_ca

# California Wildfire Crisis: Interactive Slideshow Visualization

## Overview
This project presents an interactive narrative visualization in the form of a web-based slideshow, focusing on California's wildfire crisis from 2013 to 2025. It aims to visualize
escalating trends, devastating impacts, and underlying causes of wildfires in California, providing insights into this critical environmental and social issue.
 
## Features

The slideshow consists of four scenes, each highlighting a specific information of the wildfire crisis:

1. Escalating Trends though Years: Visualizes the total acres burned and the frequency of fire incidents over time, showcasing the increasing scale of wildfires. The interactive checkboxs allowing users to see only Acres Burned or Incident Count data.
2. Geographic Concentration (2013-2025): Displays a map of California, illustrating the spatial distribution and concentration of fire incidents across the state. The year slider can make user to visualize the the number of acres burned in specific year.
3. Devastating Impacts from the Wildfires: Details the severe consequences of wildfires, including the number of homes destroyed and estimated financial losses. The dropdown menu give user option to choose which impact they are interested and interactive tooltips provide exact figures on hover.

## Data Sources

The visualization utilizes two primary datasets, pre-processed and available in the `data/processed/` directory:

1. `california_fire_cleaned.csv`: Contains detailed information about fire incidents, including acres burned fatalities, and incident dates. https://www.kaggle.com/datasets/ananthu017/california-wildfire-incidents-20132020

2. `california_wildfire_damage_cleaned.csv`: Provides data on the impacts of wildfires, such as homes destroyed, fatalities, and estimated financial losses. https://www.kaggle.com/datasets/vivekattri/california-wildfire-damage-2014-feb2025

3. `California_Counties.geojson`: Geographic data for California county boundaries. https://lab.data.ca.gov/dataset/california-counties1

## How to Run

Deployed at Github Page: https://haoxinzhuang.github.io/

