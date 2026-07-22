import { CountVectorizer } from "./features";

function sigmoid(z: number): number {
  if (z >= 0) {
    const x = Math.exp(-z);
    return 1 / (1 + x);
  }
  const x = Math.exp(z);
  return x / (1 + x);
}

export class LogisticRegressionModel {
  weights: number[] = [];
  bias = 0;
  vectorizer = new CountVectorizer(200);

  constructor(
    private learningRate = 0.1,
    private epochs = 300,
    private lambda = 0.01
  ) {}

  fit(texts: string[], labels: number[]) {
    this.vectorizer.fit(texts);
    const X = this.vectorizer.transform(texts);
    const nSamples = X.length;
    const nFeatures = X[0].length;

    this.weights = new Array(nFeatures).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let dw = new Array(nFeatures).fill(0);
      let db = 0;

      for (let i = 0; i < nSamples; i++) {
        const z =
          X[i].reduce((sum, xi, j) => sum + xi * this.weights[j], 0) + this.bias;
        const pred = sigmoid(z);
        const error = pred - labels[i];

        for (let j = 0; j < nFeatures; j++) {
          dw[j] += error * X[i][j];
        }
        db += error;
      }

      for (let j = 0; j < nFeatures; j++) {
        dw[j] = dw[j] / nSamples + (this.lambda * this.weights[j]) / nSamples;
        this.weights[j] -= this.learningRate * dw[j];
      }
      this.bias -= this.learningRate * (db / nSamples);
    }
  }

  predictProba(texts: string[]): number[] {
    return texts.map((text) => {
      const x = this.vectorizer.transformOne(text);
      const z =
        x.reduce((sum, xi, j) => sum + xi * this.weights[j], 0) + this.bias;
      return sigmoid(z);
    });
  }

  predict(texts: string[]): number[] {
    return this.predictProba(texts).map((p) => (p >= 0.5 ? 1 : 0));
  }

  getTopFeatures(n = 10): { name: string; weight: number }[] {
    const names = this.vectorizer.getFeatureNames();
    return this.weights
      .map((w, i) => ({ name: names[i] ?? `feat_${i}`, weight: w }))
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, n);
  }
}
