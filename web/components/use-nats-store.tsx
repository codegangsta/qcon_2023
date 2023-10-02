import { create } from "zustand";
import { NatsConnection, ConnectionOptions, connect } from "nats.ws";

interface NatsState {
  connection: NatsConnection | null;
  setConnection: (connection: NatsConnection) => void;
  connect: (options: ConnectionOptions) => void;
}

export const useNatsStore = create<NatsState>((set) => ({
  connection: null,
  setConnection: (connection: NatsConnection) => {
    set({ connection });
  },
  connect: async (options: ConnectionOptions) => {
    const connection = await connect(options);
    set({ connection });
  },
}));
