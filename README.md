<h1 align="center">
    <img src="https://ik.imagekit.io/h4s3kgnkax/logo_vGtLirxTS.png">
</h1>

<h4 align="center"> 
	LaunchBase Bootcamp 🚀
</h4>
<p align="center">
 
 <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/raonemota/foodfy_db?color=%2304D361">
  
 <img alt="Repository size" src="https://img.shields.io/github/repo-size/raonemota/foodfy_db">

  <a href="https://github.com/raonemota/foodfy_db/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/raonemota/foodfy_db">
  </a>
  
  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">
</p>

<div align="center">
  <img src="http://i.picasion.com/pic90/867803cf7204fdbb9f41584fc1a71747.gif"/>
</div>

# Goal

**Foodify** is a recipe site with a system administrator, which was developed with the knowledge acquired in the classes of the **Rocketseat Launch Base**.

## Features

- [x] Dynamic pages and content powered by Nunjucks.
- [x] Database powered by Postgresql.
- [x] Being able to add new recipes, update and delete them.
- [x] Search recipes.
- [x] Upload images to database using Multer.
- [x] Complete login system, with administrators and regular users.
- [x] Routes are safe thanks to Validators.
- [x] Nodemailer to reset and recover passwords.


## 🚀  Technologies

The project was developed using the following technologies:

- [Node](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [Sass](https://sass-lang.com/)
- [Faker.js](https://github.com/marak/Faker.js/)
- [Postgres](https://node-postgres.com/)

## 📦  Vamos começar ?

You need the following tools installed in order to run this project: [Node.js + NPM](https://nodejs.org/), [PostgresSQL](https://node-postgres.com/), and [Postbird](https://github.com/Paxa/postbird).

1. Fork this repository and clone it into the current directory

```bash
    $ git clone https://github.com/raonemota/foodfy_db.git

    $ cd foodfy_db

```
2. Install dependencies

```bash
    $ npm install
```

3. Set up the database</br>

>You can manually import the database.sql to Postbird, remember to create a **new database** with the name **recipesmanager**.

```
Important!
You have to alter the db.js, located in src/config to match your PostgreSQL settings.    
You also have to alter the mailer.js, located in src/lib to match your Mailtrap settings.  
```

4. Popularize database

```bash
$ node seed.js
```
```
Important!
The admin user for test is admin@foodfy.com.br and password is 1234. 
```

5. Fire up the server and watch files

```bash
npm start
```

## LICENSE

This project is under the MIT license. See the [LICENSE](https://github.com/raonemota/foodfy_db/blob/master/LICENSE.md) for details.


