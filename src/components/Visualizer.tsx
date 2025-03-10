import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layer, Neuron, Connection, NetworkConfig, Dataset, TrainingMetrics } from '../types/neural';
import { Play, Pause, RotateCcw, Settings, Plus, Minus } from 'lucide-react';

interface VisualizerProps {
  config: NetworkConfig;
  dataset?: Dataset;
  onConfigChange: (config: NetworkConfig) => void;
  onMetricsUpdate: (metrics: TrainingMetrics) => void;
}

export const Visualizer: React.FC<VisualizerProps> = ({ 
  config, 
  dataset, 
  onConfigChange,
  onMetricsUpdate 
}) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    initializeNetwork();
  }, [config]);

  useEffect(() => {
    if (canvasRef.current) {
      drawNetwork();
    }
  }, [layers]);

  useEffect(() => {
    if (isTraining && dataset) {
      trainEpoch();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTraining, dataset]);

  const initializeNetwork = () => {
    const newLayers: Layer[] = [];
    
    config.layers.forEach((neurons, layerIndex) => {
      const layer: Layer = {
        id: layerIndex,
        neurons: Array.from({ length: neurons }, (_, i) => ({
          id: `${layerIndex}-${i}`,
          layer: layerIndex,
          position: i,
          value: Math.random(),
          bias: Math.random() * 2 - 1,
          gradient: 0,
          error: 0,
          connections: []
        }))
      };

      if (layerIndex > 0) {
        layer.neurons.forEach(neuron => {
          newLayers[layerIndex - 1].neurons.forEach(prevNeuron => {
            neuron.connections.push({
              from: prevNeuron.id,
              to: neuron.id,
              weight: Math.random() * 2 - 1,
              signal: 0,
              gradient: 0
            });
          });
        });
      }

      newLayers.push(layer);
    });

    setLayers(newLayers);
  };

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections with gradients
    layers.forEach((layer, layerIndex) => {
      if (layerIndex === 0) return;
      
      layer.neurons.forEach(neuron => {
        neuron.connections.forEach(conn => {
          const fromNeuron = findNeuron(conn.from);
          if (!fromNeuron) return;

          const startX = (layerIndex - 1) * (canvas.width / (layers.length - 1));
          const startY = fromNeuron.position * 80 + 60;
          const endX = layerIndex * (canvas.width / (layers.length - 1));
          const endY = neuron.position * 80 + 60;

          // Create gradient for backpropagation visualization
          const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
          gradient.addColorStop(0, `rgba(99, 102, 241, ${Math.abs(conn.weight)})`);
          gradient.addColorStop(1, `rgba(239, 68, 68, ${Math.abs(conn.gradient)})`);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.abs(conn.weight) * 3;
          ctx.stroke();

          // Draw signal flow
          if (conn.signal !== 0) {
            const signalPos = Math.sin(Date.now() / 1000) * 0.5 + 0.5;
            const signalX = startX + (endX - startX) * signalPos;
            const signalY = startY + (endY - startY) * signalPos;

            ctx.beginPath();
            ctx.arc(signalX, signalY, 4, 0, Math.PI * 2);
            ctx.fillStyle = conn.signal > 0 ? '#4ade80' : '#ef4444';
            ctx.fill();
          }
        });
      });
    });

    // Draw neurons with error visualization
    layers.forEach((layer, layerIndex) => {
      const x = layerIndex * (canvas.width / (layers.length - 1));
      
      layer.neurons.forEach(neuron => {
        const y = neuron.position * 80 + 60;

        // Draw error ring
        if (neuron.error !== 0) {
          ctx.beginPath();
          ctx.arc(x, y, 24, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${Math.abs(neuron.error)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw neuron
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${neuron.value})`;
        ctx.fill();
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw gradient visualization
        if (neuron.gradient !== 0) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2 * Math.abs(neuron.gradient));
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });

    animationRef.current = requestAnimationFrame(drawNetwork);
  };

  const findNeuron = (id: string): Neuron | undefined => {
    for (const layer of layers) {
      const neuron = layer.neurons.find(n => n.id === id);
      if (neuron) return neuron;
    }
  };

  const forwardPass = (input?: number[]) => {
    const newLayers = [...layers];
    
    // Set input values if provided
    if (input) {
      newLayers[0].neurons.forEach((neuron, i) => {
        neuron.value = input[i] || 0;
      });
    }

    // Forward propagation
    for (let i = 1; i < newLayers.length; i++) {
      newLayers[i].neurons.forEach(neuron => {
        let sum = neuron.bias;
        
        neuron.connections.forEach(conn => {
          const fromNeuron = findNeuron(conn.from);
          if (fromNeuron) {
            sum += fromNeuron.value * conn.weight;
            conn.signal = fromNeuron.value * conn.weight;
          }
        });

        // Apply activation function
        switch (config.activation) {
          case 'relu':
            neuron.value = Math.max(0, sum);
            break;
          case 'tanh':
            neuron.value = Math.tanh(sum);
            break;
          default: // sigmoid
            neuron.value = 1 / (1 + Math.exp(-sum));
        }
      });
    }

    setLayers(newLayers);
    return newLayers[newLayers.length - 1].neurons.map(n => n.value);
  };

  const backpropagate = (target: number[]) => {
    const newLayers = [...layers];
    
    // Calculate output layer error
    const outputLayer = newLayers[newLayers.length - 1];
    outputLayer.neurons.forEach((neuron, i) => {
      const error = target[i] - neuron.value;
      neuron.error = error;
      
      // Calculate gradient for output layer
      switch (config.activation) {
        case 'relu':
          neuron.gradient = neuron.value > 0 ? error : 0;
          break;
        case 'tanh':
          neuron.gradient = error * (1 - neuron.value * neuron.value);
          break;
        default: // sigmoid
          neuron.gradient = error * neuron.value * (1 - neuron.value);
      }
    });

    // Backpropagate error
    for (let i = newLayers.length - 2; i >= 0; i--) {
      newLayers[i].neurons.forEach(neuron => {
        let error = 0;
        
        // Calculate error from next layer
        newLayers[i + 1].neurons.forEach(nextNeuron => {
          nextNeuron.connections.forEach(conn => {
            if (conn.from === neuron.id) {
              error += nextNeuron.gradient * conn.weight;
              conn.gradient = nextNeuron.gradient * neuron.value;
            }
          });
        });

        neuron.error = error;
        
        // Calculate gradient
        switch (config.activation) {
          case 'relu':
            neuron.gradient = neuron.value > 0 ? error : 0;
            break;
          case 'tanh':
            neuron.gradient = error * (1 - neuron.value * neuron.value);
            break;
          default: // sigmoid
            neuron.gradient = error * neuron.value * (1 - neuron.value);
        }
      });
    }

    // Update weights and biases
    for (let i = 1; i < newLayers.length; i++) {
      newLayers[i].neurons.forEach(neuron => {
        neuron.bias += config.learningRate * neuron.gradient;
        
        neuron.connections.forEach(conn => {
          const fromNeuron = findNeuron(conn.from);
          if (fromNeuron) {
            conn.weight += config.learningRate * conn.gradient;
          }
        });
      });
    }

    setLayers(newLayers);
  };

  const trainEpoch = async () => {
    if (!dataset) return;

    let totalLoss = 0;
    let correctPredictions = 0;

    // Shuffle dataset
    const shuffledData = [...dataset.data]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.batchSize);

    // Train on batch
    for (const sample of shuffledData) {
      const prediction = forwardPass(sample.input);
      backpropagate(sample.output);

      // Calculate loss and accuracy
      const loss = sample.output.reduce((sum, target, i) => {
        return sum + Math.pow(target - prediction[i], 2);
      }, 0) / sample.output.length;

      totalLoss += loss;
      if (Math.abs(prediction[0] - sample.output[0]) < 0.5) {
        correctPredictions++;
      }
    }

    // Update metrics
    const metrics: TrainingMetrics = {
      loss: totalLoss / shuffledData.length,
      accuracy: correctPredictions / shuffledData.length,
      epoch: currentEpoch,
      validationLoss: totalLoss / shuffledData.length * 1.1, // Simulated validation loss
      validationAccuracy: correctPredictions / shuffledData.length * 0.95 // Simulated validation accuracy
    };

    onMetricsUpdate(metrics);
    setCurrentEpoch(prev => prev + 1);

    if (isTraining) {
      requestAnimationFrame(trainEpoch);
    }
  };

  const handleAddNeuron = (layerIndex: number) => {
    if (layerIndex === 0 || layerIndex === layers.length - 1) return;

    const newLayers = [...layers];
    const layer = newLayers[layerIndex];
    
    const newNeuron: Neuron = {
      id: `${layerIndex}-${layer.neurons.length}`,
      layer: layerIndex,
      position: layer.neurons.length,
      value: Math.random(),
      bias: Math.random() * 2 - 1,
      gradient: 0,
      error: 0,
      connections: []
    };

    // Connect to previous layer
    newLayers[layerIndex - 1].neurons.forEach(prevNeuron => {
      newNeuron.connections.push({
        from: prevNeuron.id,
        to: newNeuron.id,
        weight: Math.random() * 2 - 1,
        signal: 0,
        gradient: 0
      });
    });

    // Connect to next layer
    if (layerIndex < newLayers.length - 1) {
      newLayers[layerIndex + 1].neurons.forEach(nextNeuron => {
        nextNeuron.connections.push({
          from: newNeuron.id,
          to: nextNeuron.id,
          weight: Math.random() * 2 - 1,
          signal: 0,
          gradient: 0
        });
      });
    }

    layer.neurons.push(newNeuron);
    setLayers(newLayers);
  };

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Neural Network Visualization</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setIsTraining(!isTraining)}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isTraining ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={initializeNetwork}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <RotateCcw size={24} />
          </button>
          <button
            onClick={() => forwardPass()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Forward Pass
          </button>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-gray-950 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full"
        />
        
        {/* Layer controls */}
        <div className="absolute top-4 left-0 right-0 flex justify-around">
          {layers.map((layer, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-gray-400 text-sm mb-2">Layer {i}</span>
              {i > 0 && i < layers.length - 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddNeuron(i)}
                    className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};