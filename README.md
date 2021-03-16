# Movie Match!

**CodersCamp 2020 - Project Node.js**

## Table of contents

- [General info](#general-info)
- [API - endpoints](#api-endpoints)
- [API - usage examples](#api-usage-examples)
- [Technologies](#technologies)
- [Project scope](#project-scope)
- [Team](#team)
- [Live Preview](#live-preview)

## General info

The aim of this project was to create back-end for Awesome Movie Match application.
Awesome Movie Match is meant to be a platform for people to create movie collections & find people with similar movie interests. 

Project was created during [CodersCamp Course](https://coderscamp.edu.pl) in Feb - Mar 2021 using Node.js.

## API - endpoints

### USERS

| Route                                  | Method | Description                                                                                                             | Only for logged in users |
|----------------------------------------|--------|-------------------------------------------------------------------------------------------------------------------------|--------------------------|
| /api/users                             | GET    | Returns users: if email or displayedName is specified in query, returns matching results - otherwise returns all users. | Yes.                     |
| /api/users/avatar/:userid              | GET    | Returns avatar of user with given id.                                                                                   | Yes.                     |
| /api/users/register                    | POST   | Sends email with confirmation link. Requires providing email, name, displayedName & password in request body.           | No.                      |
| /api/users/login                       | POST   | Returns logged in user & authorization token. Requires providing email & password in request body.                      | No.                      |
| /api/users/forgotpassword              | POST   | Sends email with reset link. Requires providing email in request body.                                                  | No.                      |
| /api/users/avatar                      | POST   | Sets user avatar. Requires providing avatar in request body.                                                            | Yes.                     |
| /api/users/register/:registrationtoken | PUT    | Activates user account. Requires providing a valid registrationtoken                                                    | No.                      |
| /api/users/resetpassword/:resettoken   | PUT    | Resets user password. Requires providing a valid resettoken as param & newPassword in request body                      | No.                      |
| /api/users/:id/password                | PATCH  | Changes user's password to new one, provided in request body.                                                           | Yes.                     |
| /api/users/:id                         | PATCH  | Depending on provided request body, changes user's: name, or displayedName, or email.                                   | Yes.                     |
| /api/users/:id                         | DELETE | Deletes user's account. Requires providing password in request body.                                                    | Yes.                     |

### FRIENDS

| Route                              | Method | Description                                                                                                                | Only for logged in users |
|------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------|--------------------------|
| /api/friends                       | GET    | Returns friends: if name or displayedName is specified in query, returns matching results - otherwise returns all friends. | Yes.                     |
| /api/friends/:friendid             | GET    | Returns details of a friend with given id: name, displayedName.                                                            | Yes.                     |
| /api/friends/invite/:friendid      | POST   | Sends friend invitation to the user with given id.                                                                         | Yes.                     |
| /api/friends/accept/:invitationid  | POST   | Accepts friend invitation with given id.                                                                                    | Yes.                     |
| /api/friends/decline/:invitationid | POST   | Declines friend invitation with given id.                                                                                   | Yes.                     |

### MOVIES

| Route                | Method | Description                                            | Only for logged in users |
|----------------------|--------|--------------------------------------------------------|--------------------------|
| /api/movies          | GET    | Returns list of movies matching "title" query.         | Yes.                     |
| /api/movies/suggest  | GET    | Returns list of movie suggestions.                     | Yes.                     |
| /api/movies/:movieid | GET    | Returns details of movie with specified id.            | Yes.                     |
| /api/movies/:movieid | POST   | Adds movie with specified id to user's collection.     | Yes.                     |
| /api/movies/:movieid | DELETE | Removes movie with specified id from users collection. | Yes.                     |

## API - usage examples

### USERS

#### Register user:
Send POST request to: 
```https://awesome-movie-match.herokuapp.com/api/users/register```

Example of request body:
```
{
    "email": "thadeus@example.com",
    "name": "Thadeus",
    "displayedName": "Thadeus",
    "password": "Thadeus1*"
}
```
#### Login user:
Send POST request to: 
```https://awesome-movie-match.herokuapp.com/api/users/login```

Example of request body:
```
{
    "email": "thadeus@example.com",
    "password": "Thadeus1*"
}
```

#### Search user:
Send GET request to: 
```https://awesome-movie-match.herokuapp.com/api/users```

Available query options (all optional):
```
displayedName
email
limit
page
```
If you provide email or displayed name, it has to be one OR the other.
`limit` sets the number of records per page.
`page` sets the number of returned page.

### FRIENDS

#### Send friend request:
Send POST request to: 
```https://awesome-movie-match.herokuapp.com/api/friends/invite/:friendid```

Where `:friendid` is a valid id of another user.

#### Accept friend request:
Send POST request to: 
```https://awesome-movie-match.herokuapp.com/api/friends/accept/:invitationid```

Where `:invitationid` is a valid id of an invitation.

#### Decline friend request:
Send POST request to: 
```https://awesome-movie-match.herokuapp.com/api/friends/decline/:invitationid```

Where `:invitationid` is a valid id of an invitation.




## Technologies

### Project was created with:

- Node.js(https://nodejs.org/)
- Express.js(https://expressjs.com)
- MongoDB(https://www.mongodb.com/)
- Mongoose(https://mongoosejs.com)
- EJS(https://ejs.co)
- OMDb API(http://www.omdbapi.com)
- nodemailer(https://nodemailer.com/about/)

## Project scope

- REST API
- creating user account
- authorization & authentication, user permissions, Json Web Token
- using database (NoSQL or SQL)
- integration with external system (e.g. e-mail sending)
- testing

## Team

#### Development:

- [Michał Ciborowski](https://github.com/Cidebur)
- [Ernest Szczeblewski](https://github.com/ESzczeblewski)
- [Anna Żak](https://github.com/AnnZak)
- [Aleksandra Żochowska](https://github.com/AleksandraZochowska)

##### Tech Lead:

- [Aleksandra Żochowska](https://github.com/AleksandraZochowska)

##### Product Owner:

- [Michał Ciborowski](https://github.com/Cidebur)

##### Development Manager:

- [Anna Żak](https://github.com/AnnZak)

#### Mentor:

- [Piotr Bartkowicz](https://github.com/BartkowiczPiotr)

## Live Preview

To see our project, visit:

https://awesome-movie-match.herokuapp.com