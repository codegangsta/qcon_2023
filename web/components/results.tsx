import { useCallback, useEffect, useRef, useState } from "react";
import { SurveyFormData, SurveyQuestion, SurveyQuestions } from "./survey";
import { useNatsStore } from "./use-nats-store";
import { JSONCodec, consumerOpts } from "nats.ws";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import DeviceDetector from "device-detector-js";
import { isSubset } from "./util";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const { decode } = JSONCodec<SurveyFormData>();

interface Props {
  nickname: string;
}

export default function Results({ nickname }: Props) {
  const { connection } = useNatsStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<SurveyFormData[]>([]);
  const logContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainer.current) {
      logContainer.current.scrollTop = logContainer.current.scrollHeight;
    }
  }, [logs]);

  const log = (text: string) => {
    const d = new Date();
    text = `[${d.toLocaleTimeString("en-US", { timeStyle: "long" })}] ${text}`;
    // keep log scrollback size to 1000 lines
    setLogs((current) => current.slice(-1000));
    setLogs((current) => [...current, text]);
  };

  useEffect(() => {
    setResults([]);
    if (!connection) {
      return;
    }

    log(`Connected to NATS ${connection.getServer()} as "${nickname}"`);

    const opts = consumerOpts();
    opts.orderedConsumer();
    const js = connection.jetstream();
    const sub = (async () => {
      const sub = await js.subscribe("survey.submitted", opts);
      for await (const m of sub) {
        setResults((current) => [...current, decode(m.data)]);
      }

      return sub;
    })();

    return () => {
      sub.then((s) => s.unsubscribe());
    };
  }, [connection, nickname]);

  useEffect(() => {
    if (!connection) {
      return;
    }
    const { encode } = JSONCodec();

    const service = (async () => {
      const service = await connection.services.add({
        name: "qcon_attendee",
        description: "QCon Attendee Service",
        version: "0.0.1",
        statsHandler: (stats) => {
          return Promise.resolve({
            server: connection.info?.server_name,
          });
        },
      });

      service.addEndpoint("device_info", {
        queue: service.info().id,
        subject: "qcon.device_info",
        metadata: {
          description: "Returns device info with optional filtering.",
        },
        handler: async (err, msg) => {
          log(`Received request on ${msg.subject}`);

          const device = new DeviceDetector().parse(navigator.userAgent);
          const payload = { name: nickname, ...device };

          if (msg.data.length == 0 || isSubset(msg.json(), device)) {
            log(`Sending response: ${JSON.stringify(payload)}`);
            msg.respond(encode(payload));
          } else {
            log(`Ignoring request: Does not match device filter`);
          }
        },
      });

      service.addEndpoint("advertise", {
        queue: service.info().id,
        subject: "qcon.advertise",
        metadata: {
          description: "Advertise a new server for clients to connect to.",
        },
        handler: async (err, msg) => {
          log(`Received request on ${msg.subject}`);
        },
      });

      const info = service.info();
      log(`Initialized "${info.name}" service v${info.version}`);

      return service;
    })();

    return () => {
      service.then((s) => s.stop());
    };
  }, [connection, nickname]);

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

    return d;
  };

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
        <CardHeader className="w-full">
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent
          ref={logContainer}
          className="font-mono text-zinc-400 h-72 overflow-y-scroll overflow-x-hidden"
        >
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
