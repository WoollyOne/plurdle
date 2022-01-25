import { Request, Response } from "express";

const path = require('path');
const express = require('express');
const openJs = require('open');

// create express application
const app = express();

// find available port (if not 3000)
const port = 3000;
const host = `http://127.0.0.1:${port}`;

/*-------------------*/
// endpoint to serve web assets
app.use('/plurdle', express.static('dist/public'));

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(port, async () => {
    console.log(`Plurdle is running on port ${port}!`);
    if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
        openJs(`${host}/plurdle`); // opens `web/index.html` page
    }
});
