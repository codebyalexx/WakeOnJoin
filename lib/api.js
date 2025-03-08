const chalk = require("chalk");
const express = require("express");
const wol = require("wake_on_lan");

const PORT = process.env.API_PORT;
const MAC = process.env.MAC;
const PASSWORD = "drazestgay";

function listen() {
  console.log(chalk.yellow("> Starting API Service..."));

  const app = express();

  app.get("/start", (req, res) => {
    const userPassword = req.query.password;

    if (userPassword === PASSWORD) {
      wol.wake(MAC, (error) => {
        if (error) {
          console.error(
            chalk.red("> Error happened sending WOL signal :", error)
          );
          res.status(500).send("Error happened sending WOL signal!");
        } else {
          console.log(chalk.green("> WOL signal successfully sent (API)!"));
          res.status(200).send("ok");
        }
      });
    } else {
      res.status(401).send("Invalid password");
    }
  });

  app.listen(PORT, () => {
    console.log(chalk.green(`> API Listening on port ${PORT}!`));
  });
}

module.exports = {
  listen,
};
