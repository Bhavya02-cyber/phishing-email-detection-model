export type ConfusionMatrix = {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
};

export function computeConfusionMatrix(
  actual: number[],
  predicted: number[]
): ConfusionMatrix {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === 1 && predicted[i] === 1) tp++;
    else if (actual[i] === 0 && predicted[i] === 0) tn++;
    else if (actual[i] === 0 && predicted[i] === 1) fp++;
    else if (actual[i] === 1 && predicted[i] === 0) fn++;
  }

  return { tp, tn, fp, fn };
}

export function accuracy(actual: number[], predicted: number[]): number {
  let correct = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === predicted[i]) correct++;
  }
  return correct / actual.length;
}

export function metricsFromMatrix(m: ConfusionMatrix) {
  const precision = m.tp + m.fp === 0 ? 0 : m.tp / (m.tp + m.fp);
  const recall = m.tp + m.fn === 0 ? 0 : m.tp / (m.tp + m.fn);
  const f1 =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}
