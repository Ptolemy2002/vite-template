import { Example, useBasicCounter } from "@local/lib";

function App() {
  const { count, setCount } = useBasicCounter();

  return (
    <>
      <Example />
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
