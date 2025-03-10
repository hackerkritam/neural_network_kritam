import { Dataset } from '../types/neural';

export const generateXORData = (): Dataset => ({
  name: 'XOR Problem',
  description: 'Learn the XOR logical operation',
  data: [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] }
  ]
});

export const generateCircleData = (points: number = 1000): Dataset => {
  const data: Dataset['data'] = [];
  for (let i = 0; i < points; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const distance = Math.sqrt(x * x + y * y);
    data.push({
      input: [x, y],
      output: [distance <= 0.5 ? 1 : 0]
    });
  }
  return {
    name: 'Circle Classification',
    description: 'Classify points inside/outside a circle',
    data
  };
};

export const generateSpiralData = (points: number = 1000): Dataset => {
  const data: Dataset['data'] = [];
  const n = points / 2;

  for (let i = 0; i < n; i++) {
    const r = i / n * 5;
    const t = 1.75 * i / n * 2 * Math.PI + Math.random() * 0.2;
    
    // Generate two spiral classes
    data.push({
      input: [r * Math.sin(t), r * Math.cos(t)],
      output: [1, 0]
    });
    data.push({
      input: [r * Math.sin(t + Math.PI), r * Math.cos(t + Math.PI)],
      output: [0, 1]
    });
  }
  
  return {
    name: 'Spiral Classification',
    description: 'Classify points belonging to two interleaved spirals',
    data
  };
};

export const generateMoonData = (points: number = 1000): Dataset => {
  const data: Dataset['data'] = [];
  for (let i = 0; i < points; i++) {
    const t = Math.random() * Math.PI;
    const r = 1 + Math.random() * 0.2;
    
    if (Math.random() > 0.5) {
      data.push({
        input: [r * Math.cos(t), r * Math.sin(t)],
        output: [1]
      });
    } else {
      data.push({
        input: [-r * Math.cos(t) + 1, -r * Math.sin(t) + 0.5],
        output: [0]
      });
    }
  }
  
  return {
    name: 'Moon Classification',
    description: 'Classify points belonging to two crescent moon shapes',
    data
  };
};