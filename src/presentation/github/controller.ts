import { Request, Response } from "express";
import { GitHubService } from "../services/github.service";
import { DiscordService } from "../services/discord.service";

export class GithubController {
  // Estas son las inyecciones de dependencia
  constructor(
    private readonly githubService = new GitHubService(),
    private readonly discordService = new DiscordService()
  ) {}

  webhookHandler = (req: Request, res: Response) => {
    // 'x-' -> Significa que es un header personalizado, en este caso nos dice cual es el evento.
    const githubEvent = req.header("x-github-event") ?? "unknown";
    // payload: es la parte de un mensaje o paquete de datos que contiene la información que se quiere transmitir
    const payload = req.body;
    let message: string;

    switch (githubEvent) {
      case "star":
        message = this.githubService.onStar(payload);
        break;

      case "issues":
        message = this.githubService.onIssue(payload);
        break;

      default:
        message = `Unknown event ${githubEvent}`;
    }

    this.discordService
      .notify(message)
      .then(() => res.status(202).send("Accepted"))
      .catch(() => res.status(500).json({ error: "internal server error" }));
  };
}
