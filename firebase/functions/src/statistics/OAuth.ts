import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { OAuth2Client } from "google-auth-library";

const CONFIG_CLIENT_ID = functions.config().googleapi.client_id;
const CONFIG_CLIENT_SECRET = functions.config().googleapi.client_secret;

const FUNCTIONS_REDIRECT = `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com/oauthcallback`;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const functionsOauthClient = new OAuth2Client(CONFIG_CLIENT_ID, CONFIG_CLIENT_SECRET, FUNCTIONS_REDIRECT);
// setup for OauthCallback
const DB_TOKEN_PATH = '/api_tokens';
// OAuth token cached locally.
let oauthTokens: any;

// visit the URL for this Function to request tokens
export const authgoogleapi = functions.https.onRequest((_, res) => {
   res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
   res.redirect(functionsOauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
   }));
});

// after you grant access, you will be redirected to the URL for this Function
// this Function stores the tokens to your Firebase database
export const oauthcallback = functions.https.onRequest((req, res) => {
   return new Promise(async (resolve, reject) => {
      res.set('Cache-Control', 'private, max-age=0, s-maxage=0');
      const code = req.query.code as string;
      try {
         const { tokens } = await functionsOauthClient.getToken(code);
         // Now tokens contains an access_token and an optional refresh_token. Save them.
         await admin.database().ref(DB_TOKEN_PATH).set(tokens);
         res.status(200).send('App successfully configured with new Credentials. '
            + 'You can now close this page.')
         return resolve()
      } catch (error) {
         return reject(res.status(400).send(error))
      }
   })
});

// checks if oauthTokens have been loaded into memory, and if not, retrieves them
export async function getAuthorizedClient() {
   if (oauthTokens) {
      return functionsOauthClient;
   }
   const snapshot = await admin.database().ref(DB_TOKEN_PATH).once('value');
   oauthTokens = snapshot.val();
   functionsOauthClient.setCredentials(oauthTokens);
   return functionsOauthClient;
}
