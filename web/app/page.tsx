"use client";

import Results from "@/components/results";
import Start, { StartFormData } from "@/components/start";
import Survey, { SurveyFormData } from "@/components/survey";
import { useToast } from "@/components/ui/use-toast";
import { useNatsStore } from "@/components/use-nats-store";
import { ConnectionOptions, JSONCodec, jwtAuthenticator } from "nats.ws";
import { useEffect, useState } from "react";

enum Step {
  Connecting,
  Start,
  Survey,
  Results,
}

const bearerJwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJJNVlNNzJZQVJERlVGM0RKUDRWTDY2TURYWENTRlYzVllIUFBGSldLQjRCTFRDNTVNWTVBIiwiaWF0IjoxNjk2MjczNTMzLCJpc3MiOiJBREJRNlhaVVdFNFFZRU9XTE5CUVlDTjJHWUtIMlpYQkxCRE9LWFBZQzRSN1ZLWE5BVUVWU1EyNyIsIm5hbWUiOiJ3ZWIiLCJzdWIiOiJVQjJKUlFLUVZZUVhMSUdGTlNZNE5PS0xaQkJFQzJZUlhUQjRXQUwzR1pYTTJHSE9aWENDRVJFSSIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwiYmVhcmVyX3Rva2VuIjp0cnVlLCJpc3N1ZXJfYWNjb3VudCI6IkFBSDNFUFRZRTVBQTJTNlBQTU1HUEVEQTJMWk01WkZPRUY3Mk41WEZORFFJT01UVkhYNEhESkRTIiwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.gpX2F3Wl_I4nIcmtciLz3SQvMN-Gq4NwD3NclXYVED3vX6nKDQaYlTVPM2WFfG8KbT7H6jPTL7ScfgDaCdzaAw";

export default function Home() {
  const [step, setStep] = useState(Step.Start);
  const [nickname, setNickname] = useState<string | null>();
  const { connection, connect } = useNatsStore();
  const [submitted, setSubmitted] = useState<boolean>();
  const [connectOpts, setConnectOpts] = useState<ConnectionOptions>({
    servers: ["wss://nats.codegangsta.dev"],
    authenticator: jwtAuthenticator(bearerJwt),
  });

  const { toast } = useToast();
  const { encode } = JSONCodec();

  useEffect(() => {
    if (localStorage.getItem("survey")) {
      setSubmitted(true);
    }
    if (localStorage.getItem("nickname")) {
      setNickname(localStorage.getItem("nickname"));
    }
    if (nickname) {
      connect({ name: nickname, ...connectOpts });
    }
    if (submitted) {
      setStep(Step.Results);
    }
  }, [connect, connectOpts, nickname, submitted]);

  const onStartSubmit = (data: StartFormData) => {
    setNickname(data.nickname);
    setStep(Step.Survey);
  };

  const onSurveySubmit = (data: SurveyFormData) => {
    if (!connection) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Not connected to NATS",
      });
      return;
    }

    const js = connection.jetstream({ domain: "cloud" });
    js.publish("survey.submitted", encode(data))
      .then(() => setStep(Step.Results))
      .catch((err) =>
        toast({
          variant: "destructive",
          title: "NATS Error",
          description: err.message,
        })
      );

    if (nickname) {
      localStorage.setItem("survey", "true");
      localStorage.setItem("nickname", nickname);
      setStep(Step.Results);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center">
      {step === Step.Start && <Start onSubmit={onStartSubmit} />}
      {step === Step.Survey && <Survey onSubmit={onSurveySubmit} />}
      {step === Step.Results && nickname && <Results nickname={nickname} />}
    </div>
  );
}
