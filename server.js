const path = require('path');
const express = require('express');
const open = require('open');
const { env } = require('process');

(async function () {

    // create express application
    const app = express();

    // find available port (if not 3000)
    const port = 3000;
    const host = `http://127.0.0.1:${port}`;

    /*-------------------*/

    // endpoint to serve web assets
    app.use('/', express.static(path.join(__dirname, './src/www')));

    app.listen(port, async () => {
        console.log(`Plurdle is running on port ${port}!`);
        if (process.env.CONTEXT && process.env.CONTEXT === "development") {
            await open(`${host}/`); // opens `web/index.html` page
        }
    });
})();