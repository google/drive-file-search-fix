Copyright 2022 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



Create a project in GCP under your organization. 
Navigate to the project and create a service account at https://console.cloud.google.com/iam-admin/serviceaccounts?project=<your projectid>

Once the service account is created click the account and select KEYS from the top tab. Use the ADD KEY button to add a JSON key. Download the file and place it in the Credentials folder. 

Add the Client ID and the Drive scope to the domainwide delegation setting on the admin console. You can ise the below link replacing the clientID with the id from the GCP Service Account

https://admin.google.com/ac/owl/domainwidedelegation?clientScopeToAdd=https://www.googleapis.com/auth/drive&clientIdToAdd=<CLIENT ID>&overwriteClientId=true


Adjust the .env file to include the following:
```
SERVICE_ACCOUNT=<workspace service account email> 
``` 
This email is used to do the search as a user would for anything exposed in the domain.

```
DOMAIN_LIST=["domain.com","email.com"]
```
This list of domains represent your primary and secondary tenant domains. If a file is owned by an account not of one of these domains it cannot be adjusted. 

```
DOMAIN=<domain.com>
```
This is your primary domain and is used to share back to the domain with searchability turned off. 

```
FAILURE_SHEET_ID=<ID of a Spreadsheet>
```
This is the id of a sheet you would like the failures sent to. It must be editable by the service account you used above.

```
SHEET=Logs
```
This is the sheet name in the failure sheet you want to send the logs to. 

```
CREDENTIALS=<credentials filename>
```
This is the file name of the credentials used. Credentials are created in the IAM section as a service account. The service account and necesary scopes are added to the domain making this a domain wide authentication service. This allows each file owner to be imitated and the permissions changed using their account credentials. 


Deploy to App Engine Standard
```
gcloud app deploy
```