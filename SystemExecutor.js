import mongoose from "mongoose";
import { exec } from "child_process";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";

export class SystemExecutor {
  constructor(connectURL) {
    this.connectURL = connectURL;

    this.dataSchema = new mongoose.Schema({
      botName: String,
      sysLang: String,
      runcommands: [
        {
          userCmd: {
            type: String,
            unique: true,
            trim: true,
          },
          cmd: String,
          msg: String,
        },
      ],

      killcommands: [
        {
          userCmd: { type: String, unique: true, trim: true },
          cmd: String,
          msg: String,
        },
      ],
    });

    this.botModel = mongoose.model("comms", this.dataSchema, "comms");

    this.mongoDBConnect();
  }

  async mongoDBConnect() {
    try {
      await mongoose.connect(this.connectURL).then(() => {
        exec("start chrome http://localhost:3000/Bot");
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
  async getAllDataFromDB() {
    const result = await this.botModel.find({});
    return result;
  }

  async ChangeBotName(oldName, newName) {
    try {
      const result = await this.botModel.updateOne(
        { botName: oldName },
        { $set: { botName: newName } }
      );
      if (result.modifiedCount > 0) {
        return { msg: `Changed name to ${newName}`, status: "success" };
      } else {
        return { msg: "You have chooce new name" };
      }
    } catch (err) {
      return err;
    }
  }
  async findCommandAndStartApps(command) {
    try {
      const result = await this.botModel.findOne(
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
      const result = await this.botModel.findOne(
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
      return `Search about ${search}`;
    }
  }

  async askAiSmallQuestion(ask) {
    dotenv.config();
    const openrouter = new OpenRouter({
      apiKey: process.env.aiKey,
    });

    const result = openrouter.callModel({
      model: "openai/gpt-5-nano",
      input: `in very short answer only in en and dont say anythin in arabic and dot add any special character with your respons${ask}`,
    });

    const text = await result.getText();
    return text;
  }

  // async ChangeLang(oldLang, newLang) {
  //   try {
  //     const result = await this.botModel.updateOne(
  //       {sysLang: oldLang},
  //       { $set: { sysLang: newLang } }
  //     );
  //     console.log(
  //         result
  //       )
  //     if (result.modifiedCount > 0) {
        
  //       return {
  //         msg:
  //           newLang === "en-US"
  //             ? "Language now is English"
  //             : "اللغة الان هي العربية",
  //         newLang: newLang,
  //       };
  //     }
  //   } catch (err) {
  //     console.log(err)
  //     return err;
  //   }
  // }
}
