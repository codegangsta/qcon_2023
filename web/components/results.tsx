import { useCallback, useEffect, useState } from "react";
import {
  Familiarity,
  SurveyFormData,
  SurveyQuestion,
  SurveyQuestions,
} from "./survey";
import { useNatsStore } from "./use-nats-store";
import { JSONCodec, consumerOpts } from "nats.ws";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const { decode } = JSONCodec<SurveyFormData>();

export default function Results() {
  const { connection } = useNatsStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<SurveyFormData[]>([]);

  const log = (text: string) => {
    const d = new Date();
    text = `[${d.toLocaleTimeString("en-US", { timeStyle: "long" })}] ${text}`;
    setLogs((current) => [...current, text]);
  };

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

  const seriesData = (question: SurveyQuestion) => {
    const d = question.options.map((option) => {
      var n = 0;
      results.forEach((data) => {
        if (data[question.id] == option) {
          n++;
        }
      });
      return n;
    });
    console.log(question.id, d);

    return d;
  };

  useEffect(() => {
    consume();
  }, [consume]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    // set connected server in the logs
    log(`Connected to ${connection.getServer()}`);
  }, [connection]);

  if (results.length == 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SurveyQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">{question.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                width={"100%"}
                height={300}
                type="donut"
                options={{
                  labels: question.options,
                  legend: {
                    show: false,
                  },
                  stroke: {
                    show: false,
                  },
                  theme: {
                    monochrome: {
                      enabled: true,
                      color: "rgb(110, 86, 207);",
                      shadeTo: "dark",
                      shadeIntensity: 0.65,
                    },
                  },
                }}
                series={seriesData(question)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-zinc-400 h-72 overflow-scroll">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
