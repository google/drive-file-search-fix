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
require('dotenv').config()
var compression = require('compression')
const cors = require('cors');
const fix=require('./processes/changeaccess.js')
const express = require('express')
const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: '50mb'}));
app.use(express.raw());
app.use(compression({threshold:0}));
const PORT = process.env.PORT || 8080

app.get('/', (req, res)=>{
  const html=`
  <html>
  <h1>Drive File Search Fix Begun</h1>
  </html>`
  console.log('fixing')
  fix.driveQuery()
  console.log('fixing started')
  res.status(200).send(html)
})



app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}...`);
 });

