import { useState } from "react";

export function Example() {
  return (
    <p>
        This is an example.
    </p>
  );
}

export function useBasicCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}