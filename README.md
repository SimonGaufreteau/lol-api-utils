# Lol API Utils

## About

This is a tool intented to be used by League of Legends team captains / coaches / anyone from a team which will play a game against known opponents.

The main objective is to provide some basic informations about the opposing team, such as most played positions and champions, in team or in general.

## Requirements

In order to use the tool you need the names of every player of the team to get started, as well as an API key that you must put in a `.env` file at the root of the project. (This API Key can be found here : https://developer.riotgames.com/)

This `.env` file must contain at least this line

```bash
API_KEY=RGAPI-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

NPM is required to install the dependencies as described in the next part.

*Note : I used npm v7.11.x on Ubuntu 20.04*

## Install

To install with the dependencies I used (recommended) : `npm ci`

To install with the updated dependencies (not tested, can break eventually) : `npm i`

## Running the project

Simple start : `npm run dev`

Dev nodemon : `npm run serve`

Check [index.js](./src/index.js) for examples on both file reading/writing and API calls

## Contributing

Any contribution is welcome, as long as the code flow is respected and it provides anything useful to the project. Any major modification needs to be discussed with me beforehand.

## Contact

- **Mail** : simon.gaufreteau@gmail.com
- **Discord** : 3x1#6160