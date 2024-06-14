import express from 'express';
import { API_KEY } from './config.js';
import OpenAI from 'openai';
import multer from 'multer';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const app = express();
const port = 3001;

// Initialisation d'OpenAI
const openai = new OpenAI({ apiKey: API_KEY });

// Middleware pour parser les données JSON et les données de formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Middleware pour gérer les données multipart/form-data
const upload = multer();

// Endpoint pour le chat avec GPT-3.5
const gptModel = 'gpt-3.5-turbo';
app.post('/chat', upload.none(), async (req, res) => {
  const { prompt } = req.body;
  console.log('PROMPT: ', prompt);

  try {
    const response = await openai.chat.completions.create({
      model: gptModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_tokens: 50,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Error in chat endpoint' });
  }
});

// Endpoint pour générer une image avec DALL-E
app.post('/image', upload.none(), async (req, res) => {
  const { prompt } = req.body;
  console.log('IMAGE PROMPT: ', prompt);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: '256x256',
    });

    res.json(response);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

// Endpoint pour la synthèse vocale avec Text-to-Speech
const textToSpeechClient = new TextToSpeechClient();

app.post('/speech', async (req, res) => {
  const { prompt } = req.body;
  console.log('SPEECH PROMPT: ', prompt);

  try {
    const [response] = await textToSpeechClient.synthesizeSpeech({
      input: { text: prompt },
      voice: { languageCode: 'fr-FR', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    res.setHeader('Content-Type', 'audio/mpeg'); // Définition du type de contenu
    res.send(response.audioContent); // Envoi du fichier audio généré comme réponse
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Error generating speech' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
