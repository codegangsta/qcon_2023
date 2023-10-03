import { useCallback, useEffect, useRef, useState } from "react";
import { SurveyFormData, SurveyQuestion, SurveyQuestions } from "./survey";
import { useNatsStore } from "./use-nats-store";
import { JSONCodec, StringCodec, consumerOpts } from "nats.ws";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import DeviceDetector from "device-detector-js";
import { isSubset } from "./util";
import { usePathname, useRouter } from "next/navigation";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const { decode } = JSONCodec<SurveyFormData>();

interface Props {
  nickname: string;
}

export default function Results({ nickname }: Props) {
  const { connection, logs, log } = useNatsStore();
  const [rtt, setRtt] = useState<number>();
  const [results, setResults] = useState<SurveyFormData[]>([]);
  const logContainer = useRef<HTMLDivElement>(null);
  const { chart_color } = useNatsStore((state) => state.config);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { encode } = JSONCodec();
    setRtt(undefined);
    const interval = setInterval(async () => {
      if (connection) {
        const rtt = await connection.rtt();
        setRtt(rtt);
        connection.publish(
          `metrics.${connection.info?.server_name}.${connection.info?.client_id}`,
          encode({
            rtt: rtt,
            server: connection.info?.server_name,
            nickname: nickname,
            ...connection.info,
            ...connection.stats(),
          })
        );
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [connection, nickname]);

  useEffect(() => {
    if (logContainer.current) {
      logContainer.current.scrollTop = logContainer.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    setResults([]);
    if (!connection) {
      return;
    }

    log(
      `Connected to ${
        connection.info?.server_name
      } (${connection.getServer()}) as "${nickname}"`
    );

    const opts = consumerOpts();
    opts.bindStream("survey");
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
  }, [connection, nickname, log]);

  useEffect(() => {
    if (!connection) {
      return;
    }
    const { encode } = JSONCodec();

    const service = (async () => {
      const service = await connection.services.add({
        name: "qcon",
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
            log(`\tSending response: ${JSON.stringify(payload)}`);
            msg.respond(encode(payload));
          } else {
            log(`\tIgnoring request: Does not match device filter`);
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
          const sc = StringCodec();
          const url = sc.decode(msg.data);
          const urlParams = new URLSearchParams(window.location.search);
          if (url.length > 0) {
            urlParams.set("connect", url);
          } else {
            urlParams.delete("connect");
          }
          window.history.pushState(null, "", "?" + urlParams.toString());
          router.replace(`${pathname}?${urlParams}`);
        },
      });

      service.addEndpoint("nickname", {
        subject: "qcon.nickname",
        metadata: {
          description: "Returns the name of the attendee.",
        },
        handler: async (err, msg) => {
          log(`Received request on ${msg.subject}`);
          const { encode } = StringCodec();
          msg.respond(encode(nickname));
          log(`\tSending response: ${nickname}`);
        },
      });

      const info = service.info();
      log(`Initialized "${info.name}" service v${info.version}`);

      return service;
    })();

    return () => {
      service.then((s) => s.stop());
    };
  }, [connection, nickname, log, pathname, router]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row">
        <span className="font-medium font-mono">
          server: {connection?.info?.server_name}
        </span>
        <div className="flex-grow flex-1"></div>
        {rtt != undefined && (
          <span className="text-zinc-400 font-mono">{rtt}ms</span>
        )}
      </div>
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
                      color: chart_color,
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
