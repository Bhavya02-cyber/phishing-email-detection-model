import { useEffect, useMemo, useState } from "react";
import { emailDataset } from "./data/emails";
import { extractFeatures } from "./utils/features";
import { LogisticRegressionModel } from "./utils/model";
import {
  accuracy,
  computeConfusionMatrix,
  metricsFromMatrix,
} from "./utils/metrics";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [trained, setTrained] = useState(false);
  const [training, setTraining] = useState(false);
  const [acc, setAcc] = useState(0);
  const [matrix, setMatrix] = useState({ tp: 0, tn: 0, fp: 0, fn: 0 });
  const [topFeatures, setTopFeatures] = useState<
    { name: string; weight: number }[]
  >([]);
  const [inputEmail, setInputEmail] = useState("");
  const [prediction, setPrediction] = useState<null | {
    label: 0 | 1;
    probability: number;
    features: ReturnType<typeof extractFeatures>;
  }>(null);

  const model = useMemo(() => new LogisticRegressionModel(0.15, 400, 0.01), []);

  useEffect(() => {
    trainModel();
  }, []);

  function trainModel() {
    setTraining(true);
    setTimeout(() => {
      const texts = emailDataset.map((e) => e.text);
      const labels = emailDataset.map((e) => e.label);
      model.fit(texts, labels);

      const preds = model.predict(texts);
      const accValue = accuracy(labels, preds);
      const mat = computeConfusionMatrix(labels, preds);
      const features = model.getTopFeatures(12);

      setAcc(accValue);
      setMatrix(mat);
      setTopFeatures(features);
      setTrained(true);
      setTraining(false);
    }, 50);
  }

  function classifyEmail() {
    if (!inputEmail.trim() || !trained) return;
    const prob = model.predictProba([inputEmail])[0];
    const label = prob >= 0.5 ? 1 : 0;
    const features = extractFeatures(inputEmail);
    setPrediction({ label, probability: prob, features });
  }

  const { precision, recall, f1 } = metricsFromMatrix(matrix);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-200">
            <svg
              className="h-7 w-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 6l10 7 10-7" />
              <path d="M12 22v-6" />
              <path d="M12 10l-4-3" />
              <path d="M12 10l4-3" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Phishing Email Detection
          </h1>
          <p className="mx-auto max-w-2xl text-slate-500">
            A client-side machine-learning classifier trained with a scikit-learn-style pipeline.
            It extracts textual and URL features, fits a logistic regression model, and reports
            accuracy and a confusion matrix.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Model Performance
            </h2>

            {!trained || training ? (
              <div className="flex h-40 items-center justify-center text-slate-500">
                {training ? "Training model…" : "Waiting to train"}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="Accuracy" value={`${(acc * 100).toFixed(1)}%`} />
                  <MetricCard label="F1 Score" value={`${(f1 * 100).toFixed(1)}%`} />
                  <MetricCard label="Precision" value={`${(precision * 100).toFixed(1)}%`} />
                  <MetricCard label="Recall" value={`${(recall * 100).toFixed(1)}%`} />
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Confusion Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <MatrixCell
                      title="True Positive"
                      count={matrix.tp}
                      subtitle="Phishing correctly detected"
                      tone="emerald"
                    />
                    <MatrixCell
                      title="False Positive"
                      count={matrix.fp}
                      subtitle="Safe email flagged"
                      tone="rose"
                    />
                    <MatrixCell
                      title="False Negative"
                      count={matrix.fn}
                      subtitle="Phishing missed"
                      tone="rose"
                    />
                    <MatrixCell
                      title="True Negative"
                      count={matrix.tn}
                      subtitle="Safe email correctly allowed"
                      tone="emerald"
                    />
                  </div>
                </div>

                <button
                  onClick={trainModel}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Retrain Model
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Classify an Email
            </h2>
            <div className="space-y-4">
              <textarea
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Paste an email message here…"
                className="min-h-[140px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={classifyEmail}
                disabled={!trained || !inputEmail.trim()}
                className={classNames(
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition",
                  !trained || !inputEmail.trim()
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700"
                )}
              >
                {trained ? "Classify Email" : "Train model first"}
              </button>

              {prediction && (
                <div
                  className={classNames(
                    "rounded-xl border p-4",
                    prediction.label === 1
                      ? "border-rose-200 bg-rose-50"
                      : "border-emerald-200 bg-emerald-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Prediction
                    </span>
                    <span
                      className={classNames(
                        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                        prediction.label === 1
                          ? "bg-rose-500 text-white"
                          : "bg-emerald-500 text-white"
                      )}
                    >
                      {prediction.label === 1 ? "Phishing" : "Safe"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    Confidence:{" "}
                    <span className="font-semibold">
                      {(
                        (prediction.probability >= 0.5
                          ? prediction.probability
                          : 1 - prediction.probability) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded-lg bg-white/60 px-3 py-2">
                      URLs found: {prediction.features.urlCount}
                    </div>
                    <div className="rounded-lg bg-white/60 px-3 py-2">
                      Suspicious keywords: {prediction.features.keywordCount}
                    </div>
                    <div className="rounded-lg bg-white/60 px-3 py-2">
                      Suspicious TLDs: {prediction.features.suspiciousTldCount}
                    </div>
                    <div className="rounded-lg bg-white/60 px-3 py-2">
                      Total URL length: {prediction.features.totalUrlLength}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Top Influential Features
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Features with the largest absolute weights in the logistic regression model. Positive
            weights push the prediction toward <strong>Phishing</strong>; negative weights push it
            toward <strong>Safe</strong>.
          </p>
          <div className="space-y-3">
            {topFeatures.map((feat) => (
              <div key={feat.name} className="flex items-center gap-4">
                <span className="w-32 shrink-0 truncate text-sm font-medium text-slate-700 md:w-48">
                  {feat.name}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={classNames(
                      "h-2.5 rounded-full transition-all",
                      feat.weight > 0 ? "bg-rose-500" : "bg-emerald-500"
                    )}
                    style={{
                      width: `${Math.min(
                        Math.abs(feat.weight) * 100,
                        100
                      )}%`,
                      marginLeft: feat.weight < 0 ? "auto" : undefined,
                      marginRight: feat.weight < 0 ? undefined : "auto",
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-medium text-slate-600">
                  {feat.weight > 0 ? "+" : ""}
                  {feat.weight.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            About the Model
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <strong>Dataset:</strong> {emailDataset.length} labeled emails ({" "}
              {emailDataset.filter((e) => e.label === 1).length} phishing,{" "}
              {emailDataset.filter((e) => e.label === 0).length} safe).
            </li>
            <li>
              <strong>Features:</strong> token counts engineered from the message text, URL count,
              presence of suspicious top-level domains, total URL length, and counts of phishing
              keywords.
            </li>
            <li>
              <strong>Algorithm:</strong> logistic regression trained with gradient descent and L2
              regularization — the same family of classifier commonly used with scikit-learn's{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">
                LogisticRegression
              </code>
              .
            </li>
            <li>
              <strong>Evaluation:</strong> accuracy and confusion matrix computed on the training
              set; for production use, split the data into train/test sets or use cross-validation.
            </li>
            <li>
              <strong>Python reference:</strong> an equivalent scikit-learn implementation is
              included at{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-800">
                public/phishing_model.py
              </code>
              .
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function MatrixCell({
  title,
  count,
  subtitle,
  tone,
}: {
  title: string;
  count: number;
  subtitle: string;
  tone: "emerald" | "rose";
}) {
  return (
    <div
      className={classNames(
        "rounded-xl border p-4",
        tone === "emerald"
          ? "border-emerald-100 bg-emerald-50/50"
          : "border-rose-100 bg-rose-50/50"
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div
        className={classNames(
          "my-1 text-3xl font-bold",
          tone === "emerald" ? "text-emerald-700" : "text-rose-700"
        )}
      >
        {count}
      </div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}
