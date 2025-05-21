// The package for the web server
const express = require('express');
// Additional package for logging of HTTP requests/responses
const morgan = require('morgan');
const path = require('path');


let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('myDB', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, fname TEXT, sname TEXT, email TEXT, date TEXT NOT NULL, q1 INTEGER, q2 INTEGER, q3 INTEGER, colour TEXT, comment TEXT)");
    db.run("DELETE FROM User");

    console.log('New database cleared');

     db.run(`INSERT INTO User (id, fname, sname, email, date, q1, q2, q3, colour, comment) 
        VALUES ("1", "su","leong", "email1", "1/24", "2", "2","5","blue","A butterfly landed on me")`,)
         console.log('New database values inserted');
});

const app = express();
// Get port from environment and store in Express.
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


// Include the logging for all requests
app.use(morgan('common'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Tell our application to serve all the files under the `public_html` directory
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public_html'));


app.get('/surveys', (request, respond, next) => {
    respond.render('surveys', { title: 'surveys', surveysCompleted: submissionCount });
});

//default route handle for ejs template
app.get('/', (request, respond, next) => {
    respond.render('index', { title: 'Simple Form' });
});
//now: currentTime.toString() } 

var submissionCount = 0;
let q1Array = [0];
let q2Array = [0];
let q3Array = [0];

app.post('/submitsurvey', (req, res, next) => {
    console.log('Got a POST request');
    console.log(req.body); //moves body fields into terminal
    let userFirstname = req.body.firstname;
    let userLastname = req.body.surname;
    let userEmail = req.body.email;
    let userQ1 = parseInt(req.body.q1radio);
    q1Array.push(userQ1);
    let userQ2 = parseInt(req.body.q2radio);
    q2Array.push(userQ2);
    let userQ3 = parseInt(req.body.q3radio);
    q3Array.push(userQ3);
    let userFavColour = req.body.butterflyColour;
    let userComments = req.body.comments;

    userQ1 = 0;
    for (let i of q1Array) {
        userQ1 += i;
    }
    userQ1 = userQ1 / q1Array.length;

    userQ2 = 0;
    for (let i of q2Array) {
        userQ2 += i;
    }
    userQ2 = userQ2 / q1Array.length;

    userQ3 = 0;
    for (let i of q3Array) {
        userQ3 += i;
    }
    userQ3 = userQ3 / q1Array.length;

    let currentTime = new Date();
    currentTime = currentTime.toString();
    submissionCount++;
    let now = new Date();
    console.log( now.toISOString() );

    /* //EXAMPLE DB INSERT
    cur.execute(
    'INSERT INTO MyAccount (fullName, username, password, school, phoneNumber, yearGroup) VALUES (?, ?, ?, ?, ?, ?)',
    (input_fullName, input_username, input_password, input_school, input_phoneNumber, input_yearGroup),)
    */
    //Add items into the DB
    db.serialize(function () {
        db.run(`INSERT INTO User (fname, sname, email, date, q1, q2, q3, colour, comment) VALUES (?,?,?,?,?,?,?,?,?)`,
            (userFirstname, userLastname, userEmail, now, userQ1, userQ2, userQ3, userFavColour, userComments),)
             console.log('Survey complete: Database Updated');


        db.each('SELECT * FROM Comments', function (err, row) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log(`[all] Name: ${row.fname}, Surname: ${row.sname}`);
        });
    });
    db.close();
    //db / displayDB.js


    res.render('result',
        {
            title: 'Results',
            SurveyCompleted: currentTime,
            firstname: userFirstname,
            surname: userLastname,
            email: userEmail,
            FavouriteButterflyColour: userFavColour,
            Comment: userComments,

            Count: submissionCount,
            Q1: userQ1,
            Q2: userQ2,
            Q3: userQ3,
        });
    //send back a response
    res.send('Thank you for submitting the form data');
});

app.get('/users', function (req, res) {
    let html = '';
    //HTML code to display multiple tables with DB data
        html += '<body><div class="border border-primary rounded mb-3 p-2">';

        // Retrieve data from table User on the server 
        // and display it in a web page table structure
        db.all('SELECT * FROM User', function (err, rows) {
            if (err) {
                return console.error(err.message);
            }
            if (rows.length === 0) {
                console.log("Array is empty!")

                html += '<header><div class="container-fluid bg-success-subtle">';
                html += ' <div class="col-sm-8 mx-auto text-center py-4">';
                html += '<h1 class="display-6">dKin Butterfly Club</h1>';
                html += ' <p class="lead">Informative web page on Butterflies from around the world</p> </div></div></header>';
               
                html += '<main> <div class="container-fluid p-3 py-4"><h1>Survey List</h1>';
                html += '<p>The complete list of <em>dKin Butterflies</em> surveys is shown in the table below. Accessing this data stored in a persistent database is performed on the server. <br> ';
                html += 'There is a total of <%= surveysCompleted%> surveys completed.</p>';

                html += '<body>';
            } else {
                rows.forEach(function (row) {
                    html += '<div class="border border-primary rounded mb-3 p-2"><p class="text-secondary mb-1">';
                    html += '<small>' + row.id + row.userFirstname + row.userLastname + '</small></p>';
                    html += '<div class="row"><div class="col-sm-6">';
                    html += '<td>' + '</td>';
                    html += '<p class="text-primary mb-0">Comment</p><p><em>' + row.userComments + '</em></p></div>';
                    html += '<div class="col-sm-2"><p class="text-primary mb-0">Colour</p><div class="badge text-wrap" style="background-color:' + row.userFavColour + '">' + row.userFavColour +'</div></div>';
                    html += '<div class="col-sm-4"><p class="text-primary mb-0">Results</p><div class="progress" role="progressbar" aria-label="Success example"aria-valuenow="' + row.userQ1;
                    html += '" aria-valuemin="1" aria-valuemax="5">Q1<div class="progress-bar text-bg-success" style="width:60%">' + row.userQ1 + '</div></div>';
                    html += '<div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="' + row.userQ2 + '" aria-valuemin="1" aria-valuemax="5">Q2<div class="progress-bar text-bg-success" style="width:20%">' + row.userQ2 + '</div></div>';
                    html += '<div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="' + row.userQ3 + '" aria-valuemin="1" aria-valuemax="5"> Q3<div class="progress-bar text-bg-success" style="width:100%">' + row.userQ2 + '</div></div>';
                    html += '</div></div><p class="text-secondary mb-1"><small>' + row.currentTime + '</small></p></div>';
                });
            }
            html += '</body></div></main>';
            
         console.log('New database Outputed in Surveys');
        res.send(html);

    });
});

// ********************************************
// *** Other route/request handlers go here ***
//handle the 404 file not found error
app.use((request, response) => {
    response.status(404);
    response.render('404', { title: '404', message: '404 - Not Found', url: request.url });
});

// handle the 500 system error
app.use((error, request, response, next) => {
    let errorStatus = error.status || 500;
    response.status(errorStatus);
    response.send(`ERROR(${errorStatus}): ${error.toString()}`);
});

// ********************************************
// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
    // When the application starts, print to the console that our app is
    // running at http://localhost:3000. Print another message indicating
    // how to shut the server down.
    console.log(`Web server running at: http://localhost:${port}`);
    console.log(`Type Ctrl+C to shut down the web server`);
})