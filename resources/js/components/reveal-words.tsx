export function RevealWords({ text }: { text: string }) {
    return <span>{text.split(' ').map((word, index) => <span key={`${word}-${index}`} className="mr-[0.25em] inline-block animate-in fade-in slide-in-from-bottom-1 duration-500">{word}</span>)}</span>;
}
