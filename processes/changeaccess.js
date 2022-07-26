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

const oAuth = require('../utilities/oAuth/oAuth.js')
const { google } = require('googleapis');
const sheets = require('../utilities/sheets/sheets.js')

async function changeAccess(id, owner) {
    const domainlist = JSON.parse(process.env.DOMAIN_LiST)
    const domain = owner.split('@')[1]
    if (!domainlist.includes(domain)) {
        //Owner is not in the domain so we cannot change access.
        console.log('returning', owner)
        return
    }
    console.log('owner', owner)
    const auth = await oAuth.oauthClient(owner) //Imitate the owner
    const drive = google.drive({ version: "v3", auth: auth })

    let permissions = []
    const options = {
        fileId: id,
        pageSize: 100,
        supportsAllDrives: true,
    }
    //getting the list of permissions for the drive file 

    do {
        const res = await drive.permissions.list(options)
        options.pageToken = res.nextPageToken
        if (res.data && res.data.permissions) {
            permissions = [...permissions, ...res.data.permissions]
        }
    } while (options.pageToken)

    //get non-direct permissions. Domain wide and anyone
    permissions = permissions.filter(perm => perm.type == 'domain' || perm.type == 'anyone')

    permissions.forEach(async (perm) => {
        //remove the permission
        await drive.permissions.delete({
            fileId: id,
            permissionId: perm.id,
            supportsAllDrives: true
        })
        //add a new permission which removes the file discovery
        await drive.permissions.create({
            fileId: id,
            moveToNewOwnersRoot: false,
            sendNotificationEmail: false,
            supportsAllDrives: true,
            requestBody: {
                allowFileDiscovery: false,
                domain: proccess.env.DOMAIN,
                role: perm.role,
                type: perm.type,
            }
        })
    })
    return 'ok'
}

const driveQuery = async () => {
    let failures = []
    const auth = await oAuth.oauthClient(process.env.SERVICE_ACCOUNT)
    let count = 0
    const drive = google.drive({ version: "v3", auth: auth })
    const options = {
        corpora: 'domain',
        includeItemsFromAllDrives: true,
        pageSize: 100,
        supportsAllDrives: true,
        //fields: `files(id,name,owners,lastModifyingUser), nextPageToken`
        fields: '*'
    }

    //get all domain explosed searchable files. 
    do {
        let files = await drive.files.list(options)
        options.pageToken = files.data.nextPageToken
        files = files.data.files
        for (let i = 0; i < files.length; i++) {
            count = count + 1
            const file = files[i]
            let owner
            if (file.owners && file.owners.length > 0 && (file.owners[0].emailAddress.indexOf('schools.nyc.gov') > -1 || file.owners[0].emailAddress.indexOf('nycstudents.net') > -1 || file.owners[0].emailAddress.indexOf('doeexternal.nyc') > -1)) {
                owner = file.owners[0].emailAddress
            }
            else if (file && file.lastModifyingUser && file.lastModifyingUser.emailAddress) {
                try {
                    owner = file.lastModifyingUser.emailAddress
                } catch (e) { }
            }
            if (!owner) {
                console.log('no owner', file)
                failures.push([file.name, file.id, null, `https://drive.google.com/open?id=${file.id}`])
                continue
            }
            try {
                let res = await changeAccess(file.id, owner)
                if (!res) {
                    failures.push([file.name, file.id, file.owners[0].emailAddress, `https://drive.google.com/open?id=${file.id}`])
                    console.log('fail') //
                }
            } catch (e) {
                console.log('error', file, e)
                failures.push([file.name, file.id, file.owners[0].emailAddress, `https://drive.google.com/open?id=${file.id}`])
                console.log('fail')
            }
        }
    } while (options.pageToken)

    sheets.sendtosheet([['File Name', 'File ID', 'Owner', 'Link'],...failures])
    console.log('FUNCTION END', count)
}

exports.driveQuery = driveQuery

