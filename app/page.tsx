 'use client';

import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Calendar, Trophy, Trash2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
}

interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
}

const COMMON_EXERCISES = [
  'Bench Press', 'Squats', 'Deadlift', 'Pull-ups', 'Push-ups',
  'Shoulder Press', 'Barbell Row', 'Bicep Curl', 'Tricep Extension',
  'Leg Press', 'Lunges', 'Lat Pulldown'
];

export default function GymTracker() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gymWorkouts');
    if (saved) setWorkouts(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('gymWorkouts', JSON.stringify(workouts));
  }, [workouts]);

  const addExercise = () => {
    const name = customExercise || selectedExercise;
    if (!name) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [{ reps: 8, weight: 60 }]
    };

    setCurrentWorkout([...currentWorkout, newExercise]);
    setSelectedExercise('');
    setCustomExercise('');
  };

  const addSet = (exerciseId: string) => {
    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, { reps: 8, weight: 60 }]
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setCurrentWorkout(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((_, i) => i !== setIndex)
        };
      }
      return ex;
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentWorkout(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const saveWorkout = () => {
    if (currentWorkout.length === 0) return;

    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: currentWorkout
    };

    setWorkouts([newWorkout, ...workouts]);
    setCurrentWorkout([]);
    alert('¡Entrenamiento guardado! 💪');
  };

  const deleteWorkout = (id: string) => {
    if (confirm('¿Borrar este entrenamiento?')) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
    }
  };

  const totalVolume = workouts.reduce((sum, workout) => {
    return sum + workout.exercises.reduce((exSum, ex) => {
      return exSum + ex.sets.reduce((setSum, set) => {
        return setSum + (set.reps * set.weight);
      }, 0);
    }, 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-10 h-10 text-orange-500" />
          <h1 className="text-4xl font-bold">Gym Tracker</h1>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl"
        >
          <Calendar className="w-5 h-5" />
          {showHistory ? 'Nuevo Entreno' : 'Historial'}
        </button>
      </div>

      {!showHistory ? (
        <div>
          {/* Current Workout */}
          <div className="bg-zinc-900 rounded-3xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6" /> Entrenamiento Actual
            </h2>

            <div className="flex gap-3 mb-6">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-zinc-800 text-white rounded-xl px-4 py-3 flex-1"
              >
                <option value="">Elegir ejercicio común...</option>
                {COMMON_EXERCISES.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="O escribir nuevo..."
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                className="bg-zinc-800 text-white rounded-xl px-4 py-3 flex-1"
              />

              <button
                onClick={addExercise}
                className="bg-orange-600 hover:bg-orange-500 px-6 rounded-xl font-medium"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-4">
              {currentWorkout.map((exercise, exIndex) => (
                <div key={exercise.id} className="bg-zinc-800 rounded-2xl p-5 gym-card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{exercise.name}</h3>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex gap-3 items-center bg-zinc-900 p-3 rounded-xl">
                        <span className="text-zinc-400 w-6">Serie {setIndex + 1}</span>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 w-20 text-center rounded-lg py-2"
                          placeholder="Reps"
                        />
                        <span className="text-zinc-400">x</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseInt(e.target.value) || 0)}
                          className="bg-zinc-800 w-24 text-center rounded-lg py-2"
                          placeholder="Kg"
                        />
                        <button
                          onClick={() => removeSet(exercise.id, setIndex)}
                          className="ml-auto text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSet(exercise.id)}
                    className="mt-3 text-orange-500 hover:text-orange-400 text-sm flex items-center gap-1"
                  >
                    + Agregar serie
                  </button>
                </div>
              ))}
            </div>

            {currentWorkout.length > 0 && (
              <button
                onClick={saveWorkout}
                className="w-full mt-8 bg-green-600 hover:bg-green-500 py-4 rounded-2xl text-xl font-semibold flex items-center justify-center gap-2"
              >
                <Trophy className="w-6 h-6" />
                GUARDAR ENTRENAMIENTO
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-6">Historial de Entrenamientos</h2>
          
          <div className="mb-6 text-center">
            <div className="text-5xl font-bold text-orange-500">{workouts.length}</div>
            <div className="text-zinc-400">entrenamientos totales</div>
            <div className="text-sm text-zinc-500 mt-1">Volumen total: {totalVolume.toLocaleString()} kg</div>
          </div>

          <div className="space-y-4">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-zinc-800 rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <div className="text-lg font-medium">
                    {new Date(workout.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {workout.exercises.map(ex => (
                    <div key={ex.id} className="text-sm">
                      <span className="font-medium">{ex.name}</span> — 
                      {ex.sets.map((set, i) => (
                        <span key={i} className="text-zinc-400">
                          {set.reps}×{set.weight}kg {i < ex.sets.length - 1 ? '• ' : ''}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {workouts.length === 0 && (
              <p className="text-center text-zinc-500 py-12">Aún no hay entrenamientos guardados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
