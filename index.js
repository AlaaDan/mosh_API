const config = require('config')
const Joi = require('joi');
const helmet = require('helmet')
const morgan = require('morgan')
const logger = require('./logger')
const auth = require('./auth')
const express  = require('express');
const app = express();
const PORT  = 3000

//Configuration
console.log("Application name: " + config.get('name'))
console.log("Mail server: " + config.get('mail.host'))
console.log("Mail Password: " + config.get('mail.password'))



// console.log(`NODE_ENV: ${process.env.NODE_ENV}`)  
// console.log(`app: ${app.get('env')}`)

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(helmet())
//app.use(morgan('tiny')) // It will impact your request pipe line, don't use in production.

if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log("Morgan enabled")
}
app.use(logger)
app.use(auth)

const courses = [
    {id: 1, name: "Node.js from zero to hero"},
    {id: 2, name: "Python for noobs"},
    {id: 3, name: "New era"}
];

app.get('/', (req, res)=>{
    res.send("<h1>Welcome to my API website</h1>")
});

app.get('/api/courses', (req, res)=>{
    res.send(courses)
});

app.post('/api/courses', (req, res)=>{
    const { error } = validateCourse(req.body)
    if (error) return res.status(400).send(error.details[0].message)
  

    // If you have a rule for adding a new course like if there isn't name of the course or the length of the name is less than 3
    // we use the usual way.   
    //if (!req.body.name || req.body.name.length < 3){
    //400 Bad request
    //res.status(400).send("Name is required and should be minimum 3 characters")
    //return;
    //}

    const  course = {
        id: courses.length +1,
        name: req.body.name
    };
    courses.push(course)
    res.send(course)
})

app.put('/api/courses/:id', (req, res)=>{
    // Look up the course
    // If not exisiting, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("The course with the given ID was not found")
    
    //const result = validateCourse(req.body) we wont need this if we will use the object destructoring
    const { error } = validateCourse(req.body) // this is instead to get result.error

    // Validate
    // If invalid,  return 400 - Bad request 
    
    if (error) return res.status(400).send(error.details[0].message)

    //Update course 
    course.name = req.body.name
    // Return the updated course
    res.send(course)
})


app.delete('/api/courses/:id', (req, res)=>{
    //Look up the couse 
    //Not existing, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("The course with the given ID was not found")

    // Delete
    const index = courses.indexOf(course)
    courses.splice(index, 1)

    //Return the same course
    res.send(course)
})


function validateCourse(couse){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return  schema.validate(couse)
}

app.listen(PORT)