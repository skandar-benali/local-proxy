const express = require("express");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { join } = require("path");
const { exec } = require("child_process");

const app = express();

app.use(bodyParser.json());

// verify inputs
if (!process.argv[2]) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "You need to specify the path of Lambdas's folder",
  );
  process.exit(1);
}

const LAMBDAS_FOLDER = process.argv[2];

const executeSamCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: join(LAMBDAS_FOLDER, "lambdas/zzzzzzLocalTest") },
      (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      },
    );
  });
};

async function invokeLambdaFunction(lambdaName, payload) {
  return executeSamCommand(
    `echo '${JSON.stringify(
      payload,
    )}' | sam local invoke --event - "${lambdaName}"`,
  );
}

// Define a route that invokes the Lambda function
app.post("/:lambdaName", async (req, res) => {
  const lambdaResponse = await invokeLambdaFunction(
    req.params.lambdaName,
    req.body,
  );
  res.send(JSON.parse(lambdaResponse));
});

const server = createServer(app);

server.listen(9191, () => {
  console.log(`Server is listening on port http://localhost:9191`);
});
