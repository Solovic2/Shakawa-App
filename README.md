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

> [!NOTE]
> Before running the project make sure to replace all (128.36.1.71) to localhost or with your url.

## To Run This Project
1. First Go to your database and create a schema and put its username and password and url into .env file in Backend Directory Then Run :
     ```
      npx prisma generate
      npx prisma migrate dev
    ```
2. Then Run :
   -  Go To Backend Directory then run:
    ```
      npm start
    ```
   - Go To Frontend Directory then run:
    ```
    npm start
    ```
