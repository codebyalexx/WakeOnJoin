const mc = require("minecraft-protocol");
const wol = require("wake_on_lan");
const chalk = require("chalk");
const { pingHost } = require("./ping.js");

const STATUS = {
  OK: "OK",
  STARTING_REAL: "STARTING_REAL",
};

class MinecraftServer {
  constructor() {
    console.log(chalk.cyan("> Initializing MinecraftServer instance."));

    this.status = STATUS.OK;
    this.escapeLoop = false;
    this.server = null;

    setInterval(() => {
      if (this.escapeLoop) return;
      this.isAlive().then((alive) => {
        if (alive) {
          if (this.server) {
            this.stop();
            this.status = STATUS.OK;
            console.log(
              chalk.green("> Server is alive! Stopping fake server.")
            );
          }
        } else {
          if (!this.server && this.status === STATUS.OK) {
            console.log(
              chalk.green(
                "> Server offline and fake server offline, starting..."
              )
            );
            this.start();
          }
        }
      });
    }, 2500);
  }

  isAlive() {
    return new Promise((resolve) => {
      pingHost(process.env.IP, 22, 3000)
        .then((alive) => {
          resolve(alive);
        })
        .catch((reason) => {
          console.error("Failed to check server alivance", reason);
          resolve(false);
        });
    });
  }

  refresh() {
    this.stop();
    this.start();
  }

  start() {
    if (this.server)
      return console.error("Tried to start server but it already exists");

    console.log(chalk.green("> Started fake server."));

    this.server = mc.createServer({
      "online-mode": false,
      encryption: false,
      host: "0.0.0.0",
      port: 25565,
      version: "1.20.1",
      motd:
        {
          OK: "§fLe serveur est §chors ligne§f.\n§6Connecte-toi §fpour §adémarrer §fle serveur.",
          STARTING_REAL: "§e§oLe serveur est en cours de démarrage...",
        }[this.status] ||
        "§c§lErreur §r§e: §7Merci de contacter un administrateur",
    });

    this.server.on("login", (client) => {
      if (this.status === STATUS.STARTING_REAL) {
        client.end(
          `§fBonjour §6§l${client.username} §r§f!\n\nLe serveur est §c§ldéjà §ren train de §a§ldémarrer...\n§rIl sera disponible d'ici §equelques instants§f. \n\n§r§b§o( Merci de PATIENTER )`
        );
      } else {
        console.log(chalk.green("> Player has connect."));

        client.end(
          `§fBonjour §6§l${client.username} §r§f!\n\nLe serveur est en train de §a§ldémarrer...\n§rIl sera disponible d'ici §equelques instants§f. \n\n§r§b§o( Merci et bonne session de jeu )`
        );

        wol.wake(process.env.MAC, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(chalk.green("> WOL Ping sent!"));
          }
        });

        this.status = STATUS.STARTING_REAL;

        this.refresh();
      }
    });

    this.status = STATUS.OK;
  }

  stop() {
    this.server.close();
    this.server = null;
    console.log(chalk.red("> Stopped fake server."));
  }
}

module.exports = {
  MinecraftServer,
};
