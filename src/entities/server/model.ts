import { Preloader } from "@/shared/model/loader";
import { api } from "@/shared/sdk";
import { Server, UpdateServerDto } from "@/shared/sdk/types";
import { makeAutoObservable } from "mobx";
import toast from "react-hot-toast";

class ServerModel {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Preloader();


  public servers: Server[] = [];

  public async findServers() {
    try {
      this.loader.start();
      const { data: servers } = await api.findServers();

      this.servers = servers;
    } catch {
      this.servers = [];
    } finally {
      this.loader.stop();
    }
  }

  updateServer = async (server: UpdateServerDto) => {
    try {
      this.loader.start();
      const { data: updatedServer } = await api.updateServer(server);

      this.servers = this.servers.map((s) => (s.id === updatedServer.id ? updatedServer : s));
    } catch {
      toast.error('Не вдалося оновити сервер');
    } finally {
      this.loader.stop();
    }
  }

}

export { ServerModel }