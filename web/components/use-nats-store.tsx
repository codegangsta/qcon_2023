import { create } from "zustand";
import { NatsConnection, ConnectionOptions, connect } from "nats.ws";

const defaultConfig = {
  chart_color: "rgb(110, 86, 207);",
};

interface Config {
  chart_color: string;
}

interface NatsState {
  config: Config;
  connection: NatsConnection | null;
  connect: (options: ConnectionOptions) => void;
}

export const useNatsStore = create<NatsState>((set, get) => ({
  config: defaultConfig,
  connection: null,
  connect: async (options: ConnectionOptions) => {
    const connection = await connect(options);

    await get().connection?.close();

    set({ connection });

    // Connect to KV config store
    const configStore = await connection.jetstream().views.kv("config");
    const watcher = await configStore.watch();
    for await (const entry of watcher) {
      if (entry.key == "all") {
        switch (entry.operation) {
          case "PUT":
            console.log("Got config update", entry.key, entry.json());
            set({ config: { ...defaultConfig, ...entry.json() } });
            break;
          case "DEL":
          case "PURGE":
            set({ config: defaultConfig });
            break;
        }
      }
    }
  },
}));
