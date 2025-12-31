import mongoose from "mongoose";
import { exec } from "child_process";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";

export class SystemExecutor {
  constructor(connectURL) {
    this.connectURL = connectURL;

    this.dataSchema = new mongoose.Schema({
      name: String,
      runcommands: [
        {
          userCmd: String,
          cmd: String,
          msg: String,
        },
      ],
      killcommands: [
        {
          userCmd: String,
          cmd: String,
          msg: String,
        },
      ],
    });

    this.modelTest = mongoose.model("comms", this.dataSchema, "comms");

    this.mongoDBConnect();
  }

  async mongoDBConnect() {
    try {
      await mongoose.connect(this.connectURL).then(() => {
        exec("start chrome http://localhost:3000/Bot")
      });
    } catch (err) {
      console.log(err);
    }
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(error.message);
          return reject(error.message);
        }
        if (stderr) {
          console.error(stderr);
          return reject(stderr);
        }

        resolve({ status: "success" });
      });
    });
  }

  async findCommandAndStartApps(command) {
    try {
      const result = await this.modelTest.findOne(
        { "runcommands.userCmd": command },
        { "runcommands.$": 1 }
      );

      if (!result || !result.runcommands || result.runcommands.length === 0) {
        return "Command not found";
      }
      const excuteRespons = await this.executeCommand(
        result.runcommands[0].cmd
      );

      if (excuteRespons.status === "success") {
        return result.runcommands[0].msg;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async findCommandAndKilltApps(command) {
    try {
      const result = await this.modelTest.findOne(
        { "killcommands.userCmd": command },
        { "killcommands.$": 1 }
      );

      if (!result || !result.killcommands || result.killcommands.length === 0) {
        return "Command not found";
      }
      const excuteRespons = await this.executeCommand(
        result.killcommands[0].cmd
      );

      if (excuteRespons.status === "success") {
        return result.killcommands[0].msg;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async searchYouTybe(search) {
    const ytCommand = `start brave https://www.youtube.com/results?search_query="${search}"`;

    const executeCommandRespons = await this.executeCommand(ytCommand);
    if (executeCommandRespons.status === "success") {
      return "openning...";
    }
  }

  async askAiSmallQuestion(ask) {
    dotenv.config();
    const openrouter = new OpenRouter({
      apiKey: process.env.aiKey,
    });

    const result = openrouter.callModel({
      model: "openai/gpt-5-nano",
      input: `in very short ${ask}`,
    });

    const text = await result.getText();
    return text;
  }
}
