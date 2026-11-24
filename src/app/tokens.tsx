// One line of syntax-coloured code from [text, colour] pairs. Plain markup, no highlighter,
// so it works in a server component and a client component alike.
export type Pair = [string, string]

export function Tokens({ line }: { line: Pair[] }) {
  if (line.length === 0) return <>{' '}</>
  return (
    <>
      {line.map(([text, color], j) => (
        <span key={j} style={{ color }}>
          {text}
        </span>
      ))}
    </>
  )
}
