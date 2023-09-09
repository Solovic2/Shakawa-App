# Shakawa-App
Shakawa describes something called a “Shakwa” which is the voice note or text that a customer writes.
This application was created to manage this "Shakwa" and listen or read it and send it to a department (group) to respond to this custom shakwa.
# How This Project Work ?
It dependes on reading files from OS and display it to Manager/Admin users and this users can redirect this file to any group users which have "User" role, this users should see only the attached files to his group and listen or read this file and respond to this file.
There are a websocket to maintain real time notifications between backend and frontend when displaing the pages
# What Is Used In This Project ? 
- ReactJs
* NodeJs
+ Postgres/MySql or any database prisma supports
* Prisma
- Websocket

## Configuration
1. Before running the project make sure to replace all localhost with your url.
2. Make sure to edit the **.env** file in backend with the path of the folder containing the files :\
      ` FOLDER_PATH = "/path/to/folder/which/have/files" `
3. Go to your database (postgresql, mysql, mongodb) and create a schema and put its username and password and url into .env file in Backend Directory :
     `DATABASE_URL="mysql://username:password@localhost:port/schemaName`\
     > [!NOTE]
     > Make sure your provider in schema.prisma file is the same as what is written in `DATABASE_URL` :
      ```
      datasource db {
            provider = "mysql"
            url      = env("DATABASE_URL")
          }     
      ```
## To Run This Project
1. Go To Backend Directory then run:
    ```
      npm install
      npx prisma generate
      npx prisma migrate dev
      node prisma/seed.js
      npm start
    ```
2. Go To Frontend Directory then run:
    ```
    npm install
    npm start
    ```
