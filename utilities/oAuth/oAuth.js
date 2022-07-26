// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
var jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs');
const NodeCache = require('node-cache');
const authCache = new NodeCache({ stdTTL: 100, checkperiod: 3600 });

const credentials=require(`../../credentials/${process.env.CREDENTIALS}`) 
const scopes =[
 'https://www.googleapis.com/auth/drive',
]

exports.oauthClient = async function (user) {
    const authtoken = authCache.get(`token_${user}`);
    if (authtoken) {
        return authtoken
    }
    const {
        clientsecret: clientSecret,
        client_id: clientId,
    } = credentials;

    const { google } = require('googleapis');
    const oAuth2Client = new google.auth.OAuth2(
        clientId, clientSecret, 'https://www.google.com'
    );
  
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: credentials.client_id,
        sub: user,
        scope: scopes.join(" "),
        aud: url,
        exp: (now + 3600),
        iat: now,
    };
    const privateKey = credentials.private_key;
    const token = jwt.sign(claim, privateKey, { algorithm: 'RS256' });
    const params = {
        method: 'POST',
        'Content-Type': 'application/x-www-form-urlencoded',
        body: JSON.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
        })
    };

    const response = await fetch(claim.aud, params);
    const json = await response.json();
    oAuth2Client.setCredentials(json);  
    authCache.set(`token_${user}`, oAuth2Client, oAuth2Client.expires_in);

    return oAuth2Client;
};
