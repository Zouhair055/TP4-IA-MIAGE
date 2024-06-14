// generate minimal server for api with express
import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from "openai";
// handle form data posted
import multer from 'multer';

// create an instance of OpenAI with the api key
const openai = new OpenAI({
  apiKey: API_KEY,
});

const app = express();
const port = 3001;

// configure CORS support
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// init multer to handle form data
const upload = multer();

// Route GET pour la racine de l'URL
app.get('/', (req, res) => {
  res.send('Serveur API fonctionne correctement'); // ou toute autre réponse que vous souhaitez envoyer
});

// handle post request to /chat, and use multer to get the form data
app.post('/chat', upload.none(), async (req, res) => {
    // get prompt, temperature, and max_tokens from the form data
    const { prompt, temperature, max_tokens } = req.body;
    
    console.log("PROMPT: ", prompt);
    console.log("Temperature: ", temperature);
    console.log("Max Tokens: ", max_tokens);
    
    // send the prompt to the OpenAI API along with temperature and max_tokens
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: parseFloat(temperature), // convert temperature to float
        max_tokens: parseInt(max_tokens), // convert max_tokens to integer
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    // send the response as json
    res.json(response);
});

// start server and listen to port 3001
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
