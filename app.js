const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
//console.log(dbPath);
app.use(express.json()); //for post APIs
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET PLAYERS API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
    cricket_team
    ORDER BY player_id
    `;
  const playersArray = await db.all(getPlayersQuery);
  const responseObject = playersArray.map((eachPlayer) => {
    //console.log(eachPlayer);
    return convertDbObjectToResponseObject(eachPlayer);
  });
  response.send(responseObject);

  //   const convertDbObjectToResponseObject = (playersArray) => {
  //     const responseObject = playersArray.map((eachPlayer) => {
  //       return {
  //         playerId: eachPlayer.player_id,
  //         playerName: eachPlayer.player_name,
  //         jerseyNumber: eachPlayer.jersey_number,
  //         role: eachPlayer.role,
  //       };
  //     });
  //     return responseObject;
  //   };

  //   const responseObject = convertDbObjectToResponseObject(playersArray);
  //   response.send(responseObject);
  // the function convertDbObjectToResponseObject is necessary in all API , so every in API if we write this function
  //it increases the length of the code and errors might occur.
  //To avoid this issue define convertDbObjectToResponseObject outside all APIs and return single object.
  //now this function can be called inside every API and return every object of response from db using the map function.
});

//POST PLAYERS API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayersQuery = `
  INSERT
  INTO
  cricket_team(player_name,jersey_number,role)
  VALUES(
      '${playerName}',${jerseyNumber},'${role}'
  )
  `;
  const dbResponse = await db.run(addPlayersQuery);
  //const playerId = dbResponse.lastID;
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

//GET PLAYER API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM 
    cricket_team
    WHERE player_id= ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  //response.send(player); but we want this data in camel case
  response.send(convertDbObjectToResponseObject(player));
});

//PUT PLAYER API

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const updatedPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatedPlayerDetails;
  // const { playerName, jerseyNumber, role } = request.body
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId};
  `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayer = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId}
  `;

  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
