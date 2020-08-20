'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3000;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/api_rest_blog', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('conexión db correcta');

        // Crear server
        app.listen(port, ()=>{
            console.log('Server on port' + port);
        })

    })
    .catch(error => console.log(error));

