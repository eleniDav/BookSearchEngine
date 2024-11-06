const express = require('express');
const cors = require('cors');
const app = express();

//the port at which the server will run - must be different from the frontend port (by default react applications run at port 3000)
const port = 5000;

app.use(cors({
    //to allow http requests from this origin too (the react app)
    origin : "http://localhost:3000"
}));

//handling api requests - middleware
app.get('/api/data', (req, res) => {
    const data = [
        { id : 1, name : 'John' },
        { id : 2, name : 'Jane' }
    ];
    res.json(data);
});

//starting our api
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})