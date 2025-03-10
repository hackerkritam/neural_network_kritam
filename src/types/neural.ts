export interface Neuron {
  id: string;
  layer: number;
  position: number;
  value: number;
  bias: number;
  gradient: number;
  error: number;
  connections: Connection[];
}

export interface Connection {
  from: string;
  to: string;
  weight: number;
  signal: number;
  gradient: number;
}

export interface Layer {
  id: number;
  neurons: Neuron[];
}

export type ActivationFunction = 'sigmoid' | 'relu' | 'tanh';

export interface NetworkConfig {
  layers: number[];
  learningRate: number;
  activation: ActivationFunction;
  epoch: number;
  batchSize: number;
  momentum: number;
}

export interface DataPoint {
  input: number[];
  output: number[];
}

export interface Dataset {
  name: string;
  data: DataPoint[];
  description: string;
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
  epoch: number;
  validationLoss: number;
  validationAccuracy: number;
}