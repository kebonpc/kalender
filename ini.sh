#!/bin/bash

# This script sets up the project structure for the Calendar Generator.
# Run it from inside the /home/su/Desktop/html-css-js/calendar/ directory.

echo "Creating project directories..."
mkdir -p css/partials
mkdir -p js/modules
mkdir -p js/lib
mkdir -p doc

echo "Creating project files..."

# Create empty files using the 'touch' command
touch \
    index.html \
    css/main.css \
    css/partials/_controls.css \
    css/partials/_calendar-preview.css \
    js/main.js \
    js/modules/ui-handler.js \
    js/modules/canvas-drawer.js \
    js/modules/pdf-generator.js \
    js/modules/calendar-converter.js \
    doc/REQUIREMENT.md \
    doc/TODO.md

echo "Populating initial file content..."

# Populate index.html
cat > index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Printable Calendar Generator</title>
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <header>
        <h1>Printable Calendar Generator</h1>
    </header>

    <main id="app">
        <!-- UI Controls and Canvas Previews will be added here in Phase 2 -->
    </main>

    <script src="js/main.js" type="module"></script>
</body>
</html>
EOL

# Populate css/main.css
cat > css/main.css << EOL
/* Imports partials and contains global styles */
@import url('partials/_controls.css');
@import url('partials/_calendar-preview.css');

/* --- Global Styles --- */
:root {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color-scheme: light dark;
}

body {
    margin: 0;
}
EOL

# Add a simple log to main.js
echo 'console.log("Calendar Generator Initialized!");' > js/main.js

echo ""
echo "Project structure created successfully!"
echo "Don't forget to add your 'jspdf.es.min.js' file to the 'js/lib/' directory."
