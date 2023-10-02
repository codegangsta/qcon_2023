import { useCallback, useEffect, useState } from "react";
import { SurveyFormData } from "./survey";
import { useNatsStore } from "./use-nats-store";
import { JSONCodec, consumerOpts } from "nats.ws";

const { decode } = JSONCodec<SurveyFormData>();

export default function Results() {
  const { connection } = useNatsStore();
  const [results, setResults] = useState<SurveyFormData[]>([]);

  const consume = useCallback(async () => {
    setResults([]);
    if (!connection) {
      return;
    }

    const opts = consumerOpts();
    opts.orderedConsumer();
    const js = connection.jetstream();
    const sub = await js.subscribe("survey.submitted", opts);
    for await (const m of sub) {
      setResults((current) => [...current, decode(m.data)]);
    }
  }, [connection]);

  useEffect(() => {
    consume();
  }, [consume]);

  return (
    <div>
      <span>hi</span>
    </div>
  );
}
