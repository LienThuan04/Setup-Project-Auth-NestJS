'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { increment, decrement, incrementByAmount } from '@/redux/features/counter/counterSlice';
import { useState } from 'react';

export default function Home() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState(2);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1 className="text-4xl font-bold mb-8">Redux Toolkit Counter</h1>
      
      <div className="text-6xl font-bold mb-8">{count}</div>
      
      <div className="flex gap-4">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl"
          onClick={() => dispatch(decrement())}
        >
          - Decrement
        </button>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl"
          onClick={() => dispatch(increment())}
        >
          + Increment
        </button>
      </div>
      
      <div className="flex gap-4 mt-4 items-center">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border rounded px-3 py-2 text-xl w-24 text-center"
        />
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xl"
          onClick={() => dispatch(incrementByAmount(amount))}
        >
          Add Amount
        </button>
      </div>
    </main>
  );
}