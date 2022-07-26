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
const oAuth = require('../oAuth/oAuth.js')
const { google } = require('googleapis');
require('dotenv').config()

const user = process.env.SERVICE_ACCOUNT

const sendtosheet = async (vals) => {
const token =await oAuth.oauthClient(user)
  const id = process.env.FAILURE_SHEET_ID
  for (let i = 0; i < vals[0].length; i++) {
    if (vals[0][i] == null || vals[0][i] == undefined) {
      vals[0][i] = 'null'
    }
  }
  let col = numberToLetters(vals[0].length)
  const sheet = google.sheets({ version: 'v4', auth: token })

  let values = await sheet.spreadsheets.values.get({
    majorDimension: 'ROWS',
    range: process.env.SHEET,
    spreadsheetId: id,
  })
  if(values.length>=vals.length){
    await sheet.spreadsheets.values.clear({
      range: process.env.SHEET,
      spreadsheetId: id,
      requestBody: {},
    })
  }
  let obj = {
    spreadsheetId: id,
    range: `${process.env.SHEET}!A:${col}`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: vals,
    }
  }
  return await sheet.spreadsheets.values.append(obj)
}

function numberToLetters(num) {
  let letters = ''
  while (num >= 0) {
      letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters
      num = Math.floor(num / 26) - 1
  }
  return letters
}

exports.sendtosheet = sendtosheet

