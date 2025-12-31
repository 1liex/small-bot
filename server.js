import express from "express";
import cors from "cors";
import { SystemExecutor } from "./SystemExecutor.js";
import dotenv from "dotenv";

const app = express();

app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
dotenv.config();
const dbUrl = process.env.dbUrl;
const execute = new SystemExecutor(dbUrl);

app.post("/runApp", async (req, res) => {
  const appName = req.body.appName;

  const executeRespons = await execute.findCommandAndStartApps(appName);
  res.send(executeRespons);
});

app.post("/killApp", async (req, res) => {
  const appName = req.body.appName;

  const executeRespons = await execute.findCommandAndKilltApps(appName);

  res.send(executeRespons);
});

app.post("/searchOnYt", async (req, res) => {
  const search = req.body.search;

  const executeRespons = await execute.searchYouTybe(search);

  res.send(executeRespons);
});

app.post("/askAi", async (req, res) => {
  const questionToAi = req.body.questionToAi;

  const executeRespons = await execute.askAiSmallQuestion(questionToAi);

  res.send(executeRespons);
});

app.get("/Bot", (req, res) => {
  res.render("speeshToText");
});

app.listen("3000");
