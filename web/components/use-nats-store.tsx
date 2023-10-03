import { create } from "zustand";
import { NatsConnection, ConnectionOptions, connect } from "nats.ws";

const defaultConfig = {
  chart_color: "rgb(110, 86, 207);",
};

interface Config {
  chart_color: string;
}

interface NatsState {
  logs: string[];
  log: (text: string) => void;
  config: Config;
  connectURL?: string;
  connection: NatsConnection | null;
  connect: (options: ConnectionOptions) => void;
}

export const useNatsStore = create<NatsState>((set, get) => ({
  logs: [],
  log: (text: string) => {
    const d = new Date();
    text = `[${d.toLocaleTimeString("en-US", {
      timeStyle: "long",
    })}] ${text}`;
    set((state) => ({ logs: state.logs.slice(-200) }));
    set((state) => ({ logs: [...state.logs, text] }));
  },
  config: defaultConfig,
  connection: null,
  rtt: 0,
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
            set({ config: { ...defaultConfig, ...entry.json() } });
            break;
          case "DEL":
          case "PURGE":
            set({ config: defaultConfig });
            break;
        }

        const config = get().config;
        get().log("Config: " + JSON.stringify(config));
      }
    }
  },
}));
