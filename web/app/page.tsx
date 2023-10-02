"use client";

import Start, { StartFormData } from "@/components/start";
import Survey, { SurveyFormData } from "@/components/survey";
import { useState } from "react";

enum Step {
  Start,
  Survey,
  Results,
}

export default function Home() {
  const [step, setStep] = useState(Step.Start);

  const onStartSubmit = (data: StartFormData) => {
    console.log(data);
    setStep(Step.Survey);
  };

  const onSurveySubmit = (data: SurveyFormData) => {
    console.log(data);
    setStep(Step.Survey);
  };

  return (
    <div className="flex flex-grow items-center justify-center">
      {step === Step.Start && <Start onSubmit={onStartSubmit} />}
      {step === Step.Survey && <Survey onSubmit={onSurveySubmit} />}
    </div>
  );
}
