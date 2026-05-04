'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { increment, decrement, incrementByAmount } from '@/redux/features/counter/counterSlice';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';

export default function Home() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState(2);

  const handleIncrement = () => {
    dispatch(increment());
    toast.success('Incremented!');
  };

  const handleDecrement = () => {
    dispatch(decrement());
    toast.success('Decremented!');
  };

  const handleAddAmount = () => {
    dispatch(incrementByAmount(amount));
    toast.success(`Added ${amount}!`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-2xl">Redux Counter</CardTitle>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
          <CardDescription>
            Test Redux Toolkit with shadcn/ui components
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <div className="text-6xl font-bold tabular-nums">{count}</div>
          </div>

          <Separator />

          {/* Buttons Group */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrement}
            >
              <Minus className="h-4 w-4 mr-2" />
              Decrement
            </Button>
            <Button
              size="lg"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4 mr-2" />
              Increment
            </Button>
          </div>

          <Separator />

          {/* Add Amount */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Add Custom Amount</p>
            <div className="flex gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="text-center text-lg"
                min={1}
                max={100}
              />
              <Button
                variant="secondary"
                onClick={handleAddAmount}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Open Redux DevTools to see state changes
        </CardFooter>
      </Card>
    </main>
  );
}