import React, { useState } from 'react';
import { Visualizer } from './components/Visualizer';
import { MetricsChart } from './components/MetricsChart';
import { 
  Brain,
  Network,
  Zap,
  Settings,
  LineChart,
  BarChart
} from 'lucide-react';
import { NetworkConfig, ActivationFunction, Dataset, TrainingMetrics } from './types/neural';
import { 
  generateXORData, 
  generateCircleData, 
  generateSpiralData,
  generateMoonData
} from './data/datasets';

function App() {
  const [config, setConfig] = useState<NetworkConfig>({
    layers: [2, 4, 3, 1],
    learningRate: 0.1,
    activation: 'sigmoid',
    epoch: 0,
    batchSize: 32,
    momentum: 0.9
  });

  const [selectedDataset, setSelectedDataset] = useState<Dataset | undefined>();
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);

  const updateConfig = (updates: Partial<NetworkConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleMetricsUpdate = (newMetrics: TrainingMetrics) => {
    setMetrics(prev => [...prev, newMetrics].slice(-100)); // Keep last 100 metrics
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-500" />
              <h1 className="text-2xl font-bold">Neural Network Playground</h1>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Network Configuration</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-gray-400 mb-3">
                    <Network size={18} />
                    <span>Architecture</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Hidden Layers
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={config.layers.length - 2}
                        onChange={(e) => {
                          const count = parseInt(e.target.value);
                          const newLayers = [2];
                          for (let i = 0; i < count; i++) {
                            newLayers.push(4);
                          }
                          newLayers.push(1);
                          updateConfig({ layers: newLayers });
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-gray-400 mb-3">
                    <Zap size={18} />
                    <span>Training</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Learning Rate
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={config.learningRate * 100}
                        onChange={(e) => updateConfig({ 
                          learningRate: parseInt(e.target.value) / 100 
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">
                        {config.learningRate.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Batch Size
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="128"
                        value={config.batchSize}
                        onChange={(e) => updateConfig({ 
                          batchSize: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">
                        {config.batchSize}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Momentum
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.momentum * 100}
                        onChange={(e) => updateConfig({ 
                          momentum: parseInt(e.target.value) / 100 
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-400">
                        {config.momentum.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Activation Function
                      </label>
                      <select
                        value={config.activation}
                        onChange={(e) => updateConfig({ 
                          activation: e.target.value as ActivationFunction 
                        })}
                        className="w-full bg-gray-800 rounded-md px-3 py-2 text-white"
                      >
                        <option value="sigmoid">Sigmoid</option>
                        <option value="relu">ReLU</option>
                        <option value="tanh">Tanh</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-gray-400 mb-3">
                    <BarChart size={18} />
                    <span>Performance Metrics </span>
                  </h3>
                  <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Epoch</span>
                      <span className="text-sm font-medium">{config.epoch}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(config.epoch % 100)}%` }}
                      ></div>
                    </div>
                    {metrics.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Loss</span>
                          <span className="text-sm font-medium">
                            {metrics[metrics.length - 1].loss.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Accuracy</span>
                          <span className="text-sm font-medium">
                            {(metrics[metrics.length - 1].accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dataset Controls */}
            <div className="mt-6 bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Dataset</h2>
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedDataset(generateXORData())}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedDataset?.name === 'XOR Problem'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  XOR Problem
                </button>
                <button 
                  onClick={() => setSelectedDataset(generateCircleData())}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedDataset?.name === 'Circle Classification'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Circle Classification
                </button>
                <button 
                  onClick={() => setSelectedDataset(generateSpiralData())}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedDataset?.name === 'Spiral Classification'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Spiral Classification
                </button>
                <button 
                  onClick={() => setSelectedDataset(generateMoonData())}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedDataset?.name === 'Moon Classification'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Moon Classification
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9 space-y-8">
            <Visualizer 
              config={config}
              dataset={selectedDataset}
              onConfigChange={updateConfig}
              onMetricsUpdate={handleMetricsUpdate}
            />
            
            {/* Metrics Chart */}
            {metrics.length > 0 && (
              <MetricsChart metrics={metrics} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;