
Built by https://www.blackbox.ai

---

# Wika Beton Dashboard

## Project Overview
The **Wika Beton Dashboard** is an interactive web application designed to manage and analyze the inventory of Wika Beton products. This dashboard provides functionalities such as inventory management, data upload, and visualization using charts, allowing users to efficiently oversee stock levels and make informed decisions based on the data presented.

## Installation
To set up the Wika Beton Dashboard locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd wika-beton-dashboard
   ```

2. **Open the project in your preferred code editor (optional).**

3. **Open the `index.html` file in your web browser to view the application.**
   - You may also want to set up a local server (e.g., using applications like Live Server in VSCode or any other web server tool) to run the application for better testing of dynamic functionalities.

## Usage
1. **Navigate to the main dashboard:**
   - Open `index.html` in your browser. Click on the **"Start"** button to enter the dashboard.

2. **Interact with the dashboard:**
   - **Inventory Management Section:** Use the tabs to switch between different inventory views.
   - **Upload Data Section:** Click on the upload area to select an Excel file for data analysis.

3. **Analyzing Data:**
   - Once a file is uploaded, a preview will be shown. Click **"Analyze Data"** to process the information.

## Features
- **Responsive Design:** The dashboard recognizes various screen sizes for an optimal viewing experience.
- **Inventory Management:** Track stock levels across different categories using interactive tabs.
- **Data Upload:** Upload Excel files to analyze data in the dashboard.
- **Dynamic Charts:** Visual representations of stock data generated using Chart.js for better insight.

## Dependencies
The project utilizes the following dependencies, as specified in the HTML files and that must be included for proper functionality:
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Chart.js:** A JavaScript library for creating charts.
- **xlsx:** A library for parsing Excel files.

## Project Structure
The project consists of the following files:

```
/
|-- index.html         # Main entry point of the application
|-- dashboard.html     # Dashboard view for inventory management
|-- css/
|   |-- style.css      # Custom CSS styles for the dashboard
|-- js/
|   |-- main.js        # JavaScript file handling main functionalities
|   |-- charts.js      # JavaScript file for chart rendering
|   |-- upload.js      # JavaScript file for handling file uploads
```

### Notes
- Ensure you have a modern web browser for the best user experience.
- Modify styles in `css/style.css` as per your requirements to customize the look and feel of the dashboard.

For additional support and contributions, feel free to submit an issue or pull request to the repository.